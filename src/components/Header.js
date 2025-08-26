import React from 'react';
import { User, LogOut } from 'lucide-react';

const Header = ({ 
  user,
  onSignOut,
  stats = {}
}) => {
  const formatLastUpdated = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      backgroundColor: 'var(--header-bg)', 
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div style={{ padding: '28px 32px' }}>
        <div className="flex-between">
          {/* Left side - Title and status */}
          <div>
            <h1 style={{
              fontSize: 'var(--font-3xl)', 
              fontWeight: 'var(--font-bold)', 
              color: 'var(--header-text)', 
              lineHeight: 'var(--leading-tight)',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Drafting Issue Tracker
            </h1>
            <div style={{
              color: 'var(--header-text-secondary)', 
              fontSize: 'var(--font-base)', 
              marginTop: 'var(--spacing-xs)', 
              lineHeight: 'var(--leading-normal)',
              fontWeight: 'var(--font-normal)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)'
            }}>
              <span>
                {stats.total || 0} total issues
              </span>
              <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-medium)' }}>
                • Updated {formatLastUpdated()}
              </span>
            </div>
          </div>
          
          {/* Right side - User menu only */}
          <div className="flex-end" style={{ gap: 'var(--spacing-lg)' }}>
            
            {/* User Menu */}
            <div className="flex-end" style={{ 
              gap: 'var(--spacing-md)'
            }}>
              <div className="flex-center" style={{ gap: 'var(--spacing-sm)' }}>
                <User size={16} style={{ color: 'var(--color-gray-600)' }} />
                <span style={{
                  fontSize: 'var(--font-sm)',
                  color: 'var(--color-gray-700)',
                  fontWeight: 'var(--font-medium)'
                }}>
                  {user?.email || 'User'}
                </span>
              </div>
              
              <button
                onClick={onSignOut}
                className="btn btn-ghost btn-sm"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;