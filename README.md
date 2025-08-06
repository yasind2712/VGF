# Virtual Green Fleet (VGF) Orchestrator Demo

This repository contains a lightweight, static demo of the **Virtual Green Fleet (VGF) Orchestrator** described in `spec.md`. The demo showcases a dashboard that simulates electric‐fleet aggregation into a Virtual Power Plant.

## Key Features

### 🏭 **Dual-Sided Value Proposition**
- **Utility Benefits**: Capital deferral, peak load reduction, grid stability, and market revenue generation
- **Fleet Operator Benefits**: New revenue streams, TCO reduction, demand charge savings, and operational assurance

### 🤖 **AI-Driven Optimization**
- Real-time market price monitoring and intelligent dispatch requests
- Automatic SoC management to ensure route requirements are met
- Predictive control based on grid conditions and market signals

### 📡 **Fleet Communication System**
- **Dispatch Requests**: AI sends requests to fleet operators via API/SMS
- **Response Tracking**: Real-time monitoring of fleet operator responses
- **Operational Planning**: Fleet operators make final dispatch decisions
- **Communication Status**: Track connection, request sent, confirmed, or declined

### 📊 **Market Integration**
- Wholesale energy market participation (CAISO integration)
- Carbon emissions tracking and reporting
- Real-time bid capacity and revenue calculations

### 🔋 **Synthetic Telematics Engine**
- Realistic fleet behavior patterns based on vehicle type
- Operational hour modeling and route planning
- SoC management aligned with operational requirements

### ⚡ **Grid Event Simulation**
- Market price spikes and grid stress scenarios
- Renewable energy surge handling
- Frequency regulation and voltage support demonstrations

## Project Structure

```
├── index.html     # Main HTML page with enhanced dashboard
├── styles.css     # Extracted custom styles with new panel styling
├── app.js         # All dashboard logic with AI optimization
├── spec.md        # Product specification document
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment workflow
```

## Running Locally

No build step is required. Simply open `index.html` in your browser, or serve the folder with any static server:

```bash
npx serve .
```

## Demo Walkthrough

1. **Dashboard**: Overview with KPIs, power flow chart, and grid status
2. **Fleet Management**: View and manage enrolled fleets and their status
3. **Communication**: Monitor dispatch requests, responses, and market integration
4. **Economics**: Detailed view of dual-sided benefits for utilities and fleet operators
5. **Simulation**: Test new fleet configurations and send manual dispatch requests

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Ensure the **Actions** tab is enabled for your repo (required for workflows).
3. On every push to the `main` branch, the included **Deploy to GitHub Pages** workflow will automatically publish the site to the `gh-pages` environment.
4. Navigate to **Settings → Pages** to find the public URL.

Enjoy showing the enhanced VGF Orchestrator demo to stakeholders! 