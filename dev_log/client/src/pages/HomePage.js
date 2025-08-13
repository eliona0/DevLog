import React from 'react';
import '../styles/homepage.css';

function HomePage() {
  return (
    <div className="container">
    <div className="homepage">
      <div className="layer left-layer">
        <h1>Left</h1>
      </div>

      <div className="layer middle-layer">
        <h1>Middle </h1>
      </div>

      <div className="layer right-layer">
        <h1>Right</h1>
      </div>
    </div>
    </div>
  );
}

export default HomePage;
