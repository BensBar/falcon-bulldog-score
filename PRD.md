# Planning Guide

A real-time sports monitoring dashboard that tracks Atlanta Falcons and Georgia Bulldogs football games, providing instant audio and visual alerts for key game events like touchdowns, first downs, field goals, and opponent's critical plays.

**Experience Qualities**: 
1. **Responsive** - Instant notifications the moment plays happen, creating an immersive live-game experience
2. **Customizable** - Users control which alerts they hear and see, tailoring the experience to their preferences
3. **Unobtrusive** - Runs in the background while allowing users to multitask, only demanding attention when it matters

**Complexity Level**: Light Application (multiple features with basic state)
  - Monitors live game data, manages alert preferences, plays contextual sounds, and displays real-time game statistics

## Essential Features

### Live Game Monitoring
- **Functionality**: Polls ESPN API for live game data every 15 seconds when games are active
- **Purpose**: Provides real-time updates without requiring user interaction
- **Trigger**: Automatically starts monitoring when component mounts; intensifies during active games
- **Progression**: App loads → Detects active games → Begins polling → Compares game states → Triggers alerts on changes → Updates display
- **Success criteria**: Alerts fire within 15 seconds of actual game events; no duplicate alerts for same play

### Customizable Alert System
- **Functionality**: Users can enable/disable alerts for each event type (TD, FG, 1st down, safety, opponent 3rd & long)
- **Purpose**: Lets users focus on the moments they care about most
- **Trigger**: User toggles switches in settings panel
- **Progression**: User opens settings → Toggles event types → Preferences saved to storage → Future alerts respect settings
- **Success criteria**: Settings persist across sessions; alerts only fire for enabled event types

### Audio Notifications
- **Functionality**: Plays custom audio files or synthesized tones for different scoring events, with support for user-uploaded sound files
- **Purpose**: Provides immediate feedback even when user isn't looking at screen; allows personalization with custom sounds
- **Trigger**: Game event detected and alert type is enabled
- **Progression**: Event detected → Check if alert enabled → Load custom audio if available (fallback to synthesized) → Play corresponding audio → Show visual notification
- **Success criteria**: Audio plays immediately; different events have distinguishable sounds; custom files override synthesized; volume is reasonable; files up to 500KB supported

### Game Status Display
- **Functionality**: Shows current score, quarter, time, down/distance, and recent plays
- **Purpose**: Provides context for alerts and lets users check game status at a glance
- **Trigger**: Continuous display updates as new data arrives
- **Progression**: Data received → Parse game state → Update UI → Highlight recent events
- **Success criteria**: All game info visible without scrolling; updates smooth without flashing

### Team Selection
- **Functionality**: Monitors both Falcons (NFL) and Georgia Bulldogs (College) games simultaneously
- **Purpose**: Covers both major Atlanta/Georgia football teams
- **Trigger**: Automatic detection of scheduled/active games for both teams
- **Progression**: App loads → Query both teams → Display active games → Monitor all simultaneously
- **Success criteria**: Both games display when concurrent; correct team logos and colors

### Audio Testing & Management
- **Functionality**: Dedicated panel to test all alert sounds and view audio file status (custom vs synthesized)
- **Purpose**: Allows users to preview sounds before games start and verify custom audio files loaded correctly
- **Trigger**: Always available in sidebar; updated when custom files added
- **Progression**: User uploads audio → Refresh app → Test panel shows "Custom" badge → Click test button → Sound plays
- **Success criteria**: Each event has test button; shows audio source (custom/synthesized); plays sound on click; clear instructions for adding files

## Edge Case Handling
- **No Active Games**: Display next scheduled game time and countdown; show "Waiting for game day" state
- **API Failures**: Show connection status; retry with exponential backoff; cache last known state
- **Rapid Scoring**: Queue alerts to prevent audio overlap; show multiple notifications in sequence
- **Browser Tab Inactive**: Continue monitoring; use browser notification API if available
- **Preseason/Offseason**: Detect schedule availability; show appropriate messaging for off periods

## Design Direction
The design should feel energetic and sport-focused with a broadcast-quality aesthetic—think ESPN's digital platforms with bold typography, team colors, and clear hierarchy that makes scores and alerts impossible to miss even at a glance.

