import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Users,
  CheckCircle,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ userRole = 'student' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, student, logout } = useAuth();

  const user = {
    name: authUser?.name || (userRole === 'admin' ? 'Workspace Owner' : 'Alex Morgan'),
    email: authUser?.email || '',
    role: authUser?.role || userRole,
    department: student?.department || (userRole === 'admin' ? 'Workspace Management' : 'Your team'),
  };

  const studentNavItems = [
    { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Design My Card', path: '/dashboard/id-card', icon: CreditCard, highlight: true },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  const adminNavItems = [
    { label: authUser?.role === 'mid_admin' ? 'Department Home' : 'Organization Home', path: '/admin', icon: LayoutDashboard },
    { label: 'Workspace & People', path: '/admin/workspace', icon: Users },
    { label: 'Approve Cards', path: '/admin/cards', icon: CheckCircle },
    { label: 'Card Studio', path: '/admin/id-card', icon: CreditCard, highlight: true },
    { label: 'All users', path: '/admin/students', icon: Users },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 text-base">CardForge</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out`}
      >
        <div className="p-5 space-y-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900">
                Card<span className="text-brand-600">Forge</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                {user.role === 'admin' ? 'Owner workspace' : 'Creator account'}
              </p>
            </div>
          </Link>

          {/* User Info Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200/80">
              <span className="truncate max-w-[130px]">{user.department}</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold uppercase text-[9px]">
                {user.role === 'student' ? 'Creator' : user.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-slate-200 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-slate-600 hover:text-brand-600 text-xs border border-slate-200"
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Visit CardForge</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
