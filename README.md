# Coffee Head

Coffee Head is a local-first coffee tracking app built with React, TypeScript, and Vite. It helps you record coffee consumption, manage your bean inventory and budget, and review personal insights.

Your data is stored locally in the browser using IndexedDB. The app does not require Gemini or any other AI service, and no API key is needed.

## Run locally

### Prerequisites

- Node.js
- npm

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local URL shown in the terminal. By default, Vite uses `http://localhost:3000` for this project.

## Build for production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Data and privacy

- App data is stored in the current browser through IndexedDB.
- No account or cloud database is required.
- You can export and import a JSON backup from within the app.
