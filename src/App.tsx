import React from 'react';
import Header from './components/Header';
import EnhancedIssuePlannerBoardV2 from './EnhancedIssuePlannerBoardV2';
import Auth from './Auth';
import { AuthProvider, useAuth } from './AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, signOut, loading } = useAuth();

  const currentUser = user; // Authentication re-enabled

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <LoadingSpinner size="large" message="Loading application..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <ErrorBoundary>
        <Auth />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
        <Header 
          user={currentUser}
          onSignOut={signOut}
          stats={{}} // Will be passed from main component
        />
        
        <main className="page-content">
          <ErrorBoundary>
            <EnhancedIssuePlannerBoardV2 user={currentUser} />
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
