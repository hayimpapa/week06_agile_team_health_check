import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySessions, removeMySession } from '../utils/mySessions';

export default function Landing() {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');
  const [mySessions, setMySessions] = useState([]);

  useEffect(() => {
    setMySessions(getMySessions());
  }, []);

  function handleJoin(e) {
    e.preventDefault();
    const id = joinId.trim();
    if (id) {
      // Accept a full URL or just a session ID
      const match = id.match(/session\/([a-f0-9-]+)/i);
      navigate(`/session/${match ? match[1] : id}`);
    }
  }

  function handleOpenResults(session) {
    navigate(`/session/${session.id}/results?pin=${session.pin}`);
  }

  function handleForget(id) {
    removeMySession(id);
    setMySessions(getMySessions());
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

      {mySessions.length > 0 && (
        <section className="space-y-3" aria-labelledby="my-sessions-heading">
          <div className="flex items-center justify-between">
            <h3 id="my-sessions-heading" className="text-sm font-medium text-gray-700">
              My Sessions
            </h3>
            <span className="text-xs text-gray-400">Stored on this browser</span>
          </div>
          <ul className="divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg">
            {mySessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleOpenResults(s)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-medium text-gray-900 truncate">{s.name || 'Untitled session'}</p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleForget(s.id)}
                  aria-label={`Forget session ${s.name || s.id}`}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Forget
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
