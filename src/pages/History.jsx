import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../supabaseClient';

export default function History() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) setTrips(data);
      } catch (_) {}
      finally { setLoading(false); }
    };
    if (user) load();
  }, [user]);

  const interests = ['all', ...new Set(trips.map(t => t.interest).filter(Boolean))];
  const filtered = filter === 'all' ? trips : trips.filter(t => t.interest === filter);

  // Group by month
  const grouped = filtered.reduce((acc, trip) => {
    const month = new Date(trip.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(trip);
    return acc;
  }, {});

  const interestEmoji = {
    beach: '🏖️', adventure: '🧗', culture: '🏛️', food: '🍜',
    nature: '🌿', romance: '💎', spiritual: '🧘', nightlife: '🎉',
  };

  const totalBudget = trips.reduce((sum, t) => sum + (Number(t.budget) || 0), 0);
  const countries = [...new Set(trips.map(t => t.country).filter(Boolean))];

  return (
    <div className="bg-mesh min-h-screen page-wrapper px-4 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-in">
          <h1 className="font-display text-4xl font-bold text-white mb-1">Trip History</h1>
          <p className="text-white/40">A timeline of all your AI-generated travel plans</p>
        </div>

        {/* Summary Stats */}
        {trips.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 animate-in stagger-1">
            <div className="card text-center">
              <div className="font-display text-3xl font-bold text-orange-400 mb-1">{trips.length}</div>
              <div className="text-white/40 text-xs">Total Trips</div>
            </div>
            <div className="card text-center">
              <div className="font-display text-3xl font-bold text-orange-400 mb-1">{countries.length}</div>
              <div className="text-white/40 text-xs">Countries Explored</div>
            </div>
            <div className="card text-center">
              <div className="font-display text-3xl font-bold text-orange-400 mb-1">
                ${(totalBudget / 1000).toFixed(1)}k
              </div>
              <div className="text-white/40 text-xs">Total Budget Planned</div>
            </div>
          </div>
        )}

        {/* Countries visited */}
        {countries.length > 0 && (
          <div className="card mb-6 animate-in stagger-2">
            <h3 className="text-sm font-semibold text-white/60 mb-3">🌍 Destinations Explored</h3>
            <div className="flex flex-wrap gap-2">
              {countries.map(c => (
                <span key={c} className="tag-pill">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        {interests.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6 animate-in stagger-3">
            {interests.map(i => (
              <button
                key={i}
                onClick={() => setFilter(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  filter === i
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'glass text-white/50 hover:text-white'
                }`}
              >
                {interestEmoji[i] || '✈️'} {i}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner" />
          </div>
        ) : trips.length === 0 ? (
          <div className="card text-center py-16 animate-in">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="font-display text-2xl font-bold text-white mb-3">No history yet</h3>
            <p className="text-white/40 mb-6 max-w-sm mx-auto">
              Plan your first trip and it'll show up here as your travel history grows.
            </p>
            <Link to="/plan" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              <span>🤖</span><span>Plan a Trip with AI</span>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-white/40">No trips match this filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, monthTrips]) => (
              <div key={month} className="animate-in">
                {/* Month label */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">{month}</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-white/30">{monthTrips.length} trip{monthTrips.length > 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-3">
                  {monthTrips.map(trip => {
                    const plan = trip.plan;
                    return (
                      <div key={trip.id} className="card hover:border-orange-500/20 transition-all duration-200 trip-card">
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center pt-1">
                            <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-sm shrink-0">
                              {interestEmoji[trip.interest] || '✈️'}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h3 className="font-display text-lg font-bold text-white">{trip.destination}</h3>
                                <p className="text-white/40 text-xs mt-0.5">
                                  {trip.country} · {new Date(trip.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-orange-400 font-bold">${Number(trip.budget).toLocaleString()}</div>
                                <div className="text-white/30 text-xs">{trip.duration} days</div>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="tag-pill capitalize">{trip.interest}</span>
                              {plan?.estimatedTotal && (
                                <span className="tag-pill">Est. ${plan.estimatedTotal.toLocaleString()}</span>
                              )}
                            </div>

                            {/* Tagline */}
                            {plan?.tagline && (
                              <p className="text-white/30 text-xs italic mt-2">"{plan.tagline}"</p>
                            )}

                            {/* Quick activities preview */}
                            {plan?.topActivities && (
                              <div className="flex gap-1.5 mt-3 flex-wrap">
                                {plan.topActivities.slice(0, 3).map((a, i) => (
                                  <span key={i} className="text-xs bg-white/5 text-white/40 px-2 py-1 rounded-md">{a}</span>
                                ))}
                                {plan.topActivities.length > 3 && (
                                  <span className="text-xs text-white/30 px-2 py-1">+{plan.topActivities.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA if has history */}
        {trips.length > 0 && (
          <div className="mt-10 text-center animate-in">
            <Link to="/plan" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              <span>🤖</span><span>Plan Another Trip</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
