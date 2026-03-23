import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TripBuilder from './pages/TripBuilder';
import Recommendation from './pages/Recommendation';
import MyTrips from './pages/MyTrips';
import History from './pages/History';

// Auth Context
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-mesh flex items-center justify-center">
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/plan" element={<ProtectedRoute><TripBuilder /></ProtectedRoute>} />
          <Route path="/recommendation" element={<ProtectedRoute><Recommendation /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
