import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');

  function handleJoin(e) {
    e.preventDefault();
    const id = joinId.trim();
    if (id) {
      // Accept a full URL or just a session ID
      const match = id.match(/session\/([a-f0-9-]+)/i);
      navigate(`/session/${match ? match[1] : id}`);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Squad Health Check</h2>
        <p className="text-gray-500">
          Run a Spotify-style health check with your team. No sign-up required.
        </p>
      </div>

      <div className="space-y-6">
        <button
          onClick={() => navigate('/create')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          Create New Session
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-3 text-gray-400">or</span>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Enter Session as Team Member
          </label>
          <input
            type="text"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Paste session link or ID"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={!joinId.trim()}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium py-2.5 px-4 rounded-lg transition"
          >
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
}
