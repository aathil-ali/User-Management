import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n'; // Initialize i18n before rendering the app
import './index.css';
import App from './App';

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
