import React from 'react';
import ReactDOM from 'react-dom/client';
// @ts-ignore - Temporal mientras App se migra a .tsx
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("No se encontró el elemento root en el DOM");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
