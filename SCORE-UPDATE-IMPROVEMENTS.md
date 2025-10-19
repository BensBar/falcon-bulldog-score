# Score Update Improvements

## Overview
This update addresses score update issues during live games by implementing detailed logging, retry mechanisms with exponential backoff, and comprehensive metrics tracking.

## Key Features

### 1. Structured Logging (`src/lib/logger.ts`)
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Structured Context**: All logs include contextual data (game IDs, scores, timestamps)
- **Development Mode**: Automatically set to DEBUG level in development for verbose logging
- **Production Mode**: INFO level by default to reduce noise

Example logs:
```
[2025-10-19T12:32:47.091Z] [INFO] Fetching Falcons game data
[2025-10-19T12:32:47.345Z] [DEBUG] Fetch completed | {"url":"...","status":200,"ok":true}
[2025-10-19T12:32:47.567Z] [INFO] Falcons game data fetched successfully | {"gameId":"401547398","status":"in","score":"24-17"}
```

### 2. Retry Mechanism (`src/lib/retry.ts`)
- **Configurable Retries**: Default 3 attempts per operation
- **Exponential Backoff**: 1s → 2s → 4s delays between retries
- **Smart Retry Logic**: Only retries network errors (timeouts, fetch failures)
- **Max Delay Cap**: Prevents excessive wait times (30s max)

Features:
- Automatic detection of retryable errors (network failures, timeouts)
- Detailed logging of each retry attempt
- Customizable retry conditions

### 3. Enhanced API Layer (`src/lib/espnApi.ts`)
All ESPN API calls now include:
- Automatic retry on network failures
- Detailed logging of each API request and response
- Structured error reporting
- Success/failure metrics

### 4. Game Monitor Improvements (`src/hooks/useGameMonitor.ts`)
New capabilities:
- **Dynamic Polling Interval**: Adapts based on failure rate
  - Normal: 15 seconds
  - After 3 failures: 30 seconds
  - After 4 failures: 60 seconds (max)
- **Metrics Tracking**:
  - Total polls
  - Success/failure counts
  - Consecutive failures
  - Last success/failure timestamps
- **Event Detection Logging**: Every touchdown, field goal, first down logged
- **Play Deduplication**: Prevents duplicate alerts with detailed logging

### 5. UI Improvements (`src/components/ConnectionStatus.tsx`)
- **Retry Indicator**: Shows "Retrying..." badge when experiencing failures
- **Metrics Tooltip**: Hover to see:
  - Total polls
  - Success rate percentage
  - Consecutive failures
  - Last success/failure times
- **Visual Status**: Clear connected/disconnected states

## Benefits

### Reliability
- **Automatic Recovery**: Network glitches don't cause permanent failures
- **Gradual Backoff**: Reduces server load during ESPN API issues
- **No Lost Updates**: Retries ensure score updates get through

### Observability
- **Full Visibility**: Every API call, game event, and error is logged
- **Performance Tracking**: Metrics show system health at a glance
- **Debug Support**: Development mode provides verbose logs for troubleshooting

### User Experience
- **Transparent Status**: Users see retry attempts in real-time
- **Health Metrics**: Success rate and failure counts available
- **Confidence**: Clear indicators that the system is working

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Open browser console to see detailed logs
3. Check ConnectionStatus tooltip for metrics
4. Network issues will show retry behavior in logs and UI

### Simulating Failures
To test retry behavior, you can:
1. Use browser DevTools to throttle network
2. Block ESPN API domains temporarily
3. Observe logs showing retry attempts with exponential backoff
4. Watch UI show "Retrying..." indicator
5. See metrics update with failure counts

### Expected Behavior
- **Normal Operation**: 15-second polls, all logs show success
- **Temporary Failure**: 3 retry attempts, then marked as failed
- **Repeated Failures**: Polling interval increases to reduce server load
- **Recovery**: On success, interval resets to 15 seconds

## Configuration

### Retry Settings (in `src/lib/retry.ts`)
```typescript
{
  maxRetries: 3,              // Number of retry attempts
  initialDelayMs: 1000,       // First retry after 1s
  maxDelayMs: 30000,          // Never wait more than 30s
  backoffMultiplier: 2,       // Double delay each retry
}
```

### Logging (in `src/lib/logger.ts`)
- Development: DEBUG level (all logs)
- Production: INFO level (important events only)

### Polling (in `src/hooks/useGameMonitor.ts`)
- Default: 15 seconds
- After failures: Up to 60 seconds with exponential backoff

## Migration Notes

No breaking changes. All existing functionality preserved with added reliability features.

## Future Enhancements

Possible improvements:
- WebSocket support for real-time updates
- Service worker for background polling
- Offline mode with cached data
- Push notifications for critical events
- User-configurable retry settings
