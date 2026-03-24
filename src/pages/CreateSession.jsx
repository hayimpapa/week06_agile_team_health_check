import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { defaultCards } from '../defaultCards';

export default function CreateSession() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [cards, setCards] = useState(defaultCards);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Card editing helpers
  function updateCard(index, field, value) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }
  function removeCard(index) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }
  function addCard() {
    setCards((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, title: '', awesome: '', crappy: '' },
    ]);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (cards.some((c) => !c.title.trim())) {
      setError('Every card needs a title.');
      return;
    }
    setSaving(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from('sessions')
      .insert({ name: name.trim(), admin_pin: pin, cards })
      .select('id')
      .single();
    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }
    navigate(`/session/${data.id}/created?pin=${pin}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <h2 className="text-2xl font-bold">Create a New Session</h2>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Session name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Session Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 42 Health Check"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Admin PIN */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Admin PIN (4 digits)</label>
          <input
            required
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1234"
            className="w-40 border border-gray-300 rounded-lg px-4 py-2.5 tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Card deck editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Card Deck</h3>
            <button
              type="button"
              onClick={addCard}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add Card
            </button>
          </div>

          <div className="space-y-4">
            {cards.map((card, i) => (
              <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400 uppercase">Card {i + 1}</span>
                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCard(i)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  value={card.title}
                  onChange={(e) => updateCard(i, 'title', e.target.value)}
                  placeholder="Card title"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-green-700 mb-1">Awesome</label>
                    <input
                      value={card.awesome}
                      onChange={(e) => updateCard(i, 'awesome', e.target.value)}
                      placeholder="Example of awesome"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-red-700 mb-1">Crappy</label>
                    <input
                      value={card.crappy}
                      onChange={(e) => updateCard(i, 'crappy', e.target.value)}
                      placeholder="Example of crappy"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          {saving ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
}
