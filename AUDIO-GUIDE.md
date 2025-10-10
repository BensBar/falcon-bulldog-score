# Audio Files Guide

## 📍 Where to Upload Audio Files

Upload your custom audio files to:
```
/workspaces/spark-template/src/assets/audio/
```

## 📝 Required File Names

The app looks for these exact filenames (case-sensitive):

- **`touchdown.mp3`** - Touchdown celebration (6 points)
- **`field-goal.mp3`** - Field goal made (3 points)
- **`first-down.mp3`** - First down achieved
- **`safety.mp3`** - Safety scored (2 points)
- **`opponent-third-long.mp3`** - Opponent faces 3rd & long

## 🎵 Supported Audio Formats

- `.mp3` (Most recommended - best browser support)
- `.wav` (Lossless quality, larger files)
- `.ogg` (Good compression, wide support)
- `.m4a` (Apple-preferred format)

The app will automatically try each format in order until it finds a match.

## 📏 Best Practices

### File Size
- Keep files **under 500KB** for optimal performance
- Smaller files load faster and use less memory

### Duration
- **1-3 seconds** is ideal for game alerts
- Short, punchy sounds work best
- Avoid long clips that might overlap with subsequent events

### Audio Quality
- **128-192 kbps** bitrate is sufficient for alerts
- **44.1 kHz** sample rate (standard CD quality)
- Mono audio is fine for alerts (saves space)

### Volume
- Normalize your audio to avoid clipping
- The app plays files at 70% volume by default
- Mix your audio at -3dB to -6dB peak for safety

## 🧪 How to Test

1. Add your audio files to `src/assets/audio/`
2. Open the app in your browser
3. Look for the **"Audio Test"** panel on the right side
4. Click the **"Test"** button next to each event type
5. Each badge shows whether it's using "Custom" or "Synthesized" audio

## 🔄 Fallback Behavior

- If no custom audio file is found, the app uses **synthesized tones** (Web Audio API)
- You can mix and match - some events with custom audio, others with synthesized
- No audio file is required for the app to work

## 💡 Tips for Finding Sounds

### Free Sound Resources
- **Freesound.org** - Creative Commons audio clips
- **Zapsplat.com** - Free sound effects (requires free account)
- **Mixkit.co** - Free sound effects and music

### Creating Custom Sounds
- **Audacity** (Free) - Edit and export audio files
- **GarageBand** (Mac) - Create custom sound effects
- **FL Studio** - Professional audio production

### Quick Edits
- Trim long clips to 1-3 seconds
- Fade in/out for smoother playback
- Normalize volume to prevent distortion
- Export as MP3 at 128-192 kbps

## 🎯 Example Workflow

1. Download or create your sound files
2. Rename them to match the required names (e.g., `touchdown.mp3`)
3. Copy files to `/workspaces/spark-template/src/assets/audio/`
4. Refresh the app or wait for hot-reload
5. Test each sound using the Audio Test panel
6. Adjust volume/quality if needed

## 🐛 Troubleshooting

**"Synthesized" badge still showing?**
- Verify the filename exactly matches (case-sensitive)
- Check the file is in the correct directory
- Supported format? (.mp3, .wav, .ogg, .m4a)
- Try refreshing the browser

**No sound playing?**
- Check browser volume and permissions
- Some browsers block autoplay - click Test button manually
- Open browser console (F12) to check for errors

**Sound cuts off or distorts?**
- File might be too large or high bitrate
- Try re-exporting at 128 kbps
- Normalize audio levels in your editor

## 📂 Directory Structure

```
src/
├── assets/
│   └── audio/
│       ├── README.md           ← Instructions
│       ├── touchdown.mp3       ← Your file
│       ├── field-goal.mp3      ← Your file
│       ├── first-down.mp3      ← Your file
│       ├── safety.mp3          ← Your file
│       └── opponent-third-long.mp3  ← Your file
```

## 🚀 Quick Start

**Never added audio files before?**

1. Find the folder: `/workspaces/spark-template/src/assets/audio/`
2. Add ONE test file: `touchdown.mp3` (any short audio clip)
3. Open the app and click "Test" next to "Touchdown"
4. If it shows "Custom" badge and plays your sound - success! 🎉
5. Add the remaining files following the same pattern

---

**Happy customizing! 🎵🏈**
