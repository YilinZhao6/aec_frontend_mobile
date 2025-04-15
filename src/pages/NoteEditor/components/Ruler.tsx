import React from 'react';

const Ruler: React.FC = () => {
  const numbers = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="ruler">
      {numbers.map(num => (
        <div key={num} className="ruler-mark">
          <span className="ruler-number">{num}</span>
        </div>
      ))}
    </div>
  );
};

export default Ruler;