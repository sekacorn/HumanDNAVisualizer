import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute component to guard routes that require authentication
 *
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 *
 * Or with role requirement:
 * <ProtectedRoute requireRole="ADMIN">
 *   <AdminComponent />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, requireRole = null }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if specific role is required
  if (requireRole) {
    const hasRequiredRole = authService.hasRole(requireRole);

    if (!hasRequiredRole) {
      // User is authenticated but doesn't have required role
      return (
        <div className="glass-panel rounded-card mx-auto flex max-w-md flex-col items-center p-card-padding text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
            <span className="material-symbols-outlined" aria-hidden="true">
              lock
            </span>
          </span>
          <h2 className="mt-4 font-headline-md text-xl text-on-surface">Access denied</h2>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            You don&apos;t have permission to view this page. It requires the {requireRole} role.
          </p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary mt-6"
          >
            Go back
          </button>
        </div>
      );
    }
  }

  // User is authenticated and has required role (if specified)
  return children;
}
