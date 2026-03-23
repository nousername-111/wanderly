import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../supabaseClient';

export default function Recommendation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeDay, setActiveDay] = useState(0);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const p = sessionStorage.getItem('wanderly_plan');
    const f = sessionStorage.getItem('wanderly_form');
    if (!p) { navigate('/plan'); return; }
    setPlan(JSON.parse(p));
    setForm(f ? JSON.parse(f) : null);
  }, []);

  const saveTrip = async () => {
    if (!user || saving || saved) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('trips').insert({
        user_id: user.id,
        destination: plan.destination,
        country: plan.country,
        budget: form?.budget || plan.estimatedTotal,
        duration: form?.duration || '7',
        interest: form?.interest || '',
        plan: plan,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSaved(true);
      showToast('Trip saved to your profile! 🎉');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!plan) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const totalBudget = plan.budgetBreakdown
    ? Object.values(plan.budgetBreakdown).reduce((a, b) => a + Number(b), 0)
    : plan.estimatedTotal || 0;

  const budgetColors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];

  return (
    <div className="bg-mesh min-h-screen page-wrapper px-4 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Card */}
        <div className="card border-orange-500/20 mb-8 relative overflow-hidden animate-in">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="tag-pill">✈️ AI Recommendation</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{plan.destination}</h1>
                <p className="text-white/50 text-lg">{plan.country}</p>
              </div>
              <div className="text-right">
                <div className="text-white/40 text-xs mb-1">Estimated Total</div>
                <div className="font-display text-3xl font-bold text-orange-400">${plan.estimatedTotal?.toLocaleString()}</div>
                {form && <div className="text-white/30 text-xs mt-1">for {form.travelers} traveler(s), {form.duration} days</div>}
              </div>
            </div>

            {plan.tagline && (
              <p className="text-white/60 italic font-display text-lg mb-6">"{plan.tagline}"</p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveTrip}
                disabled={saving || saved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  saved
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'btn-primary'
                } disabled:opacity-60`}
              >
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
                  : saved ? '✅ Saved to My Trips'
                  : '💾 Save This Trip'}
              </button>
              <Link to="/plan" className="btn-ghost text-sm px-5 py-2.5">← Plan Another</Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Why Visit */}
          {plan.whyVisit && (
            <div className="card animate-in stagger-1">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🌟</span> Why {plan.destination}?
              </h2>
              <ul className="space-y-3">
                {plan.whyVisit.map((r, i) => (
                  <li key={i} className="flex gap-3 text-white/70 text-sm leading-relaxed">
                    <span className="text-orange-400 mt-0.5 shrink-0">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Budget Breakdown */}
          {plan.budgetBreakdown && (
            <div className="card animate-in stagger-2">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>💰</span> Budget Breakdown
              </h2>
              <div className="space-y-3">
                {Object.entries(plan.budgetBreakdown).map(([key, val], i) => {
                  const pct = Math.round((Number(val) / totalBudget) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white/60 capitalize">{key}</span>
                        <span className="text-white font-medium">${Number(val).toLocaleString()} <span className="text-white/30 text-xs">({pct}%)</span></span>
                      </div>
                      <div className="budget-bar">
                        <div className={`budget-bar-fill ${budgetColors[i % budgetColors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                <span className="text-white/60 text-sm">Total</span>
                <span className="text-orange-400 font-bold">${totalBudget.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Activities */}
          {plan.topActivities && (
            <div className="card animate-in stagger-3">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Top Activities
              </h2>
              <ul className="space-y-2.5">
                {plan.topActivities.map((act, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-white/70 text-sm leading-relaxed">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tips */}
          {plan.proTips && (
            <div className="card animate-in stagger-4">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>💡</span> Insider Tips
              </h2>
              <ul className="space-y-3">
                {plan.proTips.map((tip, i) => (
                  <li key={i} className="glass rounded-xl px-4 py-3 text-sm text-white/70 leading-relaxed border-l-2 border-orange-500/40">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Itinerary */}
        {plan.itinerary && plan.itinerary.length > 0 && (
          <div className="card mt-6 animate-in stagger-5">
            <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
              <span>📅</span> Day-by-Day Itinerary
            </h2>

            {/* Day tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {plan.itinerary.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeDay === i
                      ? 'bg-orange-500 text-white'
                      : 'glass text-white/50 hover:text-white'
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>

            {/* Active day */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-orange-300 mb-4">
                Day {plan.itinerary[activeDay]?.day} — {plan.itinerary[activeDay]?.title}
              </h3>
              <ul className="space-y-3">
                {plan.itinerary[activeDay]?.activities?.map((act, i) => (
                  <li key={i} className="relative pl-7">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-orange-500/50 bg-orange-500/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    </div>
                    {i < plan.itinerary[activeDay].activities.length - 1 && (
                      <div className="day-connector" />
                    )}
                    <span className="text-white/70 text-sm leading-relaxed">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6 animate-in">
          {plan.bestTime && (
            <div className="card">
              <div className="flex gap-3">
                <span className="text-2xl">🌤️</span>
                <div>
                  <div className="text-xs text-white/40 mb-0.5">Best Time to Visit</div>
                  <div className="text-white/80 text-sm">{plan.bestTime}</div>
                </div>
              </div>
            </div>
          )}
          {plan.packingEssentials && (
            <div className="card">
              <div className="text-xs text-white/40 mb-2">🎒 Packing Essentials</div>
              <div className="flex flex-wrap gap-1.5">
                {plan.packingEssentials.map((item, i) => (
                  <span key={i} className="tag-pill">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Websites */}
      <div className="max-w-4xl mx-auto mt-6 animate-in">
        <div className="card border-orange-500/15">
          <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
            <span>🔗</span> Book Your Trip to {plan.destination}
          </h2>
          <p className="text-white/40 text-xs mb-5">Curated links to plan and book every part of your trip</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                category: '✈️ Flights',
                links: [
                  { name: 'Google Flights', url: `https://www.google.com/flights?q=flights+to+${encodeURIComponent(plan.destination)}`, desc: 'Best price comparison' },
                  { name: 'Skyscanner', url: `https://www.skyscanner.com/flights-to/${encodeURIComponent(plan.destination.toLowerCase().replace(/\s/g, '-'))}`, desc: 'Find cheapest fares' },
                  { name: 'MakeMyTrip', url: `https://www.makemytrip.com/flights/`, desc: 'Great for Indian travelers' },
                ]
              },
              {
                category: '🏨 Hotels',
                links: [
                  { name: 'Booking.com', url: `https://www.booking.com/search.html?ss=${encodeURIComponent(plan.destination)}`, desc: 'Largest hotel selection' },
                  { name: 'Airbnb', url: `https://www.airbnb.com/s/${encodeURIComponent(plan.destination)}/homes`, desc: 'Unique stays & apartments' },
                  { name: 'Agoda', url: `https://www.agoda.com/search?city=${encodeURIComponent(plan.destination)}`, desc: 'Best deals in Asia' },
                ]
              },
              {
                category: '🎯 Activities',
                links: [
                  { name: 'Viator', url: `https://www.viator.com/search?text=${encodeURIComponent(plan.destination)}`, desc: 'Tours & experiences' },
                  { name: 'GetYourGuide', url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(plan.destination)}`, desc: 'Local activities & tours' },
                  { name: 'Klook', url: `https://www.klook.com/en-IN/search/?query=${encodeURIComponent(plan.destination)}`, desc: 'Asian experiences' },
                ]
              },
              {
                category: '🗺️ Travel Info',
                links: [
                  { name: 'TripAdvisor', url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(plan.destination)}`, desc: 'Reviews & recommendations' },
                  { name: 'Lonely Planet', url: `https://www.lonelyplanet.com/search?q=${encodeURIComponent(plan.destination)}`, desc: 'Travel guides' },
                  { name: 'WikiVoyage', url: `https://en.wikivoyage.org/wiki/${encodeURIComponent(plan.destination)}`, desc: 'Free travel wiki' },
                ]
              },
              {
                category: '🚌 Transport',
                links: [
                  { name: 'Rome2Rio', url: `https://www.rome2rio.com/s/${encodeURIComponent(plan.destination)}`, desc: 'All transport options' },
                  { name: 'Trainline', url: `https://www.thetrainline.com/`, desc: 'Trains in Europe' },
                  { name: 'Grab / Uber', url: `https://www.grab.com/`, desc: 'Local rides & taxis' },
                ]
              },
              {
                category: '🛡️ Insurance & Visa',
                links: [
                  { name: 'SafetyWing', url: `https://safetywing.com/`, desc: 'Travel insurance' },
                  { name: 'iVisa', url: `https://www.ivisa.com/`, desc: 'Easy visa applications' },
                  { name: 'Wise', url: `https://wise.com/`, desc: 'Best exchange rates' },
                ]
              },
            ].map((section) => (
              <div key={section.category} className="glass rounded-xl p-4">
                <div className="text-sm font-semibold text-white/70 mb-3">{section.category}</div>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between group hover:bg-white/5 rounded-lg px-2 py-1.5 transition-all duration-200"
                    >
                      <div>
                        <div className="text-sm text-white/80 group-hover:text-orange-300 transition-colors font-medium">{link.name}</div>
                        <div className="text-xs text-white/30">{link.desc}</div>
                      </div>
                      <span className="text-white/20 group-hover:text-orange-400 transition-colors text-xs">→</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Currency tip */}
          <div className="mt-4 glass rounded-xl px-4 py-3 flex gap-3 items-start">
            <span className="text-orange-400 shrink-0">💡</span>
            <p className="text-white/40 text-xs leading-relaxed">
              <span className="text-white/60 font-medium">Pro tip:</span> Use <strong className="text-white/60">Wise</strong> or <strong className="text-white/60">Revolut</strong> for the best currency exchange rates when traveling to {plan.destination}. Avoid airport currency exchange counters — they charge up to 10% fees.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/20 text-red-300' : 'bg-dark-800 text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
