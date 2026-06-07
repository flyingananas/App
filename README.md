# Prompt D

A desktop application built with Electron, React, Vite, TypeScript, and better-sqlite3.

## Prerequisites

- Node.js (tested on v20+)
- npm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

Note: Exact versions of `electron`, `react`, `vite`, and `typescript` have been pinned in `package.json` to ensure reproducible builds.

## Development

To start the application in development mode with hot-reload:

```bash
npm run dev
```

This command uses `electron-vite` to compile the main process, preload script, and renderer, and launches the Electron application.

## Testing

To run the tests using Vitest:

```bash
npm test
```

Currently, the test suite includes a headless smoke test that verifies the `better-sqlite3` database is successfully created and responds to ping queries.

## Architecture

- **Main Process**: Located in `src/main/`. Handles database initialization with `better-sqlite3` creating a `promptd.db` file in the user data directory, sets up the application window, and defines IPC handlers.
- **Preload Script**: Located in `src/preload/`. Exposes a secure, typed API using `contextBridge` to the renderer. Node integration is disabled and context isolation is enabled.
- **Renderer**: Located in `src/renderer/`. Uses React 19 and Tailwind CSS. The renderer does not have direct access to Node.js APIs and only communicates with the main process via the exposed IPC bridge.
