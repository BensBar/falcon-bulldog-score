import { WifiHigh, WifiSlash } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

interface ConnectionStatusProps {
  isConnected: boolean
  lastUpdate: Date
}

export function ConnectionStatus({ isConnected, lastUpdate }: ConnectionStatusProps) {
  const timeAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
  
  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant={isConnected ? 'secondary' : 'destructive'} className="flex items-center gap-2">
        {isConnected ? (
          <>
            <WifiHigh size={16} weight="fill" className="animate-pulse" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiSlash size={16} weight="fill" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>
      <span className="text-sm text-muted-foreground">
        Updated {formatTimeAgo(timeAgo)}
      </span>
    </div>
  )
}
