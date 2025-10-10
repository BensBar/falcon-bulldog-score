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

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function fetchFalconsGame(): Promise<GameData | null> {
  try {
    const response = await fetchWithTimeout(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${FALCONS_TEAM_ID}/schedule`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    const currentGame = data.events?.find((event: any) => {
      const status = event.competitions?.[0]?.status?.type?.state
      return status === 'in' || status === 'pre'
    })
    
    if (!currentGame) return null
    
    const competition = currentGame.competitions[0]
    const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home')
    const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away')
    const isHome = homeTeam.team.abbreviation === FALCONS_TEAM_ID.toUpperCase()
    
    const situation = competition.situation || {}
    const status = competition.status
    
    return {
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
  } catch (error) {
    console.error('Error fetching Falcons game:', error)
    return null
  }
}

export async function fetchBulldogsGame(): Promise<GameData | null> {
  try {
    const response = await fetchWithTimeout(
      `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${BULLDOGS_TEAM_ID}/schedule`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    const currentGame = data.events?.find((event: any) => {
      const status = event.competitions?.[0]?.status?.type?.state
      return status === 'in' || status === 'pre'
    })
    
    if (!currentGame) return null
    
    const competition = currentGame.competitions[0]
    const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home')
    const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away')
    const isHome = homeTeam.team.slug === BULLDOGS_TEAM_ID
    
    const situation = competition.situation || {}
    const status = competition.status
    
    return {
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
  } catch (error) {
    console.error('Error fetching Bulldogs game:', error)
    return null
  }
}

export async function fetchAllGames(): Promise<GameData[]> {
  const [falcons, bulldogs] = await Promise.all([
    fetchFalconsGame(),
    fetchBulldogsGame()
  ])
  
  return [falcons, bulldogs].filter((g): g is GameData => g !== null)
}
