import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type EventType, type TeamType } from '@/lib/audioPlayer'

interface ScreenFlashAlertProps {
  eventType: EventType | null
  team: TeamType | null
  onComplete?: () => void
}

// Color configurations for different event types and teams
const getFlashColor = (eventType: EventType, team: TeamType): string => {
  switch (eventType) {
    case 'touchdown':
    case 'safety':
      // Red with team-specific variations
      return team === 'falcons' ? '#EF4444' : '#DC2626' // Falcons: red-500, Bulldogs: red-600
    
    case 'fieldGoal':
      // Orange
      return '#F97316' // orange-500
    
    case 'firstDown':
      // Blue
      return '#3B82F6' // blue-500
    
    case 'opponentThirdLong':
      // Yellow
      return '#EAB308' // yellow-500
    
    default:
      return '#EF4444' // Default red
  }
}

// Get opacity peak based on event intensity
const getOpacityPeak = (eventType: EventType): number => {
  switch (eventType) {
    case 'touchdown':
    case 'safety':
      return 0.5 // Intense pulse
    
    case 'fieldGoal':
      return 0.4 // Medium pulse
    
    case 'firstDown':
      return 0.25 // Subtle pulse
    
    case 'opponentThirdLong':
      return 0.35 // Attention-grabbing pulse
    
    default:
      return 0.3
  }
}

// Get animation duration based on event type
const getAnimationDuration = (eventType: EventType): number => {
  switch (eventType) {
    case 'touchdown':
    case 'safety':
      return 0.8 // Longer for big plays
    
    case 'fieldGoal':
      return 0.65
    
    case 'firstDown':
      return 0.5 // Quick and subtle
    
    case 'opponentThirdLong':
      return 0.7
    
    default:
      return 0.6
  }
}

export function ScreenFlashAlert({ eventType, team, onComplete }: ScreenFlashAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (eventType && team) {
      setIsVisible(true)
      
      // Auto-hide after animation completes
      const duration = getAnimationDuration(eventType) * 1000
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [eventType, team, onComplete])

  if (!eventType || !team) return null

  const color = getFlashColor(eventType, team)
  const opacityPeak = getOpacityPeak(eventType)
  const duration = getAnimationDuration(eventType)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, opacityPeak, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: color,
            pointerEvents: 'none',
            zIndex: 9999,
            willChange: 'opacity'
          }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  )
}
