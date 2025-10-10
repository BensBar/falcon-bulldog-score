export type EventType = 'touchdown' | 'fieldGoal' | 'firstDown' | 'safety' | 'opponentThirdLong'

const audioContext = typeof window !== 'undefined' ? new AudioContext() : null

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

export function playEventSound(eventType: EventType) {
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
