import React, { useContext } from 'react';
import LoginForm from '../components/LoginForm';
import { AuthContext } from '../context/AuthContext';

// This is a standalone LoginPage you can add to your project
// when you're ready to integrate authentication

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <LoginForm login={login} />
      </div>
    </div>
  );
};

export default LoginPage; 