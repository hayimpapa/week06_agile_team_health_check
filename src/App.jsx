import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CreateSession from './pages/CreateSession';
import SessionCreated from './pages/SessionCreated';
import Vote from './pages/Vote';
import Results from './pages/Results';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-2xl">🩺</span>
          <h1 className="text-lg font-semibold tracking-tight">Squad Health Check</h1>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/session/:sessionId/created" element={<SessionCreated />} />
          <Route path="/session/:sessionId" element={<Vote />} />
          <Route path="/session/:sessionId/results" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
}
