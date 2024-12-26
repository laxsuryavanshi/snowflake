import { useEffect, useState } from 'react';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';

import { DisplayMode, useTheme } from '@snowflake/matex';

import github, { GitHubUser } from '@/services/github';

const Header = () => {
  const [user, setUser] = useState<GitHubUser>();

  useEffect(() => {
    void github.getUser().then(user => {
      setUser(user);
    });
  }, []);

  const { mode, setMode } = useTheme();

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: DisplayMode) => {
    setMode(newMode);
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar elevation={0}>
      <Toolbar>
        <Link
          href="/"
          color="inherit"
          variant="h5"
          fontWeight={700}
          sx={{ textDecoration: 'none' }}
          className="flex items-center gap-1 select-none"
        >
          <img src="/music-robot-96.png" alt="snowflake" width={48} height={48} />
          <span>snowflake</span>
        </Link>

        <Box flex="1" />

        <Box className="flex items-center">
          {user && (
            <>
              <IconButton onClick={handleClick}>
                <Avatar alt={user.name ?? user.login} src={user.avatar_url} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={e => {
                  e.stopPropagation();
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { px: 2, mt: 0.5 } } }}
              >
                <ListItem disableGutters>
                  <ListItemText
                    primary={user.name}
                    secondary="Free Plan"
                    secondaryTypographyProps={{
                      variant: 'caption',
                      fontWeight: 700,
                      color: 'inherit',
                    }}
                  />
                </ListItem>

                <Divider sx={{ mb: 1 }} />

                <ToggleButtonGroup
                  fullWidth
                  size="small"
                  value={mode}
                  exclusive
                  onChange={handleModeChange}
                  sx={{ mb: 1 }}
                >
                  <ToggleButton value="light">
                    <LightModeIcon />
                  </ToggleButton>
                  <ToggleButton value="dark">
                    <DarkModeIcon />
                  </ToggleButton>
                  <ToggleButton value="system">
                    <SettingsBrightnessIcon />
                  </ToggleButton>
                </ToggleButtonGroup>

                <MenuItem sx={{ borderRadius: 1 }}>
                  <ListItemIcon>
                    <ManageAccountsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Account" />
                </MenuItem>

                <MenuItem sx={theme => ({ borderRadius: 1, color: theme.palette.error.main })}>
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
