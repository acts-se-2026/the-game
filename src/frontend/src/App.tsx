import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import LobbyPage from './pages/lobby/LobbyPage'
import WaitingRoomPage from './pages/rooms/[roomId]/WaitingRoomPage'
import ArenaPage from './pages/rooms/[roomId]/arena/ArenaPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/lobby/" element={<LobbyPage />} />

      <Route path="/rooms/" element={<Outlet />}>
        <Route path=":roomId" element={<WaitingRoomPage />} />
        <Route path=":roomId/arena" element={<ArenaPage />} />
      </Route>
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
