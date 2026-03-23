import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '✅ Check your email to verify your account, then sign in!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-white">Wander<span className="text-orange-400">ly</span></span>
          </Link>
          <p className="text-white/40 text-sm mt-2">Your AI-powered travel companion</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Toggle */}
          <div className="flex glass rounded-xl p-1 mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setMessage(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  mode === m ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'text-white/50 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-white/50 mb-1.5 font-medium">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="input-style"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input-style"
              />
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="input-style"
              />
            </div>

            {message && (
              <div className={`rounded-xl px-4 py-3 text-sm ${
                message.type === 'error'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-green-500/10 border border-green-500/20 text-green-400'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}
              className="text-orange-400 hover:text-orange-300 transition-colors">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Protected by Supabase Authentication
        </p>
      </div>
    </div>
  );
}
