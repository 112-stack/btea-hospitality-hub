import React from 'react';
import ReactDOM from 'react-dom/client';
import PublicPortal from './PublicPortal';
import './styles/globals.css';

const rootElement = document.getElementById('react-root');
if (!rootElement) throw new Error('BTEA public portal could not start: missing #react-root mount point.');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <PublicPortal />
  </React.StrictMode>,
);

