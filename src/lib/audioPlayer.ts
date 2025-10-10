export type EventType = 'touchdown' | 'fieldGoal' | 'firstDown' | 'safety' | 'opponentThirdLong'
export type TeamType = 'falcons' | 'bulldogs'

const audioContext = typeof window !== 'undefined' ? new AudioContext() : null
const audioCache = new Map<string, HTMLAudioElement>()
const audioFileMap: Record<EventType, string[]> = {
  touchdown: ['touchdown.mp3', 'touchdown.wav', 'touchdown.ogg', 'touchdown.m4a'],
  fieldGoal: ['field-goal.mp3', 'field-goal.wav', 'field-goal.ogg', 'field-goal.m4a'],
  firstDown: ['first-down.mp3', 'first-down.wav', 'first-down.ogg', 'first-down.m4a'],
  safety: ['safety.mp3', 'safety.wav', 'safety.ogg', 'safety.m4a'],
  opponentThirdLong: ['opponent-third-long.mp3', 'opponent-third-long.wav', 'opponent-third-long.ogg', 'opponent-third-long.m4a']
}

function getCacheKey(eventType: EventType, team?: TeamType): string {
  return team ? `${team}-${eventType}` : eventType
}

async function loadAudioFile(eventType: EventType, team?: TeamType): Promise<HTMLAudioElement | null> {
  const cacheKey = getCacheKey(eventType, team)
  
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!
  }

  const extensions = ['.mp3', '.wav', '.ogg', '.m4a']
  const filenameBases: string[] = []
  
  if (team) {
    filenameBases.push(`${team}-${eventType}`)
    filenameBases.push(`${team === 'bulldogs' ? 'uga' : team}-${eventType}`)
  }
  
  const genericBase = eventType === 'fieldGoal' ? 'field-goal' : 
                      eventType === 'firstDown' ? 'first-down' :
                      eventType === 'opponentThirdLong' ? 'opponent-third-long' :
                      eventType
  filenameBases.push(genericBase)
  
  for (const base of filenameBases) {
    for (const ext of extensions) {
      try {
        const filename = base + ext
        const module = await import(`@/assets/audio/${filename}`)
        const audio = new Audio(module.default)
        audio.volume = 0.7
        audioCache.set(cacheKey, audio)
        return audio
      } catch {
        continue
      }
    }
  }
  
  return null
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}

function playChord(frequencies: number[], duration: number) {
  frequencies.forEach(freq => playTone(freq, duration))
}

function playSynthesizedSound(eventType: EventType) {
  if (!audioContext) return

  switch (eventType) {
    case 'touchdown':
      playChord([523.25, 659.25, 783.99], 0.3)
      setTimeout(() => playChord([659.25, 783.99, 987.77], 0.4), 300)
      break
    
    case 'fieldGoal':
      playTone(659.25, 0.2, 'triangle')
      setTimeout(() => playTone(783.99, 0.3, 'triangle'), 200)
      break
    
    case 'firstDown':
      playTone(440, 0.15, 'square')
      break
    
    case 'safety':
      playChord([392, 523.25, 659.25], 0.4)
      setTimeout(() => playChord([523.25, 659.25, 783.99], 0.5), 400)
      break
    
    case 'opponentThirdLong':
      playTone(220, 0.2, 'sawtooth')
      setTimeout(() => playTone(196, 0.2, 'sawtooth'), 200)
      break
  }
}

export async function playEventSound(eventType: EventType, team?: TeamType) {
  const audioFile = await loadAudioFile(eventType, team)
  
  if (audioFile) {
    try {
      audioFile.currentTime = 0
      await audioFile.play()
    } catch (error) {
      console.warn(`Failed to play audio file for ${team || 'generic'} ${eventType}, falling back to synthesized sound`, error)
      playSynthesizedSound(eventType)
    }
  } else {
    playSynthesizedSound(eventType)
  }
}

export function hasCustomAudio(eventType: EventType, team?: TeamType): boolean {
  const cacheKey = getCacheKey(eventType, team)
  return audioCache.has(cacheKey)
}

export async function preloadAudio() {
  const eventTypes: EventType[] = ['touchdown', 'fieldGoal', 'firstDown', 'safety', 'opponentThirdLong']
  const teams: (TeamType | undefined)[] = ['falcons', 'bulldogs', undefined]
  
  const loadPromises = eventTypes.flatMap(type =>
    teams.map(team => loadAudioFile(type, team))
  )
  
  await Promise.all(loadPromises)
}
