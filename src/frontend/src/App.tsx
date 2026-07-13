import { BrowserRouter, Routes, Route } from 'react-router'
import MainPage from './pages/main'
import { WebSocketProvider } from './components/WsContext'
import TestWSPage from './pages/test-ws'

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/test-ws" element={<TestWSPage />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  )
}

export default App
