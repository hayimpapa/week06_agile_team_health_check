import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const VOTE_OPTIONS = [
  { value: 'GREEN', emoji: '🟢', label: 'Awesome' },
  { value: 'AMBER', emoji: '🟡', label: 'OK' },
  { value: 'RED', emoji: '🔴', label: 'Struggling' },
];

function getToken(sessionId) {
  const key = `shc_token_${sessionId}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

function hasSubmitted(sessionId) {
  return localStorage.getItem(`shc_submitted_${sessionId}`) === 'true';
}

function markSubmitted(sessionId) {
  localStorage.setItem(`shc_submitted_${sessionId}`, 'true');
}

export default function Vote() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (hasSubmitted(sessionId)) {
      setDone(true);
      setLoading(false);
      return;
    }
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError('Session not found.');
        else setSession(data);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) return <Loading />;
  if (done) return <ThankYou />;
  if (error) return <ErrorMsg message={error} />;

  const cards = session.cards || [];
  const card = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;
  const allVoted = cards.every((c) => votes[c.id]);

  function selectVote(value) {
    setVotes((prev) => ({ ...prev, [card.id]: value }));
  }

  function handleComment(value) {
    setComments((prev) => ({ ...prev, [card.id]: value }));
  }

  function goNext() {
    if (currentIndex < cards.length - 1) setCurrentIndex((i) => i + 1);
  }
  function goPrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  async function handleSubmit() {
    if (!allVoted) return;
    setSubmitting(true);
    setError(null);

    const filteredComments = {};
    for (const [k, v] of Object.entries(comments)) {
      if (v && v.trim()) filteredComments[k] = v.trim();
    }

    const { error: dbError } = await supabase.from('responses').insert({
      session_id: sessionId,
      respondent_token: getToken(sessionId),
      votes,
      comments: filteredComments,
    });

    if (dbError) {
      if (dbError.code === '23505') {
        // Unique constraint — already submitted
        markSubmitted(sessionId);
        setDone(true);
      } else {
        setError(dbError.message);
      }
      setSubmitting(false);
      return;
    }

    markSubmitted(sessionId);
    setDone(true);
    setSubmitting(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold">{session.name}</h2>
        <p className="text-sm text-gray-500">
          Card {currentIndex + 1} of {cards.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-semibold">{card.title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-800 mb-1">Awesome</p>
            <p className="text-sm text-green-700">{card.awesome}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-800 mb-1">Crappy</p>
            <p className="text-sm text-red-700">{card.crappy}</p>
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex gap-3">
          {VOTE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectVote(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition font-medium text-sm ${
                votes[card.id] === opt.value
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Comment (optional)
          </label>
          <textarea
            rows={2}
            value={comments[card.id] || ''}
            onChange={(e) => handleComment(e.target.value)}
            placeholder="Any thoughts on this area?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-medium py-2.5 rounded-lg transition"
        >
          Previous
        </button>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!allVoted || submitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition"
          >
            {submitting ? 'Submitting...' : allVoted ? 'Submit' : 'Vote on all cards first'}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition"
          >
            Next
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      {/* Quick-nav dots */}
      <div className="flex justify-center gap-1.5 pt-2">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              i === currentIndex
                ? 'bg-indigo-600'
                : votes[c.id]
                  ? 'bg-indigo-300'
                  : 'bg-gray-300'
            }`}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-400">Loading session...</p>
    </div>
  );
}

function ThankYou() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
        <span className="text-3xl">🎉</span>
      </div>
      <h2 className="text-2xl font-bold">Thank you!</h2>
      <p className="text-gray-500">Your response has been recorded. You can close this page now.</p>
    </div>
  );
}

function ErrorMsg({ message }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
      <h2 className="text-2xl font-bold text-red-600">Error</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
