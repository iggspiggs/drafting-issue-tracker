import React, { useState, useEffect } from 'react';
import { authService, supabaseService } from '../utils/supabase';
import Auth from './Auth';
import Header from './Header';
import EnhancedIssuePlannerBoard from '../EnhancedIssuePlannerBoard';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';

const AppWrapper = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Check if localStorage data exists for migration
        const localData = localStorage.getItem('drafting_issues_data');
        if (localData && currentUser) {
          setShowMigration(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMigrateData = async () => {
    try {
      setMigrationStatus({ loading: true });
      const result = await supabaseService.migrateFromLocalStorage();
      setMigrationStatus({ 
        success: true, 
        message: `Successfully migrated ${result.count} issues to database!` 
      });
      setShowMigration(false);
    } catch (error) {
      setMigrationStatus({ 
        error: true, 
        message: `Migration failed: ${error.message}` 
      });
    }
  };

  const skipMigration = () => {
    localStorage.removeItem('drafting_issues_data');
    setShowMigration(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <Header 
        user={user}
        onSignOut={handleSignOut}
        onAddIssue={() => {}} // Will be handled by main component
        onExport={() => {}} // Will be handled by main component  
        searchTerm=""
        onSearchChange={() => {}} // Will be handled by main component
        stats={{}} // Will be passed from main component
      />

      {/* Migration modal */}
      {showMigration && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="flex-start gap-sm">
                <Database size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 className="modal-title">Migrate Local Data</h3>
              </div>
            </div>
            
            <div className="modal-body">
              <p style={{ 
                color: 'var(--color-gray-600)', 
                marginBottom: 'var(--spacing-lg)',
                lineHeight: 'var(--leading-normal)'
              }}>
                We found existing issue data in your browser. Would you like to migrate it to the database?
              </p>

              {migrationStatus && (
                <div className={`card ${
                  migrationStatus.success ? 'status-fixed' :
                  migrationStatus.error ? 'status-cannot-change' :
                  'status-new'
                }`} style={{ 
                  marginBottom: 'var(--spacing-lg)',
                  padding: 'var(--spacing-md)'
                }}>
                  <div className="flex-start gap-sm">
                    {migrationStatus.loading ? (
                      <div className="spinner"></div>
                    ) : migrationStatus.success ? (
                      <CheckCircle size={16} />
                    ) : migrationStatus.error ? (
                      <AlertCircle size={16} />
                    ) : null}
                    <span style={{ fontSize: 'var(--font-sm)' }}>
                      {migrationStatus.message}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={skipMigration}
                disabled={migrationStatus?.loading}
                className="btn btn-outline btn-md"
              >
                Skip
              </button>
              <button
                onClick={handleMigrateData}
                disabled={migrationStatus?.loading}
                className="btn btn-primary btn-md"
              >
                {migrationStatus?.loading ? 'Migrating...' : 'Migrate Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main app */}
      <main className="page-content">
        <EnhancedIssuePlannerBoard user={user} />
      </main>
    </div>
  );
};

export default AppWrapper;