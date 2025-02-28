import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import './index.css';
import Layout from './Layout';
import Router from './Router';

hydrateRoot(
  document.getElementById('root'),
  <StrictMode>
    <Layout>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </Layout>
  </StrictMode>
);
