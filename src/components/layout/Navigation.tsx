import React, { useState } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';
import { zIndex } from '../../styles/design-tokens';
import { getCurrentUserName } from '../../utils/auth';

interface NavigationProps {
  currentUser: string | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get user name from session
  const currentUserName = getCurrentUserName();
  
  // Fallback name mapping in case session doesn't have userName
  const getDisplayName = () => {
    if (currentUserName) {
      return currentUserName;
    }
    // Fallback based on phone number
    if (currentUser === '9745895354') {
      return 'Dev';
    } else if (currentUser === '9126868745') {
      return 'Ravishankar';
    }
    return 'User';
  };

  const displayName = getDisplayName();

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
        className="fixed top-0 left-0 right-0 bg-slate-900/98 backdrop-blur-lg border-b border-slate-700/60 shadow-lg ds-nav"
        style={{ zIndex: zIndex.navigation }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - User Info and Logout (Desktop) */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* User Profile Section */}
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-600/40 shadow-md backdrop-blur-md">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {displayName}
                  </span>
                  <span className="text-xs text-slate-400">
                    +91 {currentUser}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-600/50 mx-2"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} className="group-hover:text-red-400" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Spacer for better separation */}
            <div className="flex-1 hidden sm:block"></div>

            {/* Center-Right - Dashboard Title */}
            <div className="flex items-center space-x-3 flex-shrink-0 sm:mr-8">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BJP</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  BJP Mission 2025
                </h1>
              </div>
            </div>

            {/* Right Side - Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-all duration-200 border border-slate-600/40"
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm sm:hidden"
          style={{ zIndex: zIndex.dropdown }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-16 right-0 w-80 max-w-[90vw] bg-slate-900/98 backdrop-blur-lg border-l border-slate-700/60 shadow-2xl transform transition-transform duration-300 ease-in-out sm:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          zIndex: zIndex.dropdown + 1,
          height: 'calc(100vh - 64px)'
        }}
      >
        <div className="p-6 space-y-6">
          {/* Mobile User Info */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-600/40 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400">
                  +91 {currentUser}
                </p>
              </div>
            </div>
          </div>

          {/* App Title - Mobile */}
          <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">BJP</span>
              </div>
              <p className="text-lg font-bold text-white">
                BJP Mission 2025
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-4 text-left text-white bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-200 border border-red-500/30 group"
              style={{ minHeight: '56px' }}
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center group-hover:bg-red-500/30">
                <LogOut size={18} className="text-red-400" />
              </div>
              <div>
                <span className="font-medium">Logout</span>
                <p className="text-sm text-red-300">End your session</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;