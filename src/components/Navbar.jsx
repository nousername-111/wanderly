import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../App';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/plan', label: 'Plan Trip' },
        { to: '/trips', label: 'My Trips' },
        { to: '/history', label: 'History' },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Wander<span className="text-orange-400">ly</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.to)
                  ? 'text-orange-400 bg-orange-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs text-white/70 max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-white/50 hover:text-white transition-colors px-3 py-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link to="/auth" className="btn-primary text-sm py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 glass rounded-lg"
        >
          <div className={`w-5 flex flex-col gap-1 transition-all ${menuOpen ? 'gap-0' : ''}`}>
            <span className={`h-0.5 bg-white block transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-0.5' : ''}`}/>
            <span className={`h-0.5 bg-white block transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}/>
            <span className={`h-0.5 bg-white block transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}/>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 mt-2 mx-4 rounded-2xl p-4 space-y-1 animate-in">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(link.to)
                  ? 'text-orange-400 bg-orange-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-white/50 hover:text-white">
                Sign Out
              </button>
            ) : (
              <Link to="/auth" className="block btn-primary text-center text-sm mt-2">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
