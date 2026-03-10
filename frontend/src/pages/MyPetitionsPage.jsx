import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import PetitionCard from '../components/PetitionCard';
import { AuthContext } from '../context/AuthContext';

const MyPetitionsPage = () => {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMyPetitions = async () => {
      try {
        const response = await axios.get('/api/my-petitions');
        setPetitions(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please log in to view your petitions');
          navigate('/login');
        } else {
          setError('Failed to load your petitions. Please try again later.');
          console.error('Error fetching my petitions:', err);
        }
        setLoading(false);
      }
    };

    fetchMyPetitions();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Petitions</h2>
        <Link to="/create" className="btn btn-primary">
          Create New Petition
        </Link>
      </div>

      {petitions.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <h4 className="mb-3">You haven't created any petitions yet</h4>
          <p className="mb-4">Create your first petition to see it here.</p>
          <Link to="/create" className="btn btn-primary">
            Create Petition
          </Link>
        </div>
      ) : (
        <div className="row">
          {petitions.map(petition => (
            <div className="col-md-6 col-lg-4 mb-4" key={petition._id}>
              <PetitionCard petition={petition} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPetitionsPage; 