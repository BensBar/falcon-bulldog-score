import { WifiHigh, WifiSlash, ArrowsClockwise } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { MonitorMetrics } from '@/hooks/useGameMonitor'

interface ConnectionStatusProps {
  isConnected: boolean
  lastUpdate: Date
  metrics?: MonitorMetrics
}

export function ConnectionStatus({ isConnected, lastUpdate, metrics }: ConnectionStatusProps) {
  const timeAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
  
  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const successRate = metrics && metrics.totalPolls > 0 
    ? ((metrics.successfulPolls / metrics.totalPolls) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={isConnected ? 'secondary' : 'destructive'} className="flex items-center gap-2 cursor-help">
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
          </TooltipTrigger>
          {metrics && (
            <TooltipContent>
              <div className="space-y-1 text-xs">
                <p><strong>Total Polls:</strong> {metrics.totalPolls}</p>
                <p><strong>Success Rate:</strong> {successRate}%</p>
                <p><strong>Consecutive Failures:</strong> {metrics.consecutiveFailures}</p>
                {metrics.lastSuccessTime && (
                  <p><strong>Last Success:</strong> {metrics.lastSuccessTime.toLocaleTimeString()}</p>
                )}
                {metrics.lastFailureTime && (
                  <p><strong>Last Failure:</strong> {metrics.lastFailureTime.toLocaleTimeString()}</p>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {metrics && metrics.consecutiveFailures > 0 && (
        <Badge variant="outline" className="flex items-center gap-1.5">
          <ArrowsClockwise size={14} weight="bold" className="animate-spin" />
          <span className="text-xs">Retrying...</span>
        </Badge>
      )}
      
      <span className="text-sm text-muted-foreground">
        Updated {formatTimeAgo(timeAgo)}
      </span>
    </div>
  )
}
