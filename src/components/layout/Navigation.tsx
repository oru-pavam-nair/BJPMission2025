import React, { useState } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { zIndex, colors, spacing, breakpoints } from '../../styles/design-tokens';

interface NavigationProps {
  currentUser: string | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav 
        className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 ds-nav"
        style={{ zIndex: zIndex.navigation }}
      >
        <div className="ds-container">
          <div className="flex items-center justify-between h-16 sm:h-16">
            {/* Logo/Brand */}
            <div className="flex items-center flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-bold text-white ds-text-heading-2">
                Kerala BJP Dashboard
              </h1>
            </div>

            {/* Desktop User Info and Actions */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 ds-card">
                <div className="flex items-center space-x-2 text-white">
                  <User size={16} className="text-blue-400" />
                  <span className="text-sm font-medium ds-text-small">
                    {currentUser ? `+91 ${currentUser}` : 'User'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="ds-touch-target p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg ds-transition-fast ds-focus-ring"
                  title="Logout"
                  aria-label="Logout"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="ds-touch-target p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg ds-transition-fast ds-focus-ring"
                title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden ds-modal-backdrop"
          style={{ zIndex: zIndex.dropdown }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-16 right-0 w-80 max-w-[90vw] bg-slate-900/95 backdrop-blur-md border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out sm:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          zIndex: zIndex.dropdown + 1,
          height: 'calc(100vh - 64px)'
        }}
      >
        <div className="p-6 space-y-6">
          {/* Mobile User Info */}
          <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center space-x-3 text-white">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <User size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium ds-text-body">
                  {currentUser ? `+91 ${currentUser}` : 'User'}
                </p>
                <p className="text-xs text-slate-400 ds-text-caption">
                  Logged in
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-4 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg ds-transition-fast ds-focus-ring ds-touch-target"
              style={{ minHeight: '44px' }}
            >
              <LogOut size={18} className="text-red-400" />
              <span className="ds-text-body">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;