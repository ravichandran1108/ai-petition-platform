import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PetitionMap from '../components/PetitionMap';
import ChatAssistant from '../components/ChatAssistant';

const PetitionPage = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [petition, setPetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [signatureSuccess, setSignatureSuccess] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [locationStatus, setLocationStatus] = useState('');
  const [govStatus, setGovStatus] = useState('Not Sent');
  const [govText, setGovText] = useState('');
  const [govSaving, setGovSaving] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [sentimentError, setSentimentError] = useState(null);

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        console.log(`Fetching petition with ID: ${id}`);
        const response = await axios.get(`/api/petitions/${id}`);
        console.log('Petition data received:', response.data);
        setPetition(response.data);
        if (response.data.governmentResponseStatus) {
          setGovStatus(response.data.governmentResponseStatus);
        }
        if (response.data.governmentResponseText) {
          setGovText(response.data.governmentResponseText);
        }

        // Fetch sentiment summary for comments
        try {
          const sentimentRes = await axios.get(`/api/petitions/${id}/sentiment`);
          setSentiment(sentimentRes.data);
          setSentimentError(null);
        } catch (sentErr) {
          console.error('Error fetching sentiment:', sentErr);
          // If sentiment analysis fails, fall back to "no data yet" instead of showing an error
          setSentiment({
            totalComments: 0,
            positive: 0,
            neutral: 0,
            negative: 0,
            overallLabel: 'No data yet'
          });
          setSentimentError(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching petition:', err);
        setError('Failed to fetch petition details. Please try again later.');
        setLoading(false);
      }
    };

    fetchPetition();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitWithLocation = async (location) => {
      try {
        console.log(`Signing petition ${id} with name: ${name}, email: ${email}`);
        const response = await axios.post(`/api/petitions/${id}/sign`, { name, email, comment, location });
        console.log('Signature response:', response.data);
        setSignatureSuccess(true);
        setName('');
        setEmail('');
        setComment('');
        setLocationStatus('');
        
        // Refresh petition data to update signature count and signatures list
        const updatedPetition = await axios.get(`/api/petitions/${id}`);
        setPetition(updatedPetition.data);
      } catch (err) {
        console.error('Error signing petition:', err);
        setLocationStatus('');
        alert('Failed to sign the petition. Please try again.');
      }
    };

    if (includeLocation && navigator.geolocation) {
      setLocationStatus('Detecting your approximate location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          submitWithLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setLocationStatus('Could not detect location. Signing without location.');
          submitWithLocation(undefined);
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    } else {
      submitWithLocation(undefined);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy link', e);
      alert('Could not copy link. Please copy it manually from the address bar.');
    }
  };

  const shareText = petition
    ? `Support this petition: "${petition.title}" on PetitionHub`
    : 'Check out this petition on PetitionHub';

  const isOwner =
    isAuthenticated &&
    petition &&
    petition.createdBy &&
    ((petition.createdBy._id && currentUser && petition.createdBy._id === currentUser._id) ||
      (typeof petition.createdBy === 'string' && currentUser && petition.createdBy === currentUser._id));

  const handleSaveGovernmentResponse = async (e) => {
    e.preventDefault();
    setGovSaving(true);
    try {
      await axios.patch(`/api/petitions/${id}/government-response`, {
        status: govStatus,
        text: govText
      });
      const updatedPetition = await axios.get(`/api/petitions/${id}`);
      setPetition(updatedPetition.data);
    } catch (err) {
      console.error('Error updating government response', err);
      alert('Failed to update government response. Please try again.');
    } finally {
      setGovSaving(false);
    }
  };

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

  if (!petition) {
    return (
      <div className="alert alert-warning" role="alert">
        Petition not found.
      </div>
    );
  }

  return (
    <>
    <div className="row">
      <div className="col-lg-8">
      <div className="petition-details">
        <h2 className="mb-3">{petition.title}</h2>
        {petition.category && (
          <p>
            <span className="badge bg-secondary me-2">{petition.category}</span>
          </p>
        )}
        <p className="lead">{petition.description}</p>
        <div className="my-4 d-flex flex-wrap align-items-center gap-2">
          <span className="badge bg-success fs-5">
            {petition.signatureCount} signatures
          </span>
          <span className="badge bg-outline-secondary text-muted">
            Goal: {petition.targetSignatures}
          </span>
        </div>
      </div>

      <div className="signature-form">
        <h3 className="mb-3">Sign this petition</h3>
        
        {signatureSuccess && (
          <div className="alert alert-success mb-3" role="alert">
            Thank you for signing this petition!
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Your Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="comment" className="form-label">
              Comment (Optional)
            </label>
            <textarea
              className="form-control"
              id="comment"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="includeLocation"
              checked={includeLocation}
              onChange={(e) => setIncludeLocation(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="includeLocation">
              Share my approximate location (for anonymous map of supporters)
            </label>
          </div>
          {locationStatus && (
            <div className="mb-3 small text-muted">
              {locationStatus}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary">
            Sign Petition
          </button>
        </form>
      </div>
      </div>

      <div className="col-lg-4 mt-4 mt-lg-0">
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Share this petition</h5>
            <p className="card-text small text-muted">
              Help this petition reach its goal faster by sharing it with others.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary w-100 mb-2"
              onClick={handleCopyLink}
            >
              {shareCopied ? 'Link copied!' : 'Copy link'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary w-100 mb-2"
            >
              Share on X (Twitter)
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${window.location.href}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-success w-100"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Government response tracker</h5>
            <p className="card-text small text-muted">
              Status:{' '}
              <strong>
                {petition.governmentResponseStatus || 'Not Sent'}
              </strong>
            </p>
            {petition.governmentLastUpdated && (
              <p className="card-text small text-muted">
                Last updated:{' '}
                {new Date(petition.governmentLastUpdated).toLocaleString()}
              </p>
            )}
            {petition.governmentResponseText && (
              <p className="card-text">
                {petition.governmentResponseText}
              </p>
            )}
            {isOwner && (
              <form onSubmit={handleSaveGovernmentResponse}>
                <div className="mb-2">
                  <label className="form-label small">
                    Update status
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={govStatus}
                    onChange={(e) => setGovStatus(e.target.value)}
                  >
                    <option value="Not Sent">Not Sent</option>
                    <option value="Sent">Sent</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Responded">Responded</option>
                    <option value="Implemented">Implemented</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small">
                    Notes (e.g. who you contacted, what they said)
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    value={govText}
                    onChange={(e) => setGovText(e.target.value)}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  disabled={govSaving}
                >
                  {govSaving ? 'Saving...' : 'Save update'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">AI Sentiment Analysis</h5>
            {sentimentError && (
              <p className="small text-danger mb-1">{sentimentError}</p>
            )}
            {sentiment ? (
              <>
                <p className="card-text small text-muted mb-1">
                  Overall mood:{' '}
                  <strong>{sentiment.overallLabel}</strong>
                </p>
                <p className="card-text small text-muted mb-2">
                  Based on {sentiment.totalComments} comment
                  {sentiment.totalComments === 1 ? '' : 's'}.
                </p>
                <div className="small">
                  <span className="badge bg-success me-2">
                    Positive: {sentiment.positive}
                  </span>
                  <span className="badge bg-secondary me-2">
                    Neutral: {sentiment.neutral}
                  </span>
                  <span className="badge bg-danger">
                    Negative: {sentiment.negative}
                  </span>
                </div>
              </>
            ) : (
              !sentimentError && (
                <p className="small text-muted mb-0">
                  No comment data yet to analyze sentiment.
                </p>
              )
            )}
          </div>
        </div>

        {petition.signatures && petition.signatures.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Recent supporters</h5>
              <ul className="list-unstyled mb-0">
                {petition.signatures
                  .slice()
                  .sort((a, b) => new Date(b.signedAt || 0) - new Date(a.signedAt || 0))
                  .slice(0, 5)
                  .map((sig, index) => (
                    <li key={index} className="mb-2">
                      <strong>{sig.name || 'Anonymous'}</strong>
                      {sig.comment && (
                        <span className="d-block small text-muted">
                          “{sig.comment}”
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Supporters around the world</h5>
            <PetitionMap signatures={petition.signatures} />
          </div>
        </div>
      </div>
    </div>
    <ChatAssistant petition={petition} />
    </>
  );
};

export default PetitionPage; 