import React, { useContext } from 'react';
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../context/AuthContext';

// This is a standalone RegisterPage you can add to your project
// when you're ready to integrate authentication

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <RegisterForm register={register} />
      </div>
    </div>
  );
};

export default RegisterPage; 