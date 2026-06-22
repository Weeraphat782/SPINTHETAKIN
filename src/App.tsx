import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PlayerApp from './pages/PlayerApp'
import AdminApp from './pages/AdminApp'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', position: 'fixed', inset: 0 }}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<PlayerApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
