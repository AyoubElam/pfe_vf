/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import EvaluationPage from '../../components/prof/evaluation';

const HomePage: React.FC = () => {
  return (
    <div>
      <header style={{ padding: '20px', background: '#0070f3', color: '#fff' }}>
        
      </header>
      <main style={{ padding: '20px' }}>
        {/* Appel du composant EvaluationPage */}
        <EvaluationPage />
      </main>
    </div>
  );
};

export default HomePage;
