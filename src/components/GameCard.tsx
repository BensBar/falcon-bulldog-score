import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type GameData } from '@/lib/espnApi'
import { motion } from 'framer-motion'
import { Football } from '@phosphor-icons/react'

interface GameCardProps {
  game: GameData
}

export function GameCard({ game }: GameCardProps) {
  const myTeam = game.isHome ? game.homeTeam : game.awayTeam
  const oppTeam = game.isHome ? game.awayTeam : game.homeTeam
  const myScore = game.isHome ? game.homeScore : game.awayScore
  const oppScore = game.isHome ? game.awayScore : game.homeScore
  const myPossession = game.possession === myTeam
  
  const isLive = game.status === 'in'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 ${isLive ? 'ring-2 ring-primary shadow-lg' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Football size={24} weight="fill" className="text-primary" />
            <h2 className="text-xl font-semibold">
              {game.team === 'falcons' ? 'Atlanta Falcons' : 'Georgia Bulldogs'}
            </h2>
          </div>
          <Badge 
            variant={isLive ? 'destructive' : 'secondary'}
            className={isLive ? 'animate-pulse' : ''}
          >
            {isLive ? 'LIVE' : game.status === 'pre' ? 'SCHEDULED' : 'FINAL'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center my-6">
          <div className="text-center">
            <div className={`text-sm font-medium mb-1 ${myPossession ? 'text-accent' : 'text-muted-foreground'}`}>
              {myTeam}
              {myPossession && <span className="ml-2">●</span>}
            </div>
            <motion.div 
              className="text-6xl font-black tabular-nums"
              key={myScore}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              {myScore}
            </motion.div>
          </div>

          <div className="text-center text-muted-foreground">
            <div className="text-2xl font-bold">{game.quarter}</div>
            <div className="text-lg">{game.clock}</div>
          </div>

          <div className="text-center">
            <div className={`text-sm font-medium mb-1 ${!myPossession && game.possession === oppTeam ? 'text-destructive' : 'text-muted-foreground'}`}>
              {oppTeam}
              {!myPossession && game.possession === oppTeam && <span className="ml-2">●</span>}
            </div>
            <div className="text-6xl font-black tabular-nums">
              {oppScore}
            </div>
          </div>
        </div>

        {isLive && game.down > 0 && (
          <div className="mt-4 p-3 bg-secondary rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {game.down}{game.down === 1 ? 'st' : game.down === 2 ? 'nd' : game.down === 3 ? 'rd' : 'th'} & {game.distance}
              </span>
              <span className="text-muted-foreground">{game.yardline}</span>
            </div>
          </div>
        )}

        {game.lastPlay && (
          <div className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
            <div className="font-medium text-foreground mb-1">Last Play:</div>
            <div>{game.lastPlay}</div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
