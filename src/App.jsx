import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import LandingPage from './pages/LandingPage'
import ComponentsDemo from './pages/ComponentsDemo'
import SubmitCV from './pages/SubmitCV'
import SubmissionSuccess from './pages/SubmissionSuccess'
import ClientChat from './pages/ClientChat'
import CVDownload from './pages/CVDownload'
import './index.css'

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/components-demo" element={<ComponentsDemo />} />
          <Route path="/submit" element={<SubmitCV />} />
          <Route path="/submit/success" element={<SubmissionSuccess />} />
          <Route path="/chat/:id" element={<ClientChat />} />
          <Route path="/download/:id" element={<CVDownload />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
