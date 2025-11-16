import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Bootstrap CSS (if not already included in HTML)
// import 'bootstrap/dist/css/bootstrap.min.css';

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