## Color Selection
Triadic color scheme incorporating team colors (Falcons red/black, Georgia red/black) with contrasting accents for alerts

- **Primary Color**: Deep Red (oklch(0.45 0.2 25)) - Represents both teams' primary color; conveys energy and passion of live sports
- **Secondary Colors**: Charcoal Black (oklch(0.25 0 0)) for depth and contrast; Silver Gray (oklch(0.65 0 0)) for secondary UI elements
- **Accent Color**: Electric Green (oklch(0.75 0.2 145)) for positive events like first downs and touchdowns—pops against red/black
- **Foreground/Background Pairings**:
  - Background (Dark Charcoal oklch(0.15 0 0)): White text (oklch(0.98 0 0)) - Ratio 15.2:1 ✓
  - Card (Elevated Black oklch(0.2 0 0)): White text (oklch(0.98 0 0)) - Ratio 13.1:1 ✓
  - Primary (Deep Red oklch(0.45 0.2 25)): White text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓
  - Accent (Electric Green oklch(0.75 0.2 145)): Black text (oklch(0.15 0 0)) - Ratio 8.2:1 ✓
  - Muted (Dim Gray oklch(0.35 0 0)): Light Gray text (oklch(0.75 0 0)) - Ratio 4.6:1 ✓

## Font Selection
Bold, athletic typefaces that echo sports broadcasts—highly legible at all sizes with strong numeric character design for scores and game clock displays

- **Typographic Hierarchy**:
  - H1 (Team Names): Inter Bold/32px/tight letter spacing - commands attention
  - H2 (Scores): Inter Black/64px/tabular numbers - impossible to miss
  - H3 (Game Status): Inter Semibold/20px/normal spacing - clear hierarchy
  - Body (Play Details): Inter Regular/16px/relaxed line height - readable play-by-play
  - Small (Timestamps): Inter Medium/14px/uppercase - subtle but clear

## Animations
Subtle but energetic animations that celebrate scoring moments without distracting from the information—think broadcast graphics that slide in decisively then settle quickly

- **Purposeful Meaning**: Touchdowns trigger celebratory scale animations; first downs get a quick pulse; opponent's 3rd & long adds tension with a subtle shake
- **Hierarchy of Movement**: Score changes get the most dramatic animation (scale + glow); status updates use simple fades; background polling is invisible

## Component Selection
- **Components**: 
  - Card for game containers and settings panels with subtle borders
  - Switch for alert toggles in settings
  - Badge for game status (LIVE, FINAL, Scheduled) and audio type indicators
  - Button for audio test triggers
  - Separator for visual division between games
  - ScrollArea for play-by-play history
  - Collapsible for settings panel
  - Toast (sonner) for transient alert notifications
- **Customizations**: 
  - Custom score display component with large tabular numbers
  - Custom audio player with file loading and synthesizer fallback
  - Custom team logo/color system
  - Animated alert banner component
  - Audio test panel with status indicators
- **States**: 
  - Switches: Green when enabled, gray when disabled
  - Cards: Elevated shadow for active games, flat for inactive
  - Badges: Color-coded (red for LIVE, green for scheduled, gray for final; accent for custom audio, secondary for synthesized)
  - Buttons: Hover state with color shift, active press state
  - Connection indicator: Pulsing when polling, solid when connected, red when error
- **Icon Selection**: 
  - Bell (notifications on/off)
  - SpeakerHigh (audio test panel)
  - PlayCircle (test sound buttons)
  - Play/Pause (monitoring status)
  - Football from Phosphor Icons
  - Check/X for enabled/disabled states
  - Wifi/WifiSlash for connection status
- **Spacing**: 
  - Card padding: p-6 for game containers
  - Gap between elements: gap-4 standard, gap-6 for sections
  - Score display: generous p-8 for emphasis
  - Settings panel: p-4 for compact control layout
- **Mobile**: 
  - Stack games vertically on small screens
  - Collapse settings into expandable panel
  - Reduce score font size proportionally
  - Full-width cards with reduced padding (p-4)
  - Fixed header with game count and connection status
