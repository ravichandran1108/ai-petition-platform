import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePetition = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environment');
  const [targetSignatures, setTargetSignatures] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Creating petition with:', { title, description, category, targetSignatures });
      const response = await axios.post('/api/petitions', {
        title,
        description,
        category,
        targetSignatures: parseInt(targetSignatures)
      });
      console.log('Created petition:', response.data);
      navigate(`/petition/${response.data._id}`);
    } catch (err) {
      console.error('Error creating petition:', err);
      setError('Failed to create petition. Please try again.');
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const res = await axios.post('/api/petitions/analyze', {
        title,
        description
      });
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error analyzing petition:', err);
      setError('Failed to analyze petition. Make sure you are logged in and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Create a New Petition</h2>
              
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Petition Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter a clear, concise title"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="6"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Explain your petition in detail. What are you trying to achieve? Why is it important?"
                  ></textarea>
                </div>

                <div className="mb-3 d-flex flex-column flex-md-row gap-2 align-items-md-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleAnalyze}
                    disabled={analyzing || !title || !description}
                  >
                    {analyzing ? 'Analyzing...' : 'AI Petition Analyzer'}
                  </button>
                  {analysis && (
                    <div className="small text-muted">
                      Estimated success chance:{' '}
                      <strong>{analysis.successProbability}%</strong>
                    </div>
                  )}
                </div>

                {analysis && analysis.suggestions && analysis.suggestions.length > 0 && (
                  <div className="alert alert-info mb-3" role="alert">
                    <h6 className="alert-heading mb-2">AI suggestions to improve your petition</h6>
                    <ul className="mb-0">
                      {analysis.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Environment">Environment</option>
                    <option value="Education">Education</option>
                    <option value="Transport">Transport</option>
                    <option value="Health">Health</option>
                    <option value="Community">Community</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="targetSignatures" className="form-label">
                    Signature Goal
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="targetSignatures"
                    value={targetSignatures}
                    onChange={(e) => setTargetSignatures(parseInt(e.target.value))}
                    min="10"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Petition'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePetition; 