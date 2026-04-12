import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import AboutThisBuild from './components/AboutThisBuild';
import Landing from './pages/Landing';
import CreateSession from './pages/CreateSession';
import SessionCreated from './pages/SessionCreated';
import Vote from './pages/Vote';
import Results from './pages/Results';

export default function App() {
  const [activeTab, setActiveTab] = useState('app');

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'app' ? (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<CreateSession />} />
            <Route path="/session/:sessionId/created" element={<SessionCreated />} />
            <Route path="/session/:sessionId" element={<Vote />} />
            <Route path="/session/:sessionId/results" element={<Results />} />
          </Routes>
        ) : (
          <AboutThisBuild />
        )}
      </main>
    </div>
  );
}
