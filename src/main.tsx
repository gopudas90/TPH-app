import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './ErrorBoundary';

window.onerror = function(message, source, lineno, colno, error) {
  const div = document.createElement('div');
  div.style.color = 'red';
  div.style.padding = '20px';
  div.style.fontFamily = 'monospace';
  div.innerHTML = `<h3>Global Error</h3><p>${message}</p><p>${source}:${lineno}:${colno}</p><pre>${error?.stack}</pre>`;
  document.body.appendChild(div);
};

window.addEventListener('unhandledrejection', function(event) {
  const div = document.createElement('div');
  div.style.color = 'orange';
  div.style.padding = '20px';
  div.style.fontFamily = 'monospace';
  div.innerHTML = `<h3>Unhandled Promise Rejection</h3><p>${event.reason}</p><pre>${event.reason?.stack}</pre>`;
  document.body.appendChild(div);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
