import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

import '@fontsource/ubuntu/400.css';
import '@fontsource/ubuntu/500.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
