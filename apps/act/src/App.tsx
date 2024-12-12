import AppBar from '@mui/material/AppBar';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';

let theme = createTheme({
  typography: {
    fontFamily: 'var(--snowflake-font-family)',
    fontWeightBold: 700,
  },
});

theme = responsiveFontSizes(theme);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppBar elevation={0}>
        <Toolbar>
          <Link
            href="/"
            color="inherit"
            variant="h5"
            sx={{ textDecoration: 'none' }}
            className="flex items-center gap-1 select-none"
          >
            <img src="/music-robot-96.png" alt="snowflake" width={48} height={48} />
            <span>snowflake</span>
          </Link>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default App;
