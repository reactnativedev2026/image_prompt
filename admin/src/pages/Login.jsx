import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockOutlined as LockIcon
} from '@mui/icons-material';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/admin/login', { username, password });
      localStorage.setItem('admin_token', response.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, #f8fafc 70%)',
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            width: '100%',
            borderRadius: '24px',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0,0,0,0.02)',
            bgcolor: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle top accent bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 50%, #8b5cf6 100%)'
            }}
          />

          <Box display="flex" flexDirection="column" alignItems="center" mb={3.5}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                width: 54,
                height: 54,
                mb: 2
              }}
            >
              <SparkleIcon sx={{ fontSize: 28 }} />
            </Avatar>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                textAlign: 'center'
              }}
            >
              Prompt Trending
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
              Admin Control Center & Content Management
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                placeholder="admin"
                size="medium"
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '12px'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Admin'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
