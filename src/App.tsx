import React from 'react';
import Header from './components/Header';
import EnhancedIssuePlannerBoardV2 from './EnhancedIssuePlannerBoardV2';
import Auth from './Auth';
import { AuthProvider, useAuth } from './AuthContext';

function AppContent() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <Header 
        user={user}
        onSignOut={signOut}
        stats={{}} // Will be passed from main component
      />
      
      <main className="page-content">
        <EnhancedIssuePlannerBoardV2 user={user} />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
