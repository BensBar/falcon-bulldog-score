import { logger } from './logger'
import { withRetry, isRetryableError } from './retry'

export interface GameData {
  id: string
  team: 'falcons' | 'bulldogs'
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  quarter: string
  clock: string
  possession: string
  down: number
  distance: number
  yardline: string
  lastPlay: string
  isHome: boolean
}

const FALCONS_TEAM_ID = 'atl'
const BULLDOGS_TEAM_ID = 'georgia'
const DEFAULT_TIMEOUT = 10000
const RETRY_MAX_ATTEMPTS = 3

async function fetchWithTimeout(url: string, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    logger.debug('Fetching URL with timeout', { url, timeout })
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    logger.debug('Fetch completed', { 
      url, 
      status: response.status, 
      ok: response.ok 
    })
    
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    logger.error('Fetch failed', error as Error, { url })
    throw error
  }
}

export async function fetchFalconsGame(): Promise<GameData | null> {
  return withRetry(
    async () => {
      logger.info('Fetching Falcons game data')
      
      const response = await fetchWithTimeout(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${FALCONS_TEAM_ID}/schedule`
      )
      
      if (!response.ok) {
        logger.warn('Falcons API response not OK', { status: response.status })
        return null
      }
      
      const data = await response.json()
      
      const currentGame = data.events?.find((event: any) => {
        const status = event.competitions?.[0]?.status?.type?.state
        return status === 'in' || status === 'pre'
      })
      
      if (!currentGame) {
        logger.info('No active or upcoming Falcons game found')
        return null
      }
      
      const competition = currentGame.competitions[0]
      const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home')
      const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away')
      const isHome = homeTeam.team.abbreviation === FALCONS_TEAM_ID.toUpperCase()
      
      const situation = competition.situation || {}
      const status = competition.status
      
      const gameData: GameData = {
        id: currentGame.id,
        team: 'falcons',
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        homeScore: parseInt(homeTeam.score || '0'),
        awayScore: parseInt(awayTeam.score || '0'),
        status: status.type.state,
        quarter: status.period ? `Q${status.period}` : 'PRE',
        clock: status.displayClock || '0:00',
        possession: situation.possession || '',
        down: situation.down || 0,
        distance: situation.distance || 0,
        yardline: situation.yardLine ? `${situation.yardLine}` : '',
        lastPlay: situation.lastPlay?.text || '',
        isHome
      }
      
      logger.info('Falcons game data fetched successfully', {
        gameId: gameData.id,
        status: gameData.status,
        score: `${gameData.homeScore}-${gameData.awayScore}`
      })
      
      return gameData
    },
    'fetchFalconsGame',
    {
      maxRetries: RETRY_MAX_ATTEMPTS,
      shouldRetry: (error, attempt) => isRetryableError(error)
    }
  ).catch((error) => {
    logger.error('Failed to fetch Falcons game after all retries', error)
    return null
  })
}

export async function fetchBulldogsGame(): Promise<GameData | null> {
  return withRetry(
    async () => {
      logger.info('Fetching Bulldogs game data')
      
      const response = await fetchWithTimeout(
        `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${BULLDOGS_TEAM_ID}/schedule`
      )
      
      if (!response.ok) {
        logger.warn('Bulldogs API response not OK', { status: response.status })
        return null
      }
      
      const data = await response.json()
      
      const currentGame = data.events?.find((event: any) => {
        const status = event.competitions?.[0]?.status?.type?.state
        return status === 'in' || status === 'pre'
      })
      
      if (!currentGame) {
        logger.info('No active or upcoming Bulldogs game found')
        return null
      }
      
      const competition = currentGame.competitions[0]
      const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home')
      const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away')
      const isHome = homeTeam.team.slug === BULLDOGS_TEAM_ID
      
      const situation = competition.situation || {}
      const status = competition.status
      
      const gameData: GameData = {
        id: currentGame.id,
        team: 'bulldogs',
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        homeScore: parseInt(homeTeam.score || '0'),
        awayScore: parseInt(awayTeam.score || '0'),
        status: status.type.state,
        quarter: status.period ? `Q${status.period}` : 'PRE',
        clock: status.displayClock || '0:00',
        possession: situation.possession || '',
        down: situation.down || 0,
        distance: situation.distance || 0,
        yardline: situation.yardLine ? `${situation.yardLine}` : '',
        lastPlay: situation.lastPlay?.text || '',
        isHome
      }
      
      logger.info('Bulldogs game data fetched successfully', {
        gameId: gameData.id,
        status: gameData.status,
        score: `${gameData.homeScore}-${gameData.awayScore}`
      })
      
      return gameData
    },
    'fetchBulldogsGame',
    {
      maxRetries: RETRY_MAX_ATTEMPTS,
      shouldRetry: (error, attempt) => isRetryableError(error)
    }
  ).catch((error) => {
    logger.error('Failed to fetch Bulldogs game after all retries', error)
    return null
  })
}

export async function fetchAllGames(): Promise<GameData[]> {
  logger.info('Fetching all games')
  
  const [falcons, bulldogs] = await Promise.all([
    fetchFalconsGame(),
    fetchBulldogsGame()
  ])
  
  const games = [falcons, bulldogs].filter((g): g is GameData => g !== null)
  
  logger.info('All games fetched', { 
    totalGames: games.length,
    teams: games.map(g => g.team)
  })
  
  return games
}
