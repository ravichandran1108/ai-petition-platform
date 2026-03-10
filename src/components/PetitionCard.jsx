import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const PetitionCard = ({ petition }) => {
  // Calculate progress percentage
  const progress = Math.min(Math.round((petition.signatureCount / petition.targetSignatures) * 100), 100);
  
  // Animation for progress bar
  const [showProgress, setShowProgress] = useState(false);
  
  useEffect(() => {
    // Delay to trigger animation after component mount
    const timer = setTimeout(() => {
      setShowProgress(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="card petition-card shadow-sm mb-4 border-0">
      <div className="card-body">
        <h5 className="card-title fw-bold">{petition.title}</h5>
        <p className="card-text text-muted mb-3">
          {petition.description.length > 100
            ? `${petition.description.substring(0, 100)}...`
            : petition.description}
        </p>
        
        <div className="mb-3">
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: showProgress ? `${progress}%` : '0%' }} 
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small className="signature-count">
              <strong>{petition.signatureCount}</strong> signatures
            </small>
            <small className="text-muted">
              Goal: <strong>{petition.targetSignatures}</strong>
            </small>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            {petition.createdAt ? formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true }) : 'recently'}
          </small>
          <Link to={`/petition/${petition._id}`} className="btn btn-primary">
            <i className="bi bi-eye me-1"></i> View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetitionCard; 