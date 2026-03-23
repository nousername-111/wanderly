import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { interests } from '../data/destinations';

export default function TripBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    budget: '',
    interest: [],
    duration: '7',
    travelers: '1',
    from: '',
    destination: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load prefill data from destination card click
  useEffect(() => {
    const prefill = sessionStorage.getItem('wanderly_prefill');
    if (prefill) {
      const data = JSON.parse(prefill);
      setForm(f => ({
        ...f,
        destination: data.destination || '',
        interest: data.interest ? [data.interest] : [],
        budget: data.budget ? String(data.budget) : '',
      }));
      sessionStorage.removeItem('wanderly_prefill');
    }
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.budget || form.interest.length === 0) {
      setError('Please enter a budget and select at least one interest.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, interest: form.interest.join(', '), destination: form.destination || '', userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI request failed');

      // Store plan and form in sessionStorage then navigate
      sessionStorage.setItem('wanderly_plan', JSON.stringify(data.plan));
      sessionStorage.setItem('wanderly_form', JSON.stringify(form));
      navigate('/recommendation');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen page-wrapper px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-in">
          <div className="inline-flex items-center gap-2 glass-orange rounded-full px-4 py-2 mb-4">
            <span className="text-orange-300 text-sm">🤖 AI Trip Builder</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Plan Your Perfect Trip
          </h1>
          <p className="text-white/40">Tell us your preferences and our AI will craft a personalized itinerary.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6 animate-in stagger-1">
          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              💰 Total Budget (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
              <input
                type="number"
                required
                min="100"
                max="100000"
                placeholder="e.g. 2000"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
                className="input-style pl-8"
              />
            </div>
            {form.budget && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {['500', '1000', '2000', '5000'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set('budget', b)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                      form.budget === b ? 'bg-orange-500 text-white' : 'glass text-white/50 hover:text-white'
                    }`}
                  >${b}</button>
                ))}
              </div>
            )}
            {!form.budget && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {['500', '1000', '2000', '5000'].map(b => (
                  <button key={b} type="button" onClick={() => set('budget', b)}
                    className="text-xs px-3 py-1.5 rounded-lg glass text-white/50 hover:text-white transition-all">
                    ${b}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interest */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              🎯 Travel Interests <span className="text-white/30 text-xs font-normal">(select multiple)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {interests.map(i => {
                const selected = form.interest.includes(i.value);
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => {
                      set('interest', selected
                        ? form.interest.filter(x => x !== i.value)
                        : [...form.interest, i.value]
                      );
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 border relative ${
                      selected
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                        : 'glass border-transparent text-white/50 hover:text-white hover:border-white/15'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 rounded-full text-white flex items-center justify-center text-xs leading-none">✓</span>
                    )}
                    <span className="text-xl">{i.icon}</span>
                    <span className="text-center leading-tight">{i.label}</span>
                  </button>
                );
              })}
            </div>
            {form.interest.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.interest.map(v => {
                  const found = interests.find(i => i.value === v);
                  return (
                    <span key={v} className="tag-pill text-xs flex items-center gap-1">
                      {found?.icon} {found?.label}
                      <button onClick={() => set('interest', form.interest.filter(x => x !== v))} className="ml-1 text-orange-300/60 hover:text-orange-300">×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Duration & Travelers */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">📅 Duration (days)</label>
              <select value={form.duration} onChange={e => set('duration', e.target.value)} className="input-style">
                {['3','5','7','10','14','21','30'].map(d => (
                  <option key={d} value={d} className="bg-gray-900">{d} days</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">👥 Travelers</label>
              <select value={form.travelers} onChange={e => set('travelers', e.target.value)} className="input-style">
                {['1','2','3','4','5','6','8','10'].map(n => (
                  <option key={n} value={n} className="bg-gray-900">{n} {n === '1' ? 'person' : 'people'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* From */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">✈️ Traveling From (optional)</label>
            <input
              type="text"
              placeholder="e.g. New York, London, Mumbai"
              value={form.from}
              onChange={e => set('from', e.target.value)}
              className="input-style"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              📍 Preferred Destination
              <span className="text-white/30 text-xs font-normal ml-2">(optional — leave blank for AI to decide)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Bali, Paris, Tokyo, Goa..."
              value={form.destination}
              onChange={e => set('destination', e.target.value)}
              className="input-style"
            />
            {form.destination && (
              <p className="text-xs text-orange-400/70 mt-1.5 flex items-center gap-1">
                <span>✨</span>
                AI will build your itinerary around <strong>{form.destination}</strong>
              </p>
            )}
            {!form.destination && (
              <p className="text-xs text-white/25 mt-1.5">
                🤖 No destination? AI will recommend the perfect one based on your budget & interests
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI is crafting your trip...</span>
              </>
            ) : (
              <>
                <span>🤖</span>
                <span>Generate My Itinerary</span>
              </>
            )}
          </button>

          {loading && (
            <p className="text-center text-white/30 text-xs">
              This may take 10–20 seconds while our AI crafts your perfect trip ✨
            </p>
          )}
        </form>

        {/* Info note */}
        <div className="mt-6 glass rounded-xl p-4 flex gap-3 animate-in stagger-2">
          <span className="text-orange-400 shrink-0">ℹ️</span>
          <p className="text-white/40 text-xs leading-relaxed">
            Our AI analyzes your preferences and budget to suggest the ideal destination, 
            full day-by-day itinerary, cost breakdown, and insider tips — all in one click.
          </p>
        </div>
      </div>
    </div>
  );
}
