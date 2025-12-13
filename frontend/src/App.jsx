import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UploadStory from './pages/UploadStory'
import StoryPage from './pages/StoryPage'
import RadioPage from './pages/RadioPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadStory />} />
        <Route path="/story/:id" element={<StoryPage />} />
        <Route path="/radios" element={<RadioPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </div>
  )
}

export default App
