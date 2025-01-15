import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { Layout } from './components';
import { ThemeProvider } from './matex';

const IndexPage = lazy(() => import('./pages/IndexPage'));

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
