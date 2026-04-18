import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global styles — order matters: main first, then page-specific
import '../css/main.css';
import '../css/components.css';
import '../css/index.css';
import '../css/auth.css';
import '../css/dashboard.css';
import '../css/lista.css';
import '../css/gestor.css';
import '../css/checkout.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
