import { logger } from './logger'

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  shouldRetry?: (error: Error, attempt: number) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  shouldRetry: () => true
}

/**
 * Executes an async function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      logger.debug(`Attempting ${operationName}`, { attempt, maxRetries: opts.maxRetries })
      const result = await operation()
      
      if (attempt > 1) {
        logger.info(`${operationName} succeeded after ${attempt} attempts`)
      }
      
      return result
    } catch (error) {
      lastError = error as Error
      
      logger.warn(`${operationName} failed on attempt ${attempt}`, {
        attempt,
        maxRetries: opts.maxRetries,
        error: lastError.message
      })
      
      // Check if we should retry
      const shouldRetry = attempt < opts.maxRetries && opts.shouldRetry(lastError, attempt)
      
      if (!shouldRetry) {
        logger.error(`${operationName} failed after ${attempt} attempts, not retrying`, lastError)
        throw lastError
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      )
      
      logger.debug(`Waiting ${delay}ms before retry ${attempt + 1}`, { delay })
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error(`${operationName} failed after all retries`)
}

/**
 * Check if an error is a network error that should be retried
 */
export function isRetryableError(error: Error): boolean {
  const retryableErrors = [
    'NetworkError',
    'TimeoutError',
    'AbortError',
    'Failed to fetch',
    'Network request failed',
    'Load failed',
    'timeout'
  ]
  
  return retryableErrors.some(msg => 
    error.message?.toLowerCase().includes(msg.toLowerCase()) ||
    error.name?.toLowerCase().includes(msg.toLowerCase())
  )
}
