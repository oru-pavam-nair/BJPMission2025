import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import IntegratedKeralaMap from './components/IntegratedKeralaMap';
import Navigation from './components/layout/Navigation';
import { isAuthenticated, getCurrentUser, clearAuthSession } from './utils/auth';
import { initializeAccessibility, useKeyboardNavigation } from './utils/accessibility';
import { AlertTriangle } from 'lucide-react';

// Error Boundary Component for graceful error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-white/20">
            <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-red-200 mb-6">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initialize keyboard navigation tracking
  useKeyboardNavigation();

  // Initialize accessibility features and check authentication status
  useEffect(() => {
    // Initialize accessibility features
    initializeAccessibility();
    
    const checkAuthStatus = () => {
      try {
        const authenticated = isAuthenticated();
        const user = getCurrentUser();
        
        setIsLoggedIn(authenticated);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // Clear potentially corrupted session
        clearAuthSession();
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle successful login
  const handleLogin = (phoneNumber: string) => {
    setIsLoggedIn(true);
    setCurrentUser(phoneNumber);
  };

  // Handle logout
  const handleLogout = () => {
    try {
      clearAuthSession();
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-white text-lg">Loading Kerala Map...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* Skip link for keyboard navigation */}
        <a 
          href="#main-content" 
          className="ds-skip-link"
          tabIndex={1}
        >
          Skip to main content
        </a>
        
        {!isLoggedIn ? (
          // Show login page if not authenticated
          <LoginPage onLogin={handleLogin} />
        ) : (
          // Show map application if authenticated
          <div className="relative min-h-screen bg-slate-900 overflow-hidden">
            {/* Navigation Header */}
            <Navigation 
              currentUser={currentUser}
              onLogout={handleLogout}
            />

            {/* Main Map Component - Full Screen with proper top spacing for navigation */}
            <main 
              id="main-content"
              className="pt-16 w-full bg-slate-900" 
              style={{ 
                height: 'calc(100vh - 64px)',
                minHeight: 'calc(100vh - 64px)'
              }}
              role="main"
              aria-label="Kerala BJP Dashboard Map Interface"
            >
              <div className="w-full h-full">
                <IntegratedKeralaMap />
              </div>
            </main>
          </div>
        )}
        
        {/* ARIA live regions for announcements */}
        <div id="aria-live-announcements" aria-live="polite" aria-atomic="true" className="ds-sr-only"></div>
        <div id="aria-live-status" aria-live="polite" aria-atomic="true" className="ds-sr-only"></div>
        <div id="aria-live-errors" aria-live="assertive" aria-atomic="true" className="ds-sr-only"></div>
      </div>
    </ErrorBoundary>
  );
};

export default App;