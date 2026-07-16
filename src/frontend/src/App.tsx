import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import LobbyPage from './pages/lobby/LobbyPage'
import WaitingRoomPage from './pages/rooms/[roomId]/WaitingRoomPage'
import ArenaPage from './pages/rooms/[roomId]/arena/ArenaPage'
import { UserProvider, useUser } from './context/UserContext/index.tsx'
import { WebSocketProvider } from './context/WsContext/index.tsx'

const ProtectedLayout = () => {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-black">
        <h1 className="text-4xl">Loading...</h1>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/lobby" element={<LobbyPage />} />

        <Route path="/rooms/" element={<Outlet />}>
          <Route path=":roomId" element={<WaitingRoomPage />} />
          <Route path=":roomId/arena" element={<ArenaPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <WebSocketProvider>
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </WebSocketProvider>
  )
}

export default App
