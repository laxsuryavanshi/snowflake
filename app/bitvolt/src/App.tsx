import { BrowserRouter } from 'react-router';

import { Header } from './components';
import { ThemeProvider } from './matex';

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Wrapper>
      <Header />
    </Wrapper>
  );
};

export default App;
