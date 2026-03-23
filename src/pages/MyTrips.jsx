import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../supabaseClient';

export default function MyTrips() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);

  const viewTrip = (trip) => {
    if (trip.plan) {
      sessionStorage.setItem('wanderly_plan', JSON.stringify(trip.plan));
      sessionStorage.setItem('wanderly_form', JSON.stringify({
        budget: trip.budget,
        duration: trip.duration,
        interest: trip.interest,
        travelers: '1',
        from: '',
        destination: trip.destination,
      }));
      navigate('/recommendation');
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTrips = async () => {
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

  useEffect(() => { if (user) loadTrips(); }, [user]);

  const deleteTrip = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
      setTrips(t => t.filter(x => x.id !== id));
      showToast('Trip deleted.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const interestEmoji = {
    beach: '🏖️', adventure: '🧗', culture: '🏛️', food: '🍜',
    nature: '🌿', romance: '💎', spiritual: '🧘', nightlife: '🎉',
  };

  return (
    <div className="bg-mesh min-h-screen page-wrapper px-4 pt-28 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 animate-in">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-1">My Trips</h1>
            <p className="text-white/40">All your saved AI-generated travel plans</p>
          </div>
          <Link to="/plan" className="btn-primary text-sm flex items-center gap-2">
            <span>+</span><span>New Trip</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : trips.length === 0 ? (
          <div className="card text-center py-16 animate-in">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="font-display text-2xl font-bold text-white mb-3">No trips yet</h3>
            <p className="text-white/40 mb-6 max-w-sm mx-auto">
              Plan your first AI-generated trip and it will appear here.
            </p>
            <Link to="/plan" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              <span>✈️</span><span>Plan My First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, i) => {
              const plan = trip.plan;
              const isOpen = expanded === trip.id;

              return (
                <div
                  key={trip.id}
                  className={`card trip-card border transition-all duration-300 animate-in stagger-${(i % 4) + 1} ${
                    isOpen ? 'border-orange-500/30' : 'border-transparent hover:border-white/10'
                  }`}
                >
                  {/* Trip header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-xl shrink-0">
                        {interestEmoji[trip.interest] || '✈️'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-bold text-white truncate">{trip.destination}</h3>
                        <p className="text-white/50 text-sm">{trip.country}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {/* Fix interest display - handle array or string */}
                          {(Array.isArray(trip.interest)
                            ? trip.interest
                            : typeof trip.interest === 'string' && trip.interest.startsWith('[')
                              ? JSON.parse(trip.interest)
                              : [trip.interest]
                          ).map((i, idx) => (
                            <span key={idx} className="tag-pill capitalize">{i}</span>
                          ))}
                          <span className="tag-pill">{trip.duration} days</span>
                          <span className="tag-pill">${Number(trip.budget).toLocaleString()} budget</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block mr-2">
                        <div className="text-orange-400 font-bold">${plan?.estimatedTotal?.toLocaleString() || trip.budget}</div>
                        <div className="text-white/30 text-xs">{new Date(trip.created_at).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => setExpanded(isOpen ? null : trip.id)}
                        className="glass hover:bg-white/10 text-white/60 hover:text-white px-3 py-2 rounded-lg text-xs transition-all"
                      >
                        {isOpen ? '▲ Less' : '▼ More'}
                      </button>
                      {trip.plan && (
                        <button
                          onClick={() => viewTrip(trip)}
                          className="glass hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 px-3 py-2 rounded-lg text-xs transition-all font-medium"
                        >
                          🗺️ View
                        </button>
                      )}
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        disabled={deleting === trip.id}
                        className="glass hover:bg-red-500/10 text-white/30 hover:text-red-400 p-2 rounded-lg transition-all"
                      >
                        {deleting === trip.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded plan */}
                  {isOpen && plan && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-5">
                      {plan.tagline && (
                        <p className="text-white/50 italic font-display">"{plan.tagline}"</p>
                      )}

                      {/* Why visit */}
                      {plan.whyVisit && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/60 mb-2">🌟 Why Visit</h4>
                          <ul className="space-y-1.5">
                            {plan.whyVisit.map((r, j) => (
                              <li key={j} className="text-white/60 text-sm flex gap-2">
                                <span className="text-orange-400">→</span><span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Budget */}
                      {plan.budgetBreakdown && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/60 mb-3">💰 Budget</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {Object.entries(plan.budgetBreakdown).map(([k, v]) => (
                              <div key={k} className="glass rounded-lg p-3 text-center">
                                <div className="text-white font-semibold text-sm">${Number(v).toLocaleString()}</div>
                                <div className="text-white/40 text-xs capitalize mt-0.5">{k}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top activities */}
                      {plan.topActivities && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/60 mb-2">🎯 Top Activities</h4>
                          <div className="flex flex-wrap gap-2">
                            {plan.topActivities.map((a, j) => (
                              <span key={j} className="text-xs glass px-3 py-1.5 rounded-lg text-white/60">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best time */}
                      {plan.bestTime && (
                        <p className="text-sm text-white/50">
                          <span className="text-white/30">Best time to visit:</span>{' '}
                          <span>{plan.bestTime}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'bg-red-900/80 text-red-300 border-red-500/20' : 'bg-dark-800 text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
