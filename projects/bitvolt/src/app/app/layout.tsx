'use client';

import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

const sidenavMenu: { label: string; icon: React.ReactNode; href: string }[] = [
  {
    label: 'All Files',
    icon: <AutoAwesomeMosaicIcon fontSize="small" />,
    href: '/app',
  },
  {
    label: 'Recent',
    icon: <ScheduleIcon fontSize="small" />,
    href: '/app/recent',
  },
  {
    label: 'Starred',
    icon: <StarIcon fontSize="small" />,
    href: '/app/starred',
  },
  {
    label: 'Shared',
    icon: <FolderSharedIcon fontSize="small" />,
    href: '/app/shared',
  },
  {
    label: 'Trash',
    icon: <DeleteIcon fontSize="small" />,
    href: '/app/trash',
  },
];

const px = (value: number) => `${value.toString()}px`;

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        color="inherit"
        elevation={0}
        sx={{
          width: `calc(100% - ${px(drawerWidth)})`,
          ml: px(drawerWidth),
        }}
      >
        <Toolbar></Toolbar>
      </AppBar>

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
            <ListItem key={item.href}>
              <ListItemButton
                href={item.href}
                selected={pathname === item.href}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: px(24) }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, py: 3, px: 4 }}>
        <Toolbar />
        <Box className="">{children}</Box>
      </Box>
    </Box>
  );
}
