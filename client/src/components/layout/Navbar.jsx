import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, QrCode, ArrowRight, User, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-all shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              Card<span className="text-brand-600">Forge</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              ID card studio
            </span>
          </div>
        </Link>

        {/* Navigation Links with Reliable Redirects */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-brand-600 transition-colors py-1">
            Home
          </Link>
          <button
            onClick={() => handleScrollToSection('features')}
            className="hover:text-brand-600 transition-colors py-1 cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => handleScrollToSection('card-styles')}
            className="hover:text-brand-600 transition-colors py-1 cursor-pointer"
          >
            Card Styles
          </button>
          <Link
            to="/verify"
            className="flex items-center gap-1.5 text-slate-700 hover:text-brand-600 transition-colors py-1"
          >
            <QrCode className="w-4 h-4 text-brand-600" />
            <span>Check ID Card</span>
          </Link>
        </nav>

        {/* Action Buttons (Logged In vs Logged Out) */}
        <div className="flex items-center gap-3">
          {user ? (
            // Logged in user options
            <div className="flex items-center gap-2">
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1 text-brand-600" />
                  <span>{user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}</span>
                </Button>
              </Link>
              <Link to="/dashboard/id-card">
                <Button variant="primary" size="sm" className="text-xs font-bold">
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  <span>Card Studio</span>
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Visitor options
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="font-bold text-xs shadow-sm">
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
