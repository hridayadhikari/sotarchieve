import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Verify your Supabase credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: 'var(--accent)' }} />
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>SOT ARCHIVE</h1>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Streets of Tripura internal knowledge & resource system.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--sot-red-subtle)',
              border: '1px solid rgba(161, 0, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent)',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="input"
                placeholder="name@streetsoftripura.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              required
              className="input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '6px', padding: '10px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Internal SOT archive. Accounts are provisioned and authenticated via Supabase.
        </div>
      </div>
    </div>
  );
};

