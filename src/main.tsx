import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error("GLOBAL ERROR CAUGHT:", event.error?.stack || event.error || event.message);
  fetch('/api/log', { method: 'POST', body: JSON.stringify({ stack: event.error?.stack || event.message }) }).catch(e=>e);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
