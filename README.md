# Virtual Green Fleet (VGF) Orchestrator Demo

This repository contains a lightweight, static demo of the **Virtual Green Fleet (VGF) Orchestrator** described in `spec.md`. The demo showcases a dashboard that simulates electric‐fleet aggregation into a Virtual Power Plant.

## Project Structure

```
├── index.html     # Main HTML page
├── styles.css     # Extracted custom styles
├── app.js         # All dashboard logic (formerly inline)
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

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Ensure the **Actions** tab is enabled for your repo (required for workflows).
3. On every push to the `main` branch, the included **Deploy to GitHub Pages** workflow will automatically publish the site to the `gh-pages` environment.
4. Navigate to **Settings → Pages** to find the public URL.

Enjoy showing the VGF Orchestrator demo to stakeholders! 