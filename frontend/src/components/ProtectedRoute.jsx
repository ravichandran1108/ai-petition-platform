import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This is a standalone ProtectedRoute component you can add to your project
// when you're ready to integrate authentication

/**
 * ProtectedRoute - Component to protect routes that require authentication
 * 
 * Usage example:
 * <Route 
 *   path="/create" 
 *   element={
 *     <ProtectedRoute>
 *       <CreatePetitionPage />
 *     </ProtectedRoute>
 *   } 
 * />
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  // Show loading state if still checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute; 