import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SessionCreated() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pin = searchParams.get('pin') || '';
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}#/session/${sessionId}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 space-y-8 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold">Session Created!</h2>
        <p className="text-gray-500">Share this link with your team to start voting.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm text-gray-500 font-medium">Shareable Link</p>
        <p className="font-mono text-sm break-all bg-gray-50 rounded px-3 py-2">{shareUrl}</p>
        <button
          onClick={copyLink}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      <button
        onClick={() => navigate(`/session/${sessionId}/results?pin=${pin}`)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition"
      >
        View Results (Admin)
      </button>
    </div>
  );
}
