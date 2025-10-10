# Audio Files Directory

Place your custom audio files here for game event alerts.

## Supported File Names

- `touchdown.mp3` - Plays when your team scores a touchdown (6 points)
- `field-goal.mp3` - Plays when your team scores a field goal (3 points)
- `first-down.mp3` - Plays when your team gets a first down
- `safety.mp3` - Plays when your team scores a safety (2 points)
- `opponent-third-long.mp3` - Plays when opponent faces 3rd & long (7+ yards)

## Supported Formats

- `.mp3` (recommended)
- `.wav`
- `.ogg`
- `.m4a`

## File Size Guidelines

- Keep files under 500KB for best performance
- Shorter clips (1-3 seconds) work best for alerts
- Longer clips may delay subsequent alerts

## How to Add Files

1. Save your audio files with the exact names listed above
2. Place them in this directory (`src/assets/audio/`)
3. The app will automatically detect and use them
4. Use the Audio Test panel in the app to preview your sounds

## Fallback Behavior

If no custom audio file is found, the app will use synthesized tones as a fallback.
