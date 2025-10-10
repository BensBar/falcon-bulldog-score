import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SpeakerHigh, PlayCircle, StopCircle } from '@phosphor-icons/react'
import { playEventSound, stopAllAudio, hasCustomAudio, preloadAudio, type EventType, type TeamType } from '@/lib/audioPlayer'

export function AudioTestPanel() {
  const [loading, setLoading] = useState(true)
  const [customAudioStatus, setCustomAudioStatus] = useState<Record<string, boolean>>({})

  const eventInfo: Record<EventType, { label: string; description: string }> = {
    touchdown: { label: 'Touchdown', description: '6 points scored' },
    fieldGoal: { label: 'Field Goal', description: '3 points scored' },
    firstDown: { label: 'First Down', description: 'New set of downs' },
    safety: { label: 'Safety', description: '2 points scored' },
    opponentThirdLong: { label: 'Opponent 3rd & Long', description: '7+ yards to go' }
  }

  const teams: { key: TeamType; label: string }[] = [
    { key: 'falcons', label: 'Falcons' },
    { key: 'bulldogs', label: 'Bulldogs' }
  ]

  useEffect(() => {
    const checkAudioFiles = async () => {
      await preloadAudio()
      
      const status: Record<string, boolean> = {}
      
      const eventTypes: EventType[] = ['touchdown', 'fieldGoal', 'firstDown', 'safety', 'opponentThirdLong']
      
      eventTypes.forEach(eventType => {
        teams.forEach(team => {
          const key = `${team.key}-${eventType}`
          status[key] = hasCustomAudio(eventType, team.key)
        })
        status[eventType] = hasCustomAudio(eventType)
      })
      
      setCustomAudioStatus(status)
      setLoading(false)
    }
    
    checkAudioFiles()
  }, [])

  const handleTestSound = async (eventType: EventType, team: TeamType) => {
    await playEventSound(eventType, team)
  }

  const getAudioStatus = (eventType: EventType, team: TeamType): 'custom' | 'generic' | 'synthesized' => {
    const teamSpecificKey = `${team}-${eventType}`
    if (customAudioStatus[teamSpecificKey]) return 'custom'
    if (customAudioStatus[eventType]) return 'generic'
    return 'synthesized'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SpeakerHigh size={24} weight="fill" className="text-primary" />
          <h2 className="text-xl font-semibold">Audio Test</h2>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={stopAllAudio}
          className="h-8 gap-2"
        >
          <StopCircle size={16} weight="fill" />
          Stop
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Test your alert sounds. Team-specific audio files override generic files.
      </p>

      <div className="space-y-4">
        {(Object.entries(eventInfo) as [EventType, typeof eventInfo[EventType]][]).map(([eventType, info]) => (
          <div key={eventType} className="space-y-2">
            <div className="text-sm font-semibold text-foreground">
              {info.label}
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                {info.description}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {teams.map(team => {
                const status = loading ? 'loading' : getAudioStatus(eventType, team.key)
                return (
                  <div
                    key={team.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <span className="font-medium text-sm">{team.label}</span>
                      {loading ? (
                        <Badge variant="outline" className="text-xs">
                          ...
                        </Badge>
                      ) : status === 'custom' ? (
                        <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                          Team
                        </Badge>
                      ) : status === 'generic' ? (
                        <Badge variant="secondary" className="text-xs">
                          Generic
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Synth
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestSound(eventType, team.key)}
                      disabled={loading}
                      className="shrink-0 h-8 w-8 p-0"
                    >
                      <PlayCircle size={20} weight="fill" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How to add custom sounds:</strong>
          <br />
          Place audio files (MP3, WAV, OGG) in <code className="bg-background px-1 py-0.5 rounded text-accent">src/assets/audio/</code>
          <br />
          <strong className="text-foreground mt-2 inline-block">Team-specific files:</strong> <code className="bg-background px-1 py-0.5 rounded text-accent">falcons-touchdown.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">bulldogs-touchdown.mp3</code> or <code className="bg-background px-1 py-0.5 rounded text-accent">uga-touchdown.mp3</code>
          <br />
          <strong className="text-foreground mt-2 inline-block">Generic files:</strong> <code className="bg-background px-1 py-0.5 rounded text-accent">touchdown.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">field-goal.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">first-down.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">safety.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">opponent-third-long.mp3</code>
        </p>
      </div>
    </Card>
  )
}
