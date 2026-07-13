import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import ArenaPage from './pages/ArenaPage'
import CreateRoomPage from './pages/CreateRoomPage'
import LoadingPage from './pages/LoadingPage'
import LobbyPage from './pages/LobbyPage'
import WaitingRoomPage from './pages/WaitingRoomPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LobbyPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/lobby" element={<Navigate to="/" replace />} />
      <Route path="/rooms/new" element={<CreateRoomPage />} />
      <Route path="/rooms/:roomId" element={<WaitingRoomPage />} />
      <Route path="/rooms/:roomId/arena" element={<ArenaPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
