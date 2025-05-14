import React from 'react';

const BandList = ({ bands }) => {
  if (bands.length === 0) return <p>No bands found.</p>;

  return (
    <div>
      <h3>Found Bands:</h3>
      <ul>
        {bands.map(band => (
          <li key={band.id}>
            <strong>{band.name}</strong>
            {band['life-span']?.begin && (
              <span> (Founded: {band['life-span'].begin})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BandList;
