import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import api from '../api';

const drawerWidth = 240;

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({ total_prompts: 0, total_categories: 0 });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStats();
  }, [location.pathname]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats({
        total_prompts: response.data.total_prompts || 0,
        total_categories: response.data.total_categories || 0
      });
    } catch (err) {
      try {
        const catRes = await api.get('/api/categories');
        setStats((prev) => ({
          ...prev,
          total_categories: (catRes.data || []).length
        }));
      } catch (catErr) {}
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Prompts', icon: <ImageIcon />, path: '/', count: stats.total_prompts },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories', count: stats.total_categories },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div" fontWeight="bold" color="primary">
          Prompt Trending
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.count > 0 && (
                <Chip
                  label={item.count}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                    color: location.pathname === item.path ? '#fff' : 'text.secondary'
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Admin Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
