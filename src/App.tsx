import { useKV } from '@github/spark/hooks'
import { GameCard } from '@/components/GameCard'
import { SettingsPanel } from '@/components/SettingsPanel'
import { AudioTestPanel } from '@/components/AudioTestPanel'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import { useGameMonitor, type AlertSettings } from '@/hooks/useGameMonitor'
import { Toaster } from '@/components/ui/sonner'
import { Football } from '@phosphor-icons/react'

const DEFAULT_SETTINGS: AlertSettings = {
  touchdown: true,
  fieldGoal: true,
  firstDown: true,
  safety: true,
  opponentThirdLong: true
}

function App() {
  const [alertSettings, setAlertSettings] = useKV<AlertSettings>('alert-settings', DEFAULT_SETTINGS)
  const { games, isConnected, lastUpdate, metrics } = useGameMonitor(alertSettings || DEFAULT_SETTINGS)

  const handleSettingsChange = (newSettings: AlertSettings) => {
    setAlertSettings(newSettings)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Football size={40} weight="fill" className="text-primary" />
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Live Score Monitor
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Falcons & Bulldogs Game Tracker
                </p>
              </div>
            </div>
            <ConnectionStatus isConnected={isConnected} lastUpdate={lastUpdate} metrics={metrics} />
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {games.length === 0 ? (
              <div className="text-center py-16">
                <Football size={64} weight="light" className="text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Active Games</h2>
                <p className="text-muted-foreground">
                  Waiting for Falcons or Bulldogs games to start...
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Monitoring ESPN APIs every 15 seconds
                </p>
              </div>
            ) : (
              games.map(game => (
                <GameCard key={game.id} game={game} />
              ))
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <SettingsPanel 
              settings={alertSettings || DEFAULT_SETTINGS} 
              onSettingsChange={handleSettingsChange}
            />
            <AudioTestPanel />
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Real-time game data powered by ESPN APIs</p>
          <p className="mt-2">Updates every 15 seconds during active games</p>
        </footer>
      </div>
    </div>
  )
}

export default App