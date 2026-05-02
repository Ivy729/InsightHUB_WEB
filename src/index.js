import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ErrorBoundary from './ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    Loading app...
  </div>
);

import('./App')
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    root.render(
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>Startup Error</h2>
        <p>App failed before first render:</p>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
          {error?.message || String(error)}
        </pre>
      </div>
    );
  });
