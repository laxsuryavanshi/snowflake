import { createBrowserRouter } from 'react-router-dom';

import IndexPage from './page/IndexPage';

const Router = createBrowserRouter([
  {
    path: '',
    element: <IndexPage />,
  },
]);

export default Router;
