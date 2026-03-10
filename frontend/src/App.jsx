import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PetitionPage from './pages/PetitionPage';
import CreatePetitionPage from './pages/CreatePetitionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPetitionsPage from './pages/MyPetitionsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

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
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreatePetitionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-petitions" 
                element={
                  <ProtectedRoute>
                    <MyPetitionsPage />
                  </ProtectedRoute>
                } 
              />
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