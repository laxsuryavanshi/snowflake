import { Outlet } from 'react-router';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { ListItemLink } from '@snowflake/matex';

import Header from './Header';

export const drawerWidth = 240;

const sidenavMenu: { label: string; icon: React.ReactNode; href: string }[] = [
  {
    label: 'All Files',
    icon: <AutoAwesomeMosaicIcon fontSize="small" />,
    /** @note empty string is ignored by ListItemButton, and it renders div instead of a */
    href: '.',
  },
  {
    label: 'Recent',
    icon: <ScheduleIcon fontSize="small" />,
    href: 'recent',
  },

  {
    label: 'Starred',
    icon: <StarIcon fontSize="small" />,
    href: 'starred',
  },
  {
    label: 'Shared',
    icon: <FolderSharedIcon fontSize="small" />,
    href: 'shared',
  },
  {
    label: 'Trash',
    icon: <DeleteIcon fontSize="small" />,
    href: 'trash',
  },
];

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
            href="/app"
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
        <List dense>
          {sidenavMenu.map(item => (
            <ListItem key={item.label}>
              <ListItemLink href={item.href} sx={{ borderRadius: 1 }}>
                <ListItemIcon sx={{ minWidth: '24px' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemLink>
            </ListItem>
          ))}
        </List>
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
