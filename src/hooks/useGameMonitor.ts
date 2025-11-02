import { useState, useEffect, useRef } from 'react'
import { fetchAllGames, type GameData } from '@/lib/espnApi'
import { playEventSound, type EventType, type TeamType } from '@/lib/audioPlayer'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

export interface AlertSettings {
  touchdown: boolean
  fieldGoal: boolean
  firstDown: boolean
  safety: boolean
  opponentThirdLong: boolean
}

interface GameEvent {
  type: EventType
  description: string
  team: TeamType
}

export interface MonitorMetrics {
  totalPolls: number
  successfulPolls: number
  failedPolls: number
  lastSuccessTime?: Date
  lastFailureTime?: Date
  consecutiveFailures: number
}

export function useGameMonitor(alertSettings: AlertSettings) {
  const [games, setGames] = useState<GameData[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [metrics, setMetrics] = useState<MonitorMetrics>({
    totalPolls: 0,
    successfulPolls: 0,
    failedPolls: 0,
    consecutiveFailures: 0
  })
  const previousGames = useRef<Map<string, GameData>>(new Map())
  const processedPlays = useRef<Set<string>>(new Set())
  const pollInterval = useRef<number>(15000) // Dynamic polling interval

  const detectEvents = (current: GameData, previous: GameData | undefined): GameEvent[] => {
    if (!previous) {
      logger.debug('No previous game state, skipping event detection', { gameId: current.id })
      return []
    }
    
    const events: GameEvent[] = []
    const myTeam = current.team === 'falcons' ? 'Falcons' : 'Bulldogs'
    const myScore = current.isHome ? current.homeScore : current.awayScore
    const oppScore = current.isHome ? current.awayScore : current.homeScore
    const prevMyScore = previous.isHome ? previous.homeScore : previous.awayScore
    const prevOppScore = previous.isHome ? previous.awayScore : previous.homeScore
    
    const scoreDiff = myScore - prevMyScore
    const playKey = `${current.id}-${current.lastPlay}-${myScore}-${oppScore}`
    
    logger.debug('Detecting events', {
      gameId: current.id,
      team: current.team,
      scoreDiff,
      currentScore: `${myScore}-${oppScore}`,
      previousScore: `${prevMyScore}-${prevOppScore}`,
      playKey
    })
    
    if (processedPlays.current.has(playKey)) {
      logger.debug('Play already processed, skipping', { playKey })
      return events
    }
    
    if (scoreDiff > 0 && current.lastPlay !== previous.lastPlay) {
      processedPlays.current.add(playKey)
      
      if (scoreDiff === 6) {
        events.push({
          type: 'touchdown',
          description: `${myTeam} TOUCHDOWN!`,
          team: current.team
        })
        logger.info('Touchdown detected', { team: myTeam, score: myScore })
      } else if (scoreDiff === 3) {
        events.push({
          type: 'fieldGoal',
          description: `${myTeam} Field Goal!`,
          team: current.team
        })
        logger.info('Field goal detected', { team: myTeam, score: myScore })
      } else if (scoreDiff === 2) {
        events.push({
          type: 'safety',
          description: `${myTeam} SAFETY!`,
          team: current.team
        })
        logger.info('Safety detected', { team: myTeam, score: myScore })
      }
    }
    
    if (current.down === 1 && previous.down >= 2 && current.lastPlay !== previous.lastPlay) {
      const newPlayKey = `${current.id}-firstdown-${current.lastPlay}`
      if (!processedPlays.current.has(newPlayKey)) {
        processedPlays.current.add(newPlayKey)
        events.push({
          type: 'firstDown',
          description: `${myTeam} First Down!`,
          team: current.team
        })
        logger.info('First down detected', { team: myTeam })
      }
    }
    
    const oppHasBall = current.isHome ? 
      current.possession === current.awayTeam : 
      current.possession === current.homeTeam
    
    if (oppHasBall && current.down === 3 && current.distance >= 7) {
      const thirdLongKey = `${current.id}-3rdlong-${current.clock}-${current.yardline}`
      if (!processedPlays.current.has(thirdLongKey) && previous.down !== 3) {
        processedPlays.current.add(thirdLongKey)
        events.push({
          type: 'opponentThirdLong',
          description: `Opponent 3rd & ${current.distance}`,
          team: current.team
        })
        logger.info('Opponent third and long detected', { team: myTeam, distance: current.distance })
      }
    }
    
    if (events.length > 0) {
      logger.info('Events detected', { 
        gameId: current.id,
        eventCount: events.length,
        eventTypes: events.map(e => e.type)
      })
    }
    
    return events
  }

  const handleEvents = (events: GameEvent[]) => {
    events.forEach(event => {
      if (alertSettings[event.type]) {
        logger.info('Triggering alert', { 
          eventType: event.type, 
          description: event.description,
          team: event.team 
        })
        playEventSound(event.type, event.team).catch(error => {
          logger.error('Failed to play event sound', error as Error, {
            eventType: event.type,
            team: event.team
          })
        })
        toast(event.description, {
          duration: 3000,
          className: event.type === 'touchdown' || event.type === 'safety' ? 
            'bg-accent text-accent-foreground font-bold' : 
            'bg-card text-card-foreground'
        })
      } else {
        logger.debug('Alert skipped (disabled in settings)', { 
          eventType: event.type,
          description: event.description 
        })
      }
    })
  }

  const pollGames = async () => {
    const pollStartTime = Date.now()
    logger.info('Starting game poll', { 
      pollInterval: pollInterval.current,
      consecutiveFailures: metrics.consecutiveFailures
    })
    
    try {
      const currentGames = await fetchAllGames()
      
      logger.debug('Processing game data', { gameCount: currentGames.length })
      
      currentGames.forEach(game => {
        const previous = previousGames.current.get(game.id)
        const events = detectEvents(game, previous)
        handleEvents(events)
        previousGames.current.set(game.id, game)
      })
      
      setGames(currentGames)
      setIsConnected(true)
      setLastUpdate(new Date())
      
      // Update metrics on success
      setMetrics(prev => ({
        totalPolls: prev.totalPolls + 1,
        successfulPolls: prev.successfulPolls + 1,
        failedPolls: prev.failedPolls,
        lastSuccessTime: new Date(),
        lastFailureTime: prev.lastFailureTime,
        consecutiveFailures: 0
      }))
      
      // Reset poll interval on success
      if (pollInterval.current !== 15000) {
        logger.info('Resetting poll interval to normal', { interval: 15000 })
        pollInterval.current = 15000
      }
      
      const pollDuration = Date.now() - pollStartTime
      logger.info('Game poll completed successfully', { 
        duration: pollDuration,
        gameCount: currentGames.length
      })
    } catch (error) {
      const pollDuration = Date.now() - pollStartTime
      logger.error('Game poll failed', error as Error, { 
        duration: pollDuration,
        consecutiveFailures: metrics.consecutiveFailures + 1
      })
      
      setIsConnected(false)
      
      // Update metrics on failure
      setMetrics(prev => {
        const newConsecutiveFailures = prev.consecutiveFailures + 1
        
        // Implement exponential backoff for consecutive failures
        if (newConsecutiveFailures >= 3) {
          pollInterval.current = Math.min(60000, 15000 * Math.pow(2, newConsecutiveFailures - 2))
          logger.warn('Increasing poll interval due to consecutive failures', {
            consecutiveFailures: newConsecutiveFailures,
            newInterval: pollInterval.current
          })
        }
        
        return {
          totalPolls: prev.totalPolls + 1,
          successfulPolls: prev.successfulPolls,
          failedPolls: prev.failedPolls + 1,
          lastSuccessTime: prev.lastSuccessTime,
          lastFailureTime: new Date(),
          consecutiveFailures: newConsecutiveFailures
        }
      })
    }
  }

  useEffect(() => {
    logger.info('Starting game monitor', { 
      alertSettings: Object.keys(alertSettings).filter(k => alertSettings[k as keyof AlertSettings])
    })
    
    pollGames()
    
    // Use a timeout-based approach to allow dynamic polling intervals
    let timeoutId: number | undefined
    
    const scheduleNextPoll = () => {
      timeoutId = window.setTimeout(() => {
        pollGames().finally(() => {
          scheduleNextPoll()
        })
      }, pollInterval.current)
    }
    
    scheduleNextPoll()
    
    return () => {
      logger.info('Stopping game monitor')
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }
  }, [alertSettings])

  return { games, isConnected, lastUpdate, metrics }
}
