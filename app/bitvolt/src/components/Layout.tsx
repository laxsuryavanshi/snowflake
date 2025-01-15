import { Outlet } from 'react-router';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';

import Header from './Header';

export const drawerWidth = 240;

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        open
      >
        <Toolbar>
          <Link
            href="/"
            color="inherit"
            variant="h5"
            fontWeight={700}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              userSelect: 'none',
            }}
          >
            <img src="/music-robot-96.png" alt="bitvolt" width={48} height={48} />
            <span>bitvolt</span>
          </Link>
        </Toolbar>
      </Drawer>
      <Box component="main" flexGrow={1}>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
