import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/anybody/standard.css';
import '@fontsource-variable/instrument-sans';
import { applyTokens } from './theme/tokens';
import App from './App';
import './index.css';

applyTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
