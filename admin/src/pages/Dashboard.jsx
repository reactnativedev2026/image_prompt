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
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
  AutoAwesome as SparkleIcon,
  AdminPanelSettings as AdminIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import api from '../api';

const drawerWidth = 260;

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
    { text: 'Prompts Gallery', icon: <ImageIcon />, path: '/', count: stats.total_prompts },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories', count: stats.total_categories },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            width: 42,
            height: 42,
            borderRadius: '12px'
          }}
        >
          <SparkleIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Prompt Trending
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Admin Console
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        <Typography variant="caption" sx={{ px: 1.5, mb: 1, display: 'block', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
          Overview & Management
        </Typography>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isSelected}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  px: 2,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                    '& .MuiListItemIcon-root': {
                      color: '#ffffff',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? '#ffffff' : '#64748b', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem'
                  }}
                />
                {item.count > 0 && (
                  <Chip
                    label={item.count}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(79, 70, 229, 0.08)',
                      color: isSelected ? '#ffffff' : '#4f46e5',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* User Info & Logout Action */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            py: 1.2,
            px: 2,
            color: '#ef4444',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 38 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />

      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          color: '#0f172a',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.05rem', color: '#0f172a' }}>
              {menuItems.find((item) => item.path === location.pathname)?.text || 'Admin Dashboard'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            <Chip
              icon={<AdminIcon sx={{ fontSize: '16px !important', color: '#4f46e5 !important' }} />}
              label="Admin Active"
              size="small"
              sx={{
                bgcolor: 'rgba(79, 70, 229, 0.08)',
                color: '#4f46e5',
                fontWeight: 700,
                fontSize: '0.78rem',
                height: 28,
                px: 0.5,
                borderRadius: '8px'
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer */}
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
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #f1f5f9' },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #f1f5f9' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
