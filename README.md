# Falcon & Bulldog Score Monitor

A real-time sports score monitoring application for tracking Falcons and Bulldogs games, built with React, Vite, and GitHub Spark.

## Features

- 🏈 Real-time game score tracking for Atlanta Falcons and Georgia Bulldogs
- 📊 Live game updates from ESPN APIs
- 🔔 Customizable alerts for touchdowns, field goals, first downs, and more
- 🎵 Audio notifications with custom sound support
- 📱 Responsive design with dark mode support

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

### Project Structure

- `src/` - Application source code
  - `assets/` - Static assets (audio files, images)
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and API clients
  - `styles/` - CSS and theme files
- `.github/workflows/` - CI/CD workflows

## Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions.

### Automatic Deployment

The workflow is triggered on:
- Push to the `main` branch
- Manual workflow dispatch

### Setup GitHub Pages

To enable deployment:
1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The site will be available at: `https://bensbar.github.io/falcon-bulldog-score/`

### Manual Deployment

You can also trigger a deployment manually:
1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
