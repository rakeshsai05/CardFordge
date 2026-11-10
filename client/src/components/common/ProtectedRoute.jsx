import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route Guard Component.
 * Enforces authentication and role-based access control (RBAC) at the routing layer.
 *
 * @param {Object} props
 * @param {string[]} [props.allowedRoles] - Array of roles permitted (e.g. ['student'], ['admin'])
 * @param {React.ReactNode} props.children - Protected component to render
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login while preserving the attempted path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is restricted and user does not match
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If student tries to visit admin, redirect to student dashboard
    if (['student', 'general_user'].includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin tries to visit student, redirect to admin console
    if (['admin', 'main_admin', 'mid_admin'].includes(user.role)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}

