import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { destinations } from '../data/destinations';

const features = [
  { icon: '🤖', title: 'AI-Powered Planning', desc: 'GPT generates personalized itineraries, budget breakdowns, and activity suggestions tailored to your preferences.' },
  { icon: '🔐', title: 'Secure Authentication', desc: 'Email verification, secure sessions, and persistent profile management via Supabase.' },
  { icon: '📊', title: 'Budget Intelligence', desc: 'Smart budget allocation across flights, accommodation, food, and activities — no surprises.' },
  { icon: '🗺️', title: 'Trip History', desc: 'All your planned trips saved and accessible anytime from your personal dashboard.' },
];

const stats = [
  { value: '50+', label: 'Destinations' },
  { value: '10k+', label: 'Trips Planned' },
  { value: '98%', label: 'Satisfaction' },
  { value: 'AI', label: 'Powered' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-mesh min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass-orange rounded-full px-4 py-2 mb-8 animate-in">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-300 text-sm font-medium">AI-Powered Travel Planning</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6 animate-in stagger-1">
            Travel Smarter<br />
            <span className="text-gradient">with AI</span>
          </h1>

          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in stagger-2">
            Tell us your budget and interests. Our AI builds a complete personalized itinerary —
            activities, budget breakdown, and insider tips — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in stagger-3">
            <Link to={user ? '/plan' : '/auth'} className="btn-primary text-base px-8 py-4 shadow-xl shadow-orange-500/20 flex items-center gap-2">
              <span>Plan My Trip</span><span>→</span>
            </Link>
            <Link to={user ? '/dashboard' : '/auth'} className="btn-ghost text-base px-8 py-4">
              {user ? 'Go to Dashboard' : 'See How It Works'}
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mt-16 animate-in stagger-4">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl font-bold text-orange-400">{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/30">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to <span className="text-gradient">travel well</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              From first idea to full itinerary — Wanderly handles the planning so you can focus on the experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className={`card hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-1 animate-in stagger-${i + 1}`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Trending <span className="text-gradient">Destinations</span>
              </h2>
              <p className="text-white/40">Popular picks for every kind of traveler</p>
            </div>
            <Link to={user ? '/plan' : '/auth'} className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors hidden sm:block">
              Plan a trip →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((dest, i) => (
              <div key={dest.id} className={`group relative overflow-hidden rounded-2xl cursor-pointer animate-in stagger-${(i % 4) + 1}`}>
                <div className="relative h-56 bg-dark-700 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 glass rounded-full px-2.5 py-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white text-xs font-medium">{dest.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-display text-xl font-bold text-white">{dest.name}</div>
                        <div className="text-white/60 text-sm">{dest.country}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/40 text-xs">from</div>
                        <div className="text-orange-400 font-semibold">${dest.minBudget}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {dest.type.map(t => <span key={t} className="tag-pill text-xs">{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card border-orange-500/20 py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
            <div className="text-5xl mb-6 animate-float">✈️</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to plan your next adventure?
            </h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Join thousands of travelers who plan smarter with Wanderly's AI engine.
            </p>
            <Link to={user ? '/plan' : '/auth'} className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 shadow-xl shadow-orange-500/25">
              <span>Start Planning — It's Free</span><span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white">Wanderly</span>
        </div>
        <p className="text-white/25 text-sm">© 2025 Wanderly. Built with ❤️ and AI.</p>
      </footer>
    </div>
  );
}
