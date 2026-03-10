import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const PetitionCard = ({ petition }) => {
  // Calculate progress percentage
  const progress = Math.min(Math.round((petition.signatureCount / petition.targetSignatures) * 100), 100);
  const isAlmostThere = progress >= 80 && progress < 100;
  const isNew =
    petition.createdAt &&
    new Date() - new Date(petition.createdAt) < 1000 * 60 * 60 * 24 * 3; // last 3 days
  
  return (
    <div className="card petition-card shadow-sm mb-4 border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold mb-0">{petition.title}</h5>
          <div className="d-flex flex-column align-items-end">
            {petition.category && (
              <span className="badge bg-secondary mb-1">
                {petition.category}
              </span>
            )}
            {isAlmostThere && (
              <span className="badge bg-warning text-dark">
                Almost there
              </span>
            )}
            {!isAlmostThere && isNew && (
              <span className="badge bg-info text-dark">
                New
              </span>
            )}
          </div>
        </div>
        <p className="card-text text-muted mb-3">
          {petition.description.length > 100
            ? `${petition.description.substring(0, 100)}...`
            : petition.description}
        </p>
        
        <div className="mb-3">
          <div className="progress" style={{ height: '10px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${progress}%` }} 
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">
              <strong>{petition.signatureCount}</strong> signatures
            </small>
            <small className="text-muted">
              Goal: <strong>{petition.targetSignatures}</strong>
            </small>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Created {petition.createdAt ? formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true }) : 'recently'}
          </small>
          <Link to={`/petition/${petition._id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetitionCard; 