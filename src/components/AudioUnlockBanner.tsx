import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SpeakerHigh } from '@phosphor-icons/react'
import { ensureAudioContextReady, isAudioContextSuspended } from '@/lib/audioPlayer'

interface AudioUnlockBannerProps {
  onDismiss?: () => void
  show?: boolean
}

export function AudioUnlockBanner({ onDismiss, show = true }: AudioUnlockBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)

  useEffect(() => {
    // Check if audio is suspended on mount and periodically
    const checkAudioStatus = () => {
      if (show && isAudioContextSuspended()) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    checkAudioStatus()
    // Check every 3 seconds - audio context changes are typically user-initiated
    const interval = setInterval(checkAudioStatus, 3000)

    return () => clearInterval(interval)
  }, [show])

  const handleEnableAudio = async () => {
    setIsUnlocking(true)
    
    try {
      const success = await ensureAudioContextReady()
      
      if (success) {
        setIsVisible(false)
        onDismiss?.()
      }
    } catch (error) {
      console.error('Failed to enable audio:', error)
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          role="alert"
          aria-live="polite"
        >
          <div className="relative bg-gradient-to-r from-accent-9 to-accent-10 text-white rounded-lg shadow-2xl border-2 border-accent-11 overflow-hidden">
            {/* Animated border glow effect */}
            <motion.div
              className="absolute inset-0 border-2 border-accent-contrast rounded-lg"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            <div className="relative p-4 sm:p-6">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss audio banner"
              >
                <X size={20} weight="bold" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="flex-shrink-0"
                >
                  <SpeakerHigh size={48} weight="fill" />
                </motion.div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold mb-1">
                    Enable Audio Alerts 🔊
                  </h3>
                  <p className="text-sm sm:text-base opacity-90">
                    Click below to enable sound notifications for touchdowns, field goals, and more!
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    (Required due to browser autoplay restrictions)
                  </p>
                </div>

                <button
                  onClick={handleEnableAudio}
                  disabled={isUnlocking}
                  className="flex-shrink-0 px-6 py-3 bg-white text-accent-9 font-bold rounded-lg shadow-lg hover:bg-accent-1 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  aria-label="Enable audio alerts"
                >
                  {isUnlocking ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        ⚙️
                      </motion.span>
                      Enabling...
                    </span>
                  ) : (
                    'Enable Sound'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
