import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PetitionPage from './pages/PetitionPage';
import CreatePetitionPage from './pages/CreatePetitionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

/**
 * This is an example of how to update your App.jsx to include authentication
 * DO NOT replace your current App.jsx with this file directly
 * Instead, use this as a reference to add authentication to your existing App.jsx
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/petition/:id" element={<PetitionPage />} />
              {/* Protected route for creating petitions */}
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreatePetitionPage />
                  </ProtectedRoute>
                } 
              />
              {/* Authentication routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 