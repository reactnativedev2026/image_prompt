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
  Tabs,
  Tab
} from '@mui/material';
import api from '../api';

export default function Login() {
  const [activeTab, setActiveTab] = useState(0); // 0 for Login, 1 for Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (activeTab === 0) {
        // Login
        const response = await api.post('/api/admin/login', { username, password });
        localStorage.setItem('admin_token', response.data.access_token);
        navigate('/');
      } else {
        // Register
        await api.post('/api/admin/register', { username, password });
        setSuccess('Registration successful! You can now log in.');
        setActiveTab(0);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
            KIDIip Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your AI prompt collection
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 1, borderRadius: 2 }}
          >
            {activeTab === 0 ? 'Login' : 'Register'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
