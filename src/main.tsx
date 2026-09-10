import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';
import { PatientProvider } from './context/PatientContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PatientProvider>
      <App />
    </PatientProvider>
  </React.StrictMode>,
);
