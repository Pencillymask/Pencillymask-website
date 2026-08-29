import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { SEO } from '../../components/layout/SEO';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@dhruvi-art.com');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dhruvi_admin_token', 'authenticated');
    navigate('/admin/dashboard');
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gallery-dark mb-1">Admin Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gallery-border rounded text-sm text-gallery-dark focus:outline-none focus:border-gallery-gold"
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
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gallery-border rounded text-sm text-gallery-dark focus:outline-none focus:border-gallery-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gallery-dark hover:bg-gallery-gold text-white font-medium text-xs tracking-wider uppercase rounded transition-colors"
          >
            Sign In to Admin Portal
          </button>
        </form>
      </div>
    </div>
  );
};
