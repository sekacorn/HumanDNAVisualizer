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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 text-center mb-4">
              You don't have permission to access this page. This page requires {requireRole} role.
            </p>
            <div className="text-center">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required role (if specified)
  return children;
}
