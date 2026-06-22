import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PlayerApp from './pages/PlayerApp'
import AdminApp from './pages/AdminApp'

export default function App() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<PlayerApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
