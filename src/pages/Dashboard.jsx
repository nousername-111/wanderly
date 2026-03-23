import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [trips, setTrips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;
    // Load profile from Supabase user metadata
    const meta = user.user_metadata || {};
    const p = { name: meta.full_name || meta.name || '', phone: meta.phone || '' };
    setProfile(p);
    setForm(p);

    // Load trips
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (!error && data) setTrips(data);
    } catch (_) {}
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: form.name, phone: form.phone }
      });
      if (error) throw error;
      setProfile(form);
      setEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const quickActions = [
    { to: '/plan', icon: '🤖', label: 'Plan New Trip', desc: 'AI-powered itinerary builder', color: 'orange' },
    { to: '/trips', icon: '🗺️', label: 'My Trips', desc: `${trips.length} saved trips`, color: 'blue' },
    { to: '/history', icon: '📋', label: 'History', desc: 'Past recommendations', color: 'green' },
  ];

  return (
    <div className="bg-mesh min-h-screen page-wrapper px-4 pt-28 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-in">
          <p className="text-white/40 text-sm mb-1">Welcome back</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
            {profile.name || user?.email?.split('@')[0] || 'Traveler'} 👋
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 animate-in stagger-1">
            <div className="card h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-white">Profile</h2>
                <button
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-orange-500/25 mb-3">
                  {(profile.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <p className="text-xs text-white/40">{user?.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Full Name</label>
                  {editing ? (
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-style text-sm"
                      placeholder="Your name"
                    />
                  ) : (
                    <p className="text-white/80 text-sm">{profile.name || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Email</label>
                  <p className="text-white/60 text-sm truncate">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Phone</label>
                  {editing ? (
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input-style text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : (
                    <p className="text-white/80 text-sm">{profile.phone || '—'}</p>
                  )}
                </div>

                {editing && (
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                  >
                    {saving ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</> : 'Save Changes'}
                  </button>
                )}
              </div>

              {/* Verification badge */}
              <div className={`mt-6 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                user?.email_confirmed_at
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                <span>{user?.email_confirmed_at ? '✅' : '⚠️'}</span>
                <span>{user?.email_confirmed_at ? 'Email verified' : 'Email not verified'}</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="animate-in stagger-2">
              <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {quickActions.map(a => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="card hover:border-orange-500/25 hover:-translate-y-1 transition-all duration-200 group"
                  >
                    <div className="text-2xl mb-3">{a.icon}</div>
                    <div className="font-medium text-white text-sm group-hover:text-orange-300 transition-colors">{a.label}</div>
                    <div className="text-white/40 text-xs mt-1">{a.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Trips */}
            <div className="animate-in stagger-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Recent Trips</h2>
                <Link to="/trips" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">View all →</Link>
              </div>

              {trips.length === 0 ? (
                <div className="card text-center py-10">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-white/40 text-sm mb-4">No trips planned yet</p>
                  <Link to="/plan" className="btn-primary text-sm px-6 py-2.5 inline-block">Plan Your First Trip</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map(trip => (
                    <div key={trip.id} className="card hover:border-orange-500/20 transition-all trip-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{trip.destination}</div>
                          <div className="text-white/40 text-xs mt-0.5">{trip.country} · {trip.interest}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-400 font-semibold text-sm">${trip.budget}</div>
                          <div className="text-white/30 text-xs">{new Date(trip.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="animate-in stagger-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Trips Planned', value: trips.length, icon: '🗺️' },
                  { label: 'Countries', value: [...new Set(trips.map(t => t.country))].length, icon: '🌍' },
                  { label: 'AI Queries', value: trips.length, icon: '🤖' },
                ].map(stat => (
                  <div key={stat.label} className="card text-center">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="font-display text-2xl font-bold text-orange-400">{stat.value}</div>
                    <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/20 text-red-300' : 'bg-dark-800 text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
