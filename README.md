# Booking Appointment App

A modern, premium single-page application for booking auto service station appointments, built with pure HTML, CSS, and Vanilla JavaScript.

## Features
- **Date & Time Selection**: Choose a date and a suitable 30/60/90/120 min slot between 08:00 and 18:00.
- **Conflict Prevention**: Automatic validation to prevent overlapping appointments.
- **State Persistence**: Uses `localStorage` to save all active and cancelled appointments across sessions.
- **Premium Design**: Modern aesthetic featuring a glassmorphism header, smooth animations, and clear status indicators.
- **Search & Filter**: Quickly find appointments by client name or comment.

## Technology Stack
- **Frontend**: Plain HTML, Vanilla CSS (with CSS variables and modern layout techniques like Grid/Flexbox), Vanilla JavaScript (ES Modules).
- **Data Storage**: Client-side `localStorage`. No external backend required.
- **Deployment**: GitHub Pages via GitHub Actions.

## Running Locally

Since this is a plain static website without build tools, you can simply run it by serving the directory locally.
For example, using Python or Node.js:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js (npx)
npx serve .
```

Then open `http://localhost:8000` or the provided local URL in your browser.

## Demo Data

The app includes a preset of demo appointments. You can load or reset the demo data anytime by clicking the **"Скинути демо дані" (Reset demo data)** button in the top right corner of the header.

## Deployment to GitHub Pages

This project is configured to deploy automatically to GitHub Pages when changes are pushed to the `main` branch.

**To enable it:**
1. Push this repository to GitHub.
2. Go to your repository settings -> **Pages**.
3. Under **Build and deployment**, change the source from "Deploy from a branch" to **"GitHub Actions"**.
4. The `.github/workflows/deploy.yml` workflow will handle the deployment automatically.

## Architecture & Decisions

Review the architectural decisions in the `docs/sdr/` folder:
- [0001-stack-choice.md](docs/sdr/0001-stack-choice.md)
- [0002-client-storage-choice.md](docs/sdr/0002-client-storage-choice.md)
- [0003-routing-state-and-data-model.md](docs/sdr/0003-routing-state-and-data-model.md)
