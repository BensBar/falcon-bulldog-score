import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SpeakerHigh, PlayCircle } from '@phosphor-icons/react'
import { playEventSound, hasCustomAudio, preloadAudio, type EventType } from '@/lib/audioPlayer'

export function AudioTestPanel() {
  const [loading, setLoading] = useState(true)
  const [customAudioStatus, setCustomAudioStatus] = useState<Record<EventType, boolean>>({
    touchdown: false,
    fieldGoal: false,
    firstDown: false,
    safety: false,
    opponentThirdLong: false
  })

  const eventInfo: Record<EventType, { label: string; description: string }> = {
    touchdown: { label: 'Touchdown', description: '6 points scored' },
    fieldGoal: { label: 'Field Goal', description: '3 points scored' },
    firstDown: { label: 'First Down', description: 'New set of downs' },
    safety: { label: 'Safety', description: '2 points scored' },
    opponentThirdLong: { label: 'Opponent 3rd & Long', description: '7+ yards to go' }
  }

  useEffect(() => {
    const checkAudioFiles = async () => {
      await preloadAudio()
      
      const status: Record<EventType, boolean> = {
        touchdown: hasCustomAudio('touchdown'),
        fieldGoal: hasCustomAudio('fieldGoal'),
        firstDown: hasCustomAudio('firstDown'),
        safety: hasCustomAudio('safety'),
        opponentThirdLong: hasCustomAudio('opponentThirdLong')
      }
      
      setCustomAudioStatus(status)
      setLoading(false)
    }
    
    checkAudioFiles()
  }, [])

  const handleTestSound = async (eventType: EventType) => {
    await playEventSound(eventType)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <SpeakerHigh size={24} weight="fill" className="text-primary" />
        <h2 className="text-xl font-semibold">Audio Test</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Test your alert sounds. Custom audio files override synthesized tones.
      </p>

      <div className="space-y-3">
        {(Object.entries(eventInfo) as [EventType, typeof eventInfo[EventType]][]).map(([eventType, info]) => (
          <div
            key={eventType}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
          >
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{info.label}</span>
                {loading ? (
                  <Badge variant="outline" className="text-xs">
                    Loading...
                  </Badge>
                ) : customAudioStatus[eventType] ? (
                  <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                    Custom
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Synthesized
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{info.description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestSound(eventType)}
              disabled={loading}
              className="shrink-0"
            >
              <PlayCircle size={18} weight="fill" className="mr-1" />
              Test
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How to add custom sounds:</strong>
          <br />
          Place audio files (MP3, WAV, OGG) in <code className="bg-background px-1 py-0.5 rounded text-accent">src/assets/audio/</code>
          <br />
          Use these exact names: <code className="bg-background px-1 py-0.5 rounded text-accent">touchdown.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">field-goal.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">first-down.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">safety.mp3</code>, <code className="bg-background px-1 py-0.5 rounded text-accent">opponent-third-long.mp3</code>
        </p>
      </div>
    </Card>
  )
}
