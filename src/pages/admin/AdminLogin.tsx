import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { SEO } from '../../components/layout/SEO';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if session already exists
  useEffect(() => {
    const checkSession = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem('dhruvi_admin_token', 'authenticated');
          navigate('/admin/dashboard', { replace: true });
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Supabase is not configured. Please verify your environment settings.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid login credentials');
        return;
      }

      if (data.session) {
        localStorage.setItem('dhruvi_admin_token', 'authenticated');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      <SEO title="Admin Portal" noindex={true} />
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gallery-border shadow-gallery space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gallery-gold/10 text-gallery-gold mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl text-gallery-dark font-medium">Admin Authentication</h2>
          <p className="text-xs text-gallery-muted">pencillymask — Dhruvi's Art Studio</p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gallery-dark mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-muted" />
              <input
                type="email"
                required
                disabled={loading}
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gallery-border rounded text-sm text-gallery-dark focus:outline-none focus:border-gallery-gold disabled:opacity-60 disabled:bg-gallery-card"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gallery-dark mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-muted" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gallery-border rounded text-sm text-gallery-dark focus:outline-none focus:border-gallery-gold disabled:opacity-60 disabled:bg-gallery-card"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gallery-dark hover:bg-gallery-gold text-white font-medium text-xs tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

