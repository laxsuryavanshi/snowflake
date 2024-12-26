import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@snowflake/matex';

import Router from './Router';

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={Router} />
    </ThemeProvider>
  );
};

export default App;
