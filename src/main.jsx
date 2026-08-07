import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Import Bootstrap CSS (if not already included in HTML)
// import 'bootstrap/dist/css/bootstrap.min.css';

// Create root and render app
const rootElement = document.getElementById('react-root');

if (!rootElement) {
  throw new Error('BTEA portal could not start: missing #react-root mount point.');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
