import { useState, useEffect, useRef } from 'react'
import { fetchAllGames, type GameData } from '@/lib/espnApi'
import { playEventSound, type EventType, type TeamType } from '@/lib/audioPlayer'
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

export function useGameMonitor(alertSettings: AlertSettings) {
  const [games, setGames] = useState<GameData[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const previousGames = useRef<Map<string, GameData>>(new Map())
  const processedPlays = useRef<Set<string>>(new Set())
  const retryCount = useRef<number>(0)
  const maxRetries = 3
  const baseInterval = 5000 // 5 seconds for live games
  const nonLiveInterval = 15000 // 15 seconds for non-live games

  const detectEvents = (current: GameData, previous: GameData | undefined): GameEvent[] => {
    if (!previous) return []
    
    const events: GameEvent[] = []
    const myTeam = current.team === 'falcons' ? 'Falcons' : 'Bulldogs'
    const myScore = current.isHome ? current.homeScore : current.awayScore
    const oppScore = current.isHome ? current.awayScore : current.homeScore
    const prevMyScore = previous.isHome ? previous.homeScore : previous.awayScore
    const prevOppScore = previous.isHome ? previous.awayScore : previous.homeScore
    
    const scoreDiff = myScore - prevMyScore
    const playKey = `${current.id}-${current.lastPlay}-${myScore}-${oppScore}`
    
    if (processedPlays.current.has(playKey)) {
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
      } else if (scoreDiff === 3) {
        events.push({
          type: 'fieldGoal',
          description: `${myTeam} Field Goal!`,
          team: current.team
        })
      } else if (scoreDiff === 2) {
        events.push({
          type: 'safety',
          description: `${myTeam} SAFETY!`,
          team: current.team
        })
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
      }
    }
    
    return events
  }

  const handleEvents = (events: GameEvent[]) => {
    events.forEach(event => {
      if (alertSettings[event.type]) {
        playEventSound(event.type, event.team)
        toast(event.description, {
          duration: 3000,
          className: event.type === 'touchdown' || event.type === 'safety' ? 
            'bg-accent text-accent-foreground font-bold' : 
            'bg-card text-card-foreground'
        })
      }
    })
  }

  const pollGames = async (isRetry = false) => {
    try {
      const currentGames = await fetchAllGames()
      
      currentGames.forEach(game => {
        const previous = previousGames.current.get(game.id)
        const events = detectEvents(game, previous)
        handleEvents(events)
        previousGames.current.set(game.id, game)
      })
      
      setGames(currentGames)
      setIsConnected(true)
      setLastUpdate(new Date())
      retryCount.current = 0 // Reset retry count on success
      
      console.log(`[${new Date().toISOString()}] Score update successful - Games:`, currentGames.length)
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Polling error (attempt ${retryCount.current + 1}/${maxRetries}):`, error)
      setIsConnected(false)
      
      // Retry with exponential backoff
      if (retryCount.current < maxRetries && !isRetry) {
        retryCount.current++
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount.current), 10000)
        console.log(`[${new Date().toISOString()}] Retrying in ${backoffDelay}ms...`)
        setTimeout(() => pollGames(true), backoffDelay)
      }
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    // Initial poll
    pollGames()
    
    // Determine if any game is live
    const hasLiveGame = () => games.some(game => game.status === 'in')
    
    // Set up polling interval based on game status
    const setupInterval = () => {
      if (intervalId) clearInterval(intervalId)
      const interval = hasLiveGame() ? baseInterval : nonLiveInterval
      console.log(`[${new Date().toISOString()}] Setting polling interval to ${interval}ms (${hasLiveGame() ? 'LIVE' : 'NON-LIVE'})`)
      intervalId = setInterval(pollGames, interval)
    }
    
    setupInterval()
    
    // Handle page visibility changes to prevent throttling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(`[${new Date().toISOString()}] Tab hidden - polling continues in background`)
      } else {
        console.log(`[${new Date().toISOString()}] Tab visible - polling immediately`)
        pollGames() // Poll immediately when tab becomes visible
        setupInterval() // Reset interval
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [alertSettings, games])

  return { games, isConnected, lastUpdate }
}