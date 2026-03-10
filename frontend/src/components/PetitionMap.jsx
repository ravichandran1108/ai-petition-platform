import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PetitionMap = ({ signatures }) => {
  const locations = (signatures || []).filter(
    (sig) => sig.location && typeof sig.location.lat === 'number' && typeof sig.location.lng === 'number'
  );

  if (locations.length === 0) {
    return (
      <p className="small text-muted mb-0">
        No location data yet. Supporters can opt in to share approximate location when signing.
      </p>
    );
  }

  const avgLat =
    locations.reduce((sum, s) => sum + s.location.lat, 0) / locations.length;
  const avgLng =
    locations.reduce((sum, s) => sum + s.location.lng, 0) / locations.length;

  return (
    <div style={{ height: '250px', width: '100%' }} className="rounded overflow-hidden border">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((sig, index) => (
          <Marker
            key={index}
            position={[sig.location.lat, sig.location.lng]}
          >
            <Popup>
              <strong>{sig.name || 'Anonymous supporter'}</strong>
              {sig.comment && (
                <div className="mt-1 small">
                  “{sig.comment}”
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PetitionMap;

