import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';

import Layout from './Layout';
import Router from './Router';

/**
 * @param {string} location
 */
export const render = location => {
  const html = renderToString(
    <StrictMode>
      <Layout>
        <StaticRouter location={location}>
          <Router />
        </StaticRouter>
      </Layout>
    </StrictMode>
  );
  return { html };
};
