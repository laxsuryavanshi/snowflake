import { useState } from 'react';
import AppsIcon from '@mui/icons-material/Apps';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import AppBar, { AppBarOwnProps } from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MuiToolbar from '@mui/material/Toolbar';
import { styled } from '@mui/material/styles';
import { useAuthenticator } from '@aws-amplify/ui-react-core';

import avatarUrl from '@/assets/profile.svg';
import { DisplayMode, useTheme } from '@/theme';

export const headerHeight = 76;

const Toolbar = styled(MuiToolbar)({
  alignItems: 'center',

  '@media all': {
    minHeight: headerHeight,
    paddingLeft: '32px',
    paddingRight: '32px',
  },
});

const AppHeader: React.FC<{ sx?: AppBarOwnProps['sx'] }> = ({ sx }) => {
  const user = {
    name: 'Laxmikant Suryavanshi',
    avatarUrl,
  };

  const { mode, setMode } = useTheme();

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: DisplayMode) => {
    setMode(newMode);
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { signOut } = useAuthenticator(({ signOut }) => [signOut]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSignOut = () => {
    signOut();
  };

  return (
    <AppBar elevation={0} color="inherit" sx={sx}>
      <Toolbar>
        <Box flex="1" />

        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '56px' }}>
          <IconButton size="large" color="inherit">
            <AppsIcon />
          </IconButton>
          <IconButton size="large" color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton sx={{ p: 0, ml: 1.5 }} onClick={handleClick}>
            <Avatar alt={user.name} src={user.avatarUrl} />
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
            slotProps={{ paper: { sx: { px: 2, mt: 1 } } }}
          >
            <ListItem disableGutters>
              <ListItemText
                primary={user.name}
                secondary="Free Plan"
                slotProps={{
                  secondary: {
                    variant: 'caption',
                    fontWeight: 700,
                    color: 'inherit',
                  },
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
                <LightModeIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="dark">
                <DarkModeIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="system">
                <SettingsBrightnessIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <MenuItem sx={{ borderRadius: 1 }}>
              <ListItemIcon>
                <ManageAccountsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </MenuItem>

            <MenuItem
              sx={theme => ({ borderRadius: 1, color: theme.palette.error.main })}
              onClick={onSignOut}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Divider />
    </AppBar>
  );
};

export default AppHeader;
