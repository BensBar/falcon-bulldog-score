# Audio Files Directory

Place your custom audio files here for game event alerts.

## Team-Specific Audio Files (Priority 1)

Upload these to have **different sounds for each team**:

### Falcons Audio Files
- `falcons-touchdown.mp3` - Plays when Falcons score a touchdown (e.g., train horn)
- `falcons-field-goal.mp3` - Plays when Falcons score a field goal
- `falcons-first-down.mp3` - Plays when Falcons get a first down
- `falcons-safety.mp3` - Plays when Falcons score a safety
- `falcons-opponent-third-long.mp3` - Plays when Falcons opponent faces 3rd & long

### Bulldogs Audio Files
- `bulldogs-touchdown.mp3` - Plays when Bulldogs score a touchdown (e.g., UGA fight song)
- `uga-touchdown.mp3` - Alternative filename (also works)
- `bulldogs-field-goal.mp3` - Plays when Bulldogs score a field goal
- `uga-field-goal.mp3` - Alternative filename (also works)
- `bulldogs-first-down.mp3` - Plays when Bulldogs get a first down
- `uga-first-down.mp3` - Alternative filename (also works)
- `bulldogs-safety.mp3` - Plays when Bulldogs score a safety
- `uga-safety.mp3` - Alternative filename (also works)
- `bulldogs-opponent-third-long.mp3` - Plays when Bulldogs opponent faces 3rd & long
- `uga-opponent-third-long.mp3` - Alternative filename (also works)

## Generic Audio Files (Priority 2)

Upload these to use the **same sound for both teams** (only used if team-specific file doesn't exist):

- `touchdown.mp3` - Generic touchdown sound
- `field-goal.mp3` - Generic field goal sound
- `first-down.mp3` - Generic first down sound
- `safety.mp3` - Generic safety sound
- `opponent-third-long.mp3` - Generic opponent 3rd & long sound

## Supported Formats

- `.mp3` (recommended, works everywhere)
- `.wav` (high quality, larger files)
- `.ogg` (good compression)
- `.m4a` (Apple-friendly)

## File Size Guidelines

- Keep files under 500KB for best performance
- Shorter clips (1-3 seconds) work best for alerts
- Longer clips may delay subsequent alerts

## How to Add Files

1. **Save your audio files** with the exact names listed above
2. **Place them in this directory** (`src/assets/audio/`)
3. **The app will automatically detect and use them** on next refresh
4. **Use the Audio Test panel** in the app to preview your sounds

## Priority System

The app checks for audio files in this order:

1. **Team-specific file** (e.g., `falcons-touchdown.mp3`)
2. **Generic file** (e.g., `touchdown.mp3`)
3. **Synthesized tone** (automatic fallback)

## Example Setup

Want the UGA fight song for Bulldogs touchdowns and a train horn for Falcons touchdowns?

1. Save your UGA fight song as `bulldogs-touchdown.mp3` (or `uga-touchdown.mp3`)
2. Save your train horn as `falcons-touchdown.mp3`
3. Place both files in this directory
4. Click the play buttons in the Audio Test panel to test them!

## Testing Your Audio

1. Open the app
2. Look for the **"Audio Test"** panel on the right side
3. Click the play button (▶) next to each team/event combination
4. The badge shows what audio is loaded:
   - **Team** = Team-specific audio file found
   - **Generic** = Generic audio file found
   - **Synth** = Using synthesized sound (no file found)

## Fallback Behavior

If no custom audio file is found, the app will use synthesized tones as a fallback so you'll never miss an alert!
