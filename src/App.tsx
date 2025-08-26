import React from 'react';
import Header from './components/Header';
import EnhancedIssuePlannerBoardV2 from './EnhancedIssuePlannerBoardV2';
import Auth from './Auth';
import { AuthProvider, useAuth } from './AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, signOut, loading } = useAuth();

  // TEMP: Skip authentication for testing
  const mockUser = { id: 'test-user', email: 'test@example.com' };
  const currentUser = mockUser; // Change back to 'user' to re-enable auth

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

  // TEMP: Always show main app for testing
  // if (!currentUser) {
  //   return (
  //     <ErrorBoundary>
  //       <Auth />
  //     </ErrorBoundary>
  //   );
  // }

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
