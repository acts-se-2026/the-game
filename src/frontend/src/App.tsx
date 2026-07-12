import { BrowserRouter, Routes, Route } from 'react-router'
import MainPage from './pages/main'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
