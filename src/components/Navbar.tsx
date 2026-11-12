import React from 'react';

interface NavbarProps {
  activeTab: 'home' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'home' | 'dashboard' | 'admin') => void;
  isAdmin: boolean;
  onRequestAdmin: () => void;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onRequestAdmin,
  onLogoutAdmin,
}) => {
  return (
    <nav className="bg-navy-900 text-white shadow-lg sticky top-0 z-50 border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand - text only */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left focus:outline-none cursor-pointer"
            >
              <span className="font-kanit font-semibold text-base sm:text-lg lg:text-xl tracking-wide text-white hover:text-lime transition-colors">
                สถาบันพัฒนาการตรวจเงินแผ่นดิน
              </span>
            </button>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home button (if not on home) */}
            {activeTab !== 'home' && (
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="font-kanit text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
              >
                หน้าแรก
              </button>
            )}

            {/* Prominent Eye-catching Dashboard Button right before Admin */}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-kanit text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                activeTab === 'dashboard'
                  ? 'bg-lime text-navy-900 ring-2 ring-lime/50 shadow-lime/20'
                  : 'bg-gradient-to-r from-lime via-lime-light to-lime text-navy-900 hover:brightness-110 border border-lime shadow-lime/30'
              }`}
            >
              แดชบอร์ดสรุปผล
            </button>

            {/* Admin page button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`font-kanit text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-navy-700 text-white ring-1 ring-white/30'
                      : 'bg-navy-800 text-slate-200 hover:bg-navy-700'
                  }`}
                >
                  Admin page
                </button>
                <button
                  onClick={onLogoutAdmin}
                  title="ออกจากระบบ Admin"
                  className="font-kanit text-xs px-2.5 py-2 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-500/30 transition-colors cursor-pointer"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={onRequestAdmin}
                className="font-kanit text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg bg-navy-800 text-lime border border-lime/40 hover:bg-lime hover:text-navy-900 transition-colors cursor-pointer"
              >
                Admin page
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
