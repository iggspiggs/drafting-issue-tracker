import React, { useState } from 'react';
import { authService } from '../utils/supabase';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isSignUp) {
        result = await authService.signUp(email, password);
        if (result.user && !result.user.email_confirmed_at) {
          setError('Please check your email and click the confirmation link to complete signup.');
          setLoading(false);
          return;
        }
      } else {
        result = await authService.signIn(email, password);
      }
      
      if (result.user) {
        onAuthSuccess(result.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-secondary)',
      padding: 'var(--spacing-2xl) var(--spacing-lg)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card-header text-center" style={{ padding: 'var(--spacing-3xl)' }}>
          <div className="flex-center" style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--color-primary)', 
            borderRadius: 'var(--radius-xl)',
            margin: '0 auto var(--spacing-lg) auto'
          }}>
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 'var(--font-3xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-gray-900)',
            margin: '0 0 var(--spacing-xs) 0',
            lineHeight: 'var(--leading-tight)'
          }}>
            Drafting Issue Tracker
          </h1>
          <p style={{
            fontSize: 'var(--font-base)',
            color: 'var(--color-gray-600)',
            margin: 0,
            lineHeight: 'var(--leading-normal)'
          }}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {error && (
              <div className="card status-cannot-change" style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex-start gap-sm">
                  <AlertCircle size={20} />
                  <p style={{ fontSize: 'var(--font-sm)', margin: 0 }}>{error}</p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: 'var(--color-gray-400)',
                  pointerEvents: 'none'
                }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: 'var(--color-gray-400)',
                  pointerEvents: 'none'
                }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className="form-input"
                  style={{ paddingLeft: '48px', paddingRight: '48px' }}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: 'var(--spacing-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--spacing-xs)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-gray-400)',
                    transition: 'color var(--transition-fast)'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => e.target.style.color = 'var(--color-gray-600)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-gray-400)'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? (
                <div className="flex-center gap-sm">
                  <div className="spinner"></div>
                  Processing...
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </div>

        <div className="card-footer">
          <div className="card status-info" style={{ padding: 'var(--spacing-md)' }}>
            <h3 style={{ 
              fontSize: 'var(--font-sm)', 
              fontWeight: 'var(--font-semibold)', 
              margin: '0 0 var(--spacing-xs) 0',
              color: 'var(--color-info)'
            }}>
              Setup Instructions:
            </h3>
            <ol style={{ 
              fontSize: 'var(--font-xs)', 
              color: 'var(--color-info)', 
              margin: 0,
              paddingLeft: 'var(--spacing-lg)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              <li>Create a Supabase project at supabase.com</li>
              <li>Run the database_schema.sql in your SQL editor</li>
              <li>Add your project URL and anon key to .env file</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;