/**
 * Authentication Module for Online Petition Platform
 * 
 * This is a separate module that adds authentication to the petition platform.
 * You can integrate this into your main project when ready.
 * 
 * REQUIREMENTS:
 * npm install jsonwebtoken bcryptjs
 */

// How to integrate this with your existing mock-server.js:
// 1. Install the required packages: npm install jsonwebtoken bcryptjs
// 2. Add the imports at the top of your file:
//    const jwt = require('jsonwebtoken');
//    const bcrypt = require('bcryptjs');
// 3. Add the JWT_SECRET, users object, and userIdCounter
// 4. Add the authenticateToken middleware function
// 5. Add the authentication routes
// 6. Update your existing routes to use the authenticateToken middleware
// 7. Add the user's petitions endpoint

/**
 * Add these to your mock-server.js file
 */

// At the top with other requires
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Add this after your other constants
const JWT_SECRET = 'your-secret-key-should-be-long-and-secure';

// Add these to your storage section
const users = {}; 
let userIdCounter = 1;

// Add the authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add a sample user
function addSampleUser() {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password123', salt);
  
  const user = {
    _id: String(userIdCounter++),
    username: 'demo',
    email: 'demo@example.com',
    password: hashedPassword,
    name: 'Demo User',
    createdAt: new Date().toISOString()
  };
  
  users[user._id] = user;
  console.log('Sample user created:', { username: user.username, password: 'password123' });
}

// Call this after addSamplePetitions()
addSampleUser();

/**
 * Authentication Routes to add
 */

// User registration
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, name } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide username, email and password' });
  }
  
  // Check if username or email already exists
  const userExists = Object.values(users).some(
    user => user.username === username || user.email === email
  );
  
  if (userExists) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }
  
  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  // Create new user
  const newUser = {
    _id: String(userIdCounter++),
    username,
    email,
    password: hashedPassword,
    name: name || username,
    createdAt: new Date().toISOString()
  };
  
  // Save user
  users[newUser._id] = newUser;
  
  // Generate token
  const token = jwt.sign({ _id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
  
  // Return user info (excluding password) and token
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    user: userWithoutPassword,
    token
  });
});

// User login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user by username
  const user = Object.values(users).find(user => user.username === username);
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
  
  // Check password
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
  
  // Generate token
  const token = jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  
  // Return user info (excluding password) and token
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    user: userWithoutPassword,
    token
  });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users[req.user._id];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Get user's petitions
app.get('/api/my-petitions', authenticateToken, (req, res) => {
  const userPetitions = Object.values(petitions).filter(
    petition => petition.createdBy === req.user._id
  );
  res.json(userPetitions);
});

/**
 * FRONTEND INTEGRATION GUIDE
 * 
 * 1. Add these state variables to your App component:
 *    - const [currentUser, setCurrentUser] = useState(null);
 *    - const [token, setToken] = useState(localStorage.getItem('token') || null);
 * 
 * 2. Create an AuthContext for sharing auth state:
 *    - Create a new file src/context/AuthContext.js
 * 
 * 3. Add Registration and Login components
 * 
 * 4. Update API calls to include the auth token:
 *    - axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
 * 
 * 5. Add token refresh and logout functionality
 */

// AuthContext.js example
/*
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set token in axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setCurrentUser(res.data);
        } catch (error) {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    setCurrentUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  // Register function
  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    setCurrentUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    return res.data;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
*/ 