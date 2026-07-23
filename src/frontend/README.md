### Frontend — React + Vite + TypeScript

The game client is built with React and Vite. Rendering uses Pixi.js and styles are managed with Tailwind CSS.

#### Requirements
- Node.js and npm

#### Configuration
Copy `.env.example` to `.env` and adjust values as needed:
```
VITE_WS_BASE_URL=ws://localhost:8000
VITE_WS_PATH=/api/ws
VITE_BACKEND_BASE_URL=http://localhost:8000
```

#### Install and run (development)
```
cd src/frontend
npm install
npm run dev
```

#### Build and preview
```
npm run build
npm run preview
```

#### Tests and linting
```
npm run test
npm run lint
npm run lint:fix
```

#### Application Contexts
- User/session and WebSocket connection are exposed via React Contexts.