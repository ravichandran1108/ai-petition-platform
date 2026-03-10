import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PetitionCard from '../components/PetitionCard';

const HomePage = () => {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        console.log('Fetching all petitions');
        const response = await axios.get('/api/petitions');
        console.log('Petitions received:', response.data);
        setPetitions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching petitions:', err);
        setError('Failed to fetch petitions. Please try again later.');
        setLoading(false);
      }
    };

    fetchPetitions();
  }, []);

  // Subscribe to real-time petition updates via Server-Sent Events
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.addEventListener('petition_created', (event) => {
      try {
        const data = JSON.parse(event.data);
        setPetitions((prev) => {
          const exists = prev.some((p) => p._id === data._id);
          return exists ? prev : [data, ...prev];
        });
      } catch (e) {
        console.error('Error handling petition_created event', e);
      }
    });

    eventSource.addEventListener('petition_updated', (event) => {
      try {
        const data = JSON.parse(event.data);
        setPetitions((prev) =>
          prev.map((p) => (p._id === data._id ? data : p))
        );
      } catch (e) {
        console.error('Error handling petition_updated event', e);
      }
    });

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const categories = ['All', 'Environment', 'Education', 'Transport', 'Health', 'Community', 'Other'];

  const filteredAndSortedPetitions = petitions
    .filter((petition) => {
      const matchesSearch =
        petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All' || petition.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'mostSigned') {
        return (b.signatureCount || 0) - (a.signatureCount || 0);
      }
      if (sortBy === 'goalProgress') {
        const aProgress = a.targetSignatures ? a.signatureCount / a.targetSignatures : 0;
        const bProgress = b.targetSignatures ? b.signatureCount / b.targetSignatures : 0;
        return bProgress - aProgress;
      }
      // default: newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

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
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="mb-3 mb-md-0">Active Petitions</h2>
        <div className="d-flex flex-column flex-md-row gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search petitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All categories' : cat}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="mostSigned">Most signed</option>
            <option value="goalProgress">Closest to goal</option>
          </select>
        </div>
      </div>
      {filteredAndSortedPetitions.length === 0 ? (
        <p>No petitions available at the moment.</p>
      ) : (
        <div className="row">
          {filteredAndSortedPetitions.map((petition) => (
            <div className="col-md-6 col-lg-4" key={petition._id}>
              <PetitionCard petition={petition} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage; 