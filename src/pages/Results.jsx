import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase, supabaseWithPin } from '../supabaseClient';

const COLOR_MAP = {
  GREEN: { bg: 'bg-green-500', text: 'text-green-700', label: 'Awesome' },
  AMBER: { bg: 'bg-yellow-400', text: 'text-yellow-700', label: 'OK' },
  RED: { bg: 'bg-red-500', text: 'text-red-700', label: 'Struggling' },
};

export default function Results() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [pin, setPin] = useState(searchParams.get('pin') || '');
  const [unlocked, setUnlocked] = useState(!!searchParams.get('pin'));
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLabel, setExportLabel] = useState('Export Summary');

  // Load session (public read)
  useEffect(() => {
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError('Session not found.');
        else setSession(data);
        if (!unlocked) setLoading(false);
      });
  }, [sessionId]);

  // Load responses when unlocked
  useEffect(() => {
    if (!unlocked || !pin) return;
    setLoading(true);
    setError(null);

    const client = supabaseWithPin(pin);
    client
      .from('responses')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data, error: err }) => {
        if (err || !data || data.length === 0) {
          if (err) {
            setError('Invalid PIN or no responses yet.');
            setUnlocked(false);
          } else {
            setResponses([]);
          }
        } else {
          setResponses(data);
        }
        setLoading(false);
      });
  }, [unlocked, pin, sessionId]);

  // Compute trends when session loads
  useEffect(() => {
    if (!session) return;
    supabase
      .from('sessions')
      .select('id, created_at')
      .eq('name', session.name)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data || data.length < 2) return;
        // The previous session is the second one (current is first)
        const prevSessionId = data[1].id;
        // We need the admin pin to read responses of the prev session too
        if (!pin) return;
        const client = supabaseWithPin(pin);
        client
          .from('responses')
          .select('votes')
          .eq('session_id', prevSessionId)
          .then(({ data: prevResponses }) => {
            if (prevResponses && prevResponses.length > 0) {
              setTrends(computeScores(prevResponses));
            }
          });
      });
  }, [session, pin]);

  if (!unlocked) {
    return (
      <PinGate
        pin={pin}
        setPin={setPin}
        onUnlock={() => setUnlocked(true)}
        error={error}
        loading={loading}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const cards = session?.cards || [];
  const totals = responses.length;
  const scores = computeScores(responses);
  const prevScores = trends;

  function getTrend(cardId) {
    if (!prevScores || !prevScores[cardId] || !scores[cardId]) return null;
    const curr = scores[cardId].GREEN / Math.max(totals, 1);
    const prev = prevScores[cardId].GREEN / Math.max(prevScores[cardId].total, 1);
    if (curr > prev + 0.05) return '↑';
    if (curr < prev - 0.05) return '↓';
    return '→';
  }

  function getMajority(cardId) {
    const s = scores[cardId];
    if (!s) return 'GREEN';
    if (s.GREEN >= s.AMBER && s.GREEN >= s.RED) return 'GREEN';
    if (s.AMBER >= s.GREEN && s.AMBER >= s.RED) return 'AMBER';
    return 'RED';
  }

  function collectComments(cardId) {
    return responses
      .map((r) => r.comments?.[cardId])
      .filter(Boolean);
  }

  function exportSummary() {
    let text = `Squad Health Check: ${session.name}\n`;
    text += `Date: ${new Date(session.created_at).toLocaleDateString()}\n`;
    text += `Respondents: ${totals}\n\n`;
    for (const card of cards) {
      const s = scores[card.id] || { GREEN: 0, AMBER: 0, RED: 0 };
      const trend = getTrend(card.id);
      text += `${card.title}${trend ? ' ' + trend : ''}\n`;
      text += `  Awesome: ${s.GREEN} (${pct(s.GREEN, totals)}) | OK: ${s.AMBER} (${pct(s.AMBER, totals)}) | Struggling: ${s.RED} (${pct(s.RED, totals)})\n`;
      const cmts = collectComments(card.id);
      if (cmts.length) {
        cmts.forEach((c) => (text += `  - "${c}"\n`));
      }
      text += '\n';
    }
    navigator.clipboard.writeText(text);
  }

  function handleExport() {
    exportSummary();
    setExportLabel('Copied!');
    setTimeout(() => setExportLabel('Export Summary'), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{session.name}</h2>
          <p className="text-sm text-gray-500">
            {totals} respondent{totals !== 1 ? 's' : ''} · Created{' '}
            {new Date(session.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
        >
          {exportLabel}
        </button>
      </div>

      {totals === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No responses yet</p>
          <p className="text-sm">Share the session link with your team to collect votes.</p>
        </div>
      ) : (
        <>
          {/* Heatmap */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Heatmap</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {cards.map((card) => {
                const majority = getMajority(card.id);
                const trend = getTrend(card.id);
                const bgClass =
                  majority === 'GREEN'
                    ? 'bg-green-500'
                    : majority === 'AMBER'
                      ? 'bg-yellow-400'
                      : 'bg-red-500';
                const textClass = majority === 'AMBER' ? 'text-yellow-900' : 'text-white';
                return (
                  <div
                    key={card.id}
                    className={`${bgClass} ${textClass} rounded-lg p-3 text-center`}
                  >
                    <p className="text-sm font-semibold leading-tight">{card.title}</p>
                    {trend && <p className="text-lg mt-1">{trend}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Per-card breakdown */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Breakdown</h3>
            {cards.map((card) => {
              const s = scores[card.id] || { GREEN: 0, AMBER: 0, RED: 0 };
              const trend = getTrend(card.id);
              const cmts = collectComments(card.id);
              return (
                <div
                  key={card.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{card.title}</h4>
                    {trend && (
                      <span
                        className={`text-sm font-bold ${
                          trend === '↑'
                            ? 'text-green-600'
                            : trend === '↓'
                              ? 'text-red-600'
                              : 'text-gray-400'
                        }`}
                      >
                        {trend}
                      </span>
                    )}
                  </div>

                  {/* RAG bar */}
                  <div className="flex h-7 rounded-lg overflow-hidden">
                    {['GREEN', 'AMBER', 'RED'].map((color) => {
                      const count = s[color];
                      const width = totals > 0 ? (count / totals) * 100 : 0;
                      if (width === 0) return null;
                      return (
                        <div
                          key={color}
                          className={`${COLOR_MAP[color].bg} flex items-center justify-center text-xs font-semibold ${color === 'AMBER' ? 'text-yellow-900' : 'text-white'}`}
                          style={{ width: `${width}%` }}
                        >
                          {count > 0 && `${count} (${pct(count, totals)})`}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 text-xs text-gray-500">
                    {['GREEN', 'AMBER', 'RED'].map((color) => (
                      <span key={color} className="flex items-center gap-1">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${COLOR_MAP[color].bg}`}
                        />
                        {COLOR_MAP[color].label}: {s[color]}
                      </span>
                    ))}
                  </div>

                  {/* Comments */}
                  {cmts.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                      <p className="text-xs font-medium text-gray-400 uppercase">Comments</p>
                      {cmts.map((c, i) => (
                        <p key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-gray-200">
                          {c}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

function PinGate({ pin, setPin, onUnlock, error }) {
  function handleSubmit(e) {
    e.preventDefault();
    if (pin.length === 4) onUnlock();
  }
  return (
    <div className="max-w-sm mx-auto px-4 py-24 space-y-6 text-center">
      <h2 className="text-2xl font-bold">Admin Access</h2>
      <p className="text-gray-500">Enter the 4-digit PIN to view results.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="PIN"
          className="w-32 mx-auto block text-center border border-gray-300 rounded-lg px-4 py-3 text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={pin.length !== 4}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 px-4 rounded-lg transition"
        >
          Unlock Results
        </button>
      </form>
    </div>
  );
}

function computeScores(responses) {
  const scores = {};
  for (const r of responses) {
    for (const [cardId, vote] of Object.entries(r.votes || {})) {
      if (!scores[cardId]) scores[cardId] = { GREEN: 0, AMBER: 0, RED: 0, total: 0 };
      if (scores[cardId][vote] !== undefined) scores[cardId][vote]++;
      scores[cardId].total++;
    }
  }
  return scores;
}

function pct(count, total) {
  if (total === 0) return '0%';
  return `${Math.round((count / total) * 100)}%`;
}
