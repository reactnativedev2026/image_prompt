import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  Backdrop,
  CardActionArea,
  Tooltip,
  Snackbar,
  Switch,
  FormControlLabel,
  Chip,
  Avatar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  Whatshot as TrendingIcon,
  Category as CategoryIcon,
  PhotoLibrary as ImageIcon,
  Collections as CollectionsIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Check as CheckIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api, { getErrorMessage } from '../api';

export default function Prompts() {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total_prompts: 0,
    trending_prompts: 0,
    regular_prompts: 0,
    total_categories: 0,
    total_views: 0,
    category_stats: []
  });
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Pagination states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterTrending, setFilterTrending] = useState('');
  const [storageFilter, setStorageFilter] = useState('hide_aws'); // 'hide_aws' | 'include_all' | 'only_aws'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog / Modal Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState(null);

  // Form fields
  const [promptText, setPromptText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isTrending, setIsTrending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, [storageFilter]);

  useEffect(() => {
    fetchPrompts();
  }, [page, limit, selectedCategory, search, filterTrending, storageFilter]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats', {
        params: { include_all: storageFilter !== 'hide_aws' }
      });
      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.log('Stats API unavailable, using local calculation');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories', {
        params: { include_all: storageFilter !== 'hide_aws' }
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        order: 'latest',
        include_all: storageFilter !== 'hide_aws',
        only_aws: storageFilter === 'only_aws',
        search: search || undefined,
        category_id: selectedCategory || undefined,
        is_trending: filterTrending !== '' ? (filterTrending === 'true') : undefined
      };
      const response = await api.get('/api/prompts', { params });
      setPrompts(response.data);

      const countHeader = response.headers['x-total-count'];
      const count = countHeader !== undefined ? parseInt(countHeader, 10) : response.data.length;
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / limit)));
    } catch (err) {
      setError('Failed to fetch prompts.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = () => {
    fetchStats();
    fetchCategories();
    fetchPrompts();
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setPromptText('');
    setCategoryId('');
    setImageUrl('');
    setIsTrending(false);
    setCurrentPromptId(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (prompt, e) => {
    e.stopPropagation();
    setEditMode(true);
    setPromptText(prompt.prompt_text);
    setCategoryId(prompt.category_id);
    setImageUrl(prompt.image_url);
    setIsTrending(Boolean(prompt.is_trending));
    setCurrentPromptId(prompt.id);
    setOpenDialog(true);
  };

  const handleOpenDetail = (prompt) => {
    setSelectedPrompt(prompt);
    setOpenDetailDialog(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setGlobalLoading(true);
    setLoadingMessage('Uploading image...');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImageUrl(response.data.image_url);
      setSuccess('Image uploaded successfully!');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload image.'));
    } finally {
      setUploadingImage(false);
      setGlobalLoading(false);
    }
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    if (!imageUrl || !promptText || !categoryId) {
      setError('All fields including image are required.');
      return;
    }
    if (promptText.trim().length < 5) {
      setError('Prompt text must be at least 5 characters long.');
      return;
    }
    setError('');
    setSuccess('');
    setGlobalLoading(true);
    setLoadingMessage(editMode ? 'Updating prompt...' : 'Creating prompt...');

    const payload = {
      image_url: imageUrl,
      prompt_text: promptText.trim(),
      category_id: parseInt(categoryId),
      is_trending: isTrending,
    };

    try {
      if (editMode) {
        await api.put(`/api/admin/prompts/${currentPromptId}`, payload);
        setSuccess('Prompt updated successfully!');
      } else {
        await api.post('/api/admin/prompts', payload);
        setSuccess('Prompt created successfully!');
      }
      setOpenDialog(false);
      fetchPrompts();
      fetchStats();
      fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save prompt.'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleToggleTrending = async (prompt, e) => {
    e.stopPropagation();
    try {
      const response = await api.patch(`/api/admin/prompts/${prompt.id}/toggle-trending`);
      setPrompts((prev) =>
        prev.map((p) => (p.id === prompt.id ? { ...p, is_trending: response.data.is_trending } : p))
      );
      setSnackbarMessage(
        response.data.is_trending
          ? 'Prompt marked as Trending! 🔥'
          : 'Prompt removed from Trending.'
      );
      setSnackbarOpen(true);
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update trending status.'));
    }
  };

  const handleDeletePrompt = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    setError('');
    setSuccess('');
    setGlobalLoading(true);
    setLoadingMessage('Deleting prompt...');
    try {
      await api.delete(`/api/admin/prompts/${id}`);
      setSuccess('Prompt deleted successfully!');
      fetchPrompts();
      fetchStats();
      fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete prompt.'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleCopyPrompt = (text, id = null) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    setSnackbarMessage('Prompt copied to clipboard!');
    setSnackbarOpen(true);
  };

  const currentTotalPrompts = stats.total_prompts || totalCount;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Global loading backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000, flexDirection: 'column', gap: 2 }}
        open={globalLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" fontWeight="bold">{loadingMessage}</Typography>
      </Backdrop>

      {/* Page Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Prompts Gallery
            </Typography>
            <Tooltip title="Refresh all data">
              <IconButton
                size="small"
                onClick={handleRefreshAll}
                sx={{
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  color: 'primary.main',
                  '&:hover': { bgcolor: '#f1f5f9' }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage, filter, and publish AI image generation prompts
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAdd}
          startIcon={<AddIcon />}
          sx={{
            py: 1.2,
            px: 2.5,
            fontSize: '0.92rem',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
          }}
        >
          Add New Prompt
        </Button>
      </Box>

      {/* Top Statistical Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Prompts */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.08)',
                borderColor: 'rgba(79, 70, 229, 0.3)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                  Total Prompts
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, lineHeight: 1.2 }}>
                  {currentTotalPrompts}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(79, 70, 229, 0.08)',
                  color: '#4f46e5',
                  p: 1.2,
                  borderRadius: '12px',
                  display: 'flex'
                }}
              >
                <ImageIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Trending */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(234, 88, 12, 0.08)',
                borderColor: 'rgba(234, 88, 12, 0.3)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                  🔥 Trending
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ea580c', mt: 0.5, lineHeight: 1.2 }}>
                  {stats.trending_prompts}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(234, 88, 12, 0.08)',
                  color: '#ea580c',
                  p: 1.2,
                  borderRadius: '12px',
                  display: 'flex'
                }}
              >
                <TrendingIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Regular Prompts */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.3)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                  Regular
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5, lineHeight: 1.2 }}>
                  {stats.regular_prompts}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  color: '#10b981',
                  p: 1.2,
                  borderRadius: '12px',
                  display: 'flex'
                }}
              >
                <CollectionsIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Categories Count */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(139, 92, 246, 0.08)',
                borderColor: 'rgba(139, 92, 246, 0.3)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                  Categories
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6', mt: 0.5, lineHeight: 1.2 }}>
                  {categories.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(139, 92, 246, 0.08)',
                  color: '#8b5cf6',
                  p: 1.2,
                  borderRadius: '12px',
                  display: 'flex'
                }}
              >
                <CategoryIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Total Views */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(217, 119, 6, 0.08)',
                borderColor: 'rgba(217, 119, 6, 0.3)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                  Impressions
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#d97706', mt: 0.5, lineHeight: 1.2 }}>
                  {stats.total_views ? stats.total_views.toLocaleString() : 0}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: 'rgba(217, 119, 6, 0.08)',
                  color: '#d97706',
                  p: 1.2,
                  borderRadius: '12px',
                  display: 'flex'
                }}
              >
                <VisibilityIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Horizontal Category Ribbon with Name and Count in clean row layout */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <CategoryIcon color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0f172a', fontSize: '0.95rem' }}>
              Categories Filter
            </Typography>
            <Chip
              label={`${categories.length} Categories`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: 'rgba(79, 70, 229, 0.08)',
                color: '#4f46e5',
                borderRadius: '6px'
              }}
            />
          </Box>
          {selectedCategory && (
            <Button
              size="small"
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: 'primary.main',
                py: 0.2
              }}
            >
              Show All ({currentTotalPrompts} items)
            </Button>
          )}
        </Box>

        {/* Scrollable Category Row: Name and Count side by side */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1.2,
            overflowX: 'auto',
            pb: 1,
            pt: 0.3,
            whiteSpace: 'nowrap',
            '::-webkit-scrollbar': {
              height: 6,
            },
            '::-webkit-scrollbar-track': {
              background: '#f8fafc',
              borderRadius: 3,
            },
            '::-webkit-scrollbar-thumb': {
              background: '#cbd5e1',
              borderRadius: 3,
              '&:hover': {
                background: '#94a3b8',
              },
            },
          }}
        >
          {/* All Categories Chip (Row with Name + Count) */}
          <Chip
            clickable
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            label={
              <Box sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Typography component="span" sx={{ fontWeight: selectedCategory === '' ? 700 : 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  All Categories
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: selectedCategory === '' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(79, 70, 229, 0.08)',
                    color: selectedCategory === '' ? '#ffffff' : '#4f46e5',
                    px: 1,
                    py: 0.2,
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    minWidth: 22,
                    textAlign: 'center'
                  }}
                >
                  {currentTotalPrompts}
                </Box>
              </Box>
            }
            sx={{
              py: 2.2,
              px: 1,
              borderRadius: '12px',
              border: '1.5px solid',
              borderColor: selectedCategory === '' ? '#4f46e5' : '#e2e8f0',
              bgcolor: selectedCategory === '' ? '#4f46e5' : '#ffffff',
              color: selectedCategory === '' ? '#ffffff' : '#1e293b',
              flexShrink: 0,
              boxShadow: selectedCategory === '' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: selectedCategory === '' ? '#4338ca' : '#f8fafc',
                borderColor: selectedCategory === '' ? '#4338ca' : '#cbd5e1',
                transform: 'translateY(-1px)'
              },
            }}
          />

          {/* Individual Category Chips (Row with Name + Count) */}
          {categories.map((cat) => {
            const isSelected = String(selectedCategory) === String(cat.id);
            const imageCount =
              cat.prompt_count !== undefined
                ? cat.prompt_count
                : stats.category_stats?.find((c) => c.id === cat.id)?.prompt_count || 0;

            return (
              <Chip
                key={cat.id}
                clickable
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategory('');
                  } else {
                    setSelectedCategory(cat.id);
                  }
                  setPage(1);
                }}
                label={
                  <Box sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSelected
                          ? 'rgba(255, 255, 255, 0.3)'
                          : imageCount > 0
                          ? 'rgba(79, 70, 229, 0.08)'
                          : '#f1f5f9',
                        color: isSelected
                          ? '#ffffff'
                          : imageCount > 0
                          ? '#4f46e5'
                          : '#94a3b8',
                        px: 1,
                        py: 0.2,
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        minWidth: 22,
                        textAlign: 'center'
                      }}
                    >
                      {imageCount}
                    </Box>
                  </Box>
                }
                sx={{
                  py: 2.2,
                  px: 1,
                  borderRadius: '12px',
                  border: '1.5px solid',
                  borderColor: isSelected ? '#4f46e5' : '#e2e8f0',
                  bgcolor: isSelected ? '#4f46e5' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#1e293b',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: isSelected ? '#4338ca' : '#f8fafc',
                    borderColor: isSelected ? '#4338ca' : '#cbd5e1',
                    transform: 'translateY(-1px)'
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>{success}</Alert>}

      {/* Advanced Filter & Search Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.2,
          mb: 3,
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          bgcolor: '#ffffff'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Box */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Search Prompts"
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search keyword..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearch(''); setPage(1); }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>

          {/* Filter by Category */}
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select
              label="Category"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">
                All Categories ({currentTotalPrompts})
              </MenuItem>
              {categories.map((cat) => {
                const catStat = stats.category_stats?.find((c) => c.id === cat.id);
                const countDisplay = catStat ? ` (${catStat.prompt_count})` : (cat.prompt_count !== undefined ? ` (${cat.prompt_count})` : '');
                return (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}{countDisplay}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>

          {/* Filter by Trending Status */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              fullWidth
              value={filterTrending}
              onChange={(e) => {
                setFilterTrending(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Statuses ({currentTotalPrompts})</MenuItem>
              <MenuItem value="true">🔥 Trending ({stats.trending_prompts})</MenuItem>
              <MenuItem value="false">Regular ({stats.regular_prompts})</MenuItem>
            </TextField>
          </Grid>

          {/* Storage / AWS Filter */}
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select
              label="Storage Source"
              variant="outlined"
              size="small"
              fullWidth
              value={storageFilter}
              onChange={(e) => {
                setStorageFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="hide_aws">🛡️ Active Only (Hide AWS)</MenuItem>
              <MenuItem value="include_all">🌐 Show All (Include AWS)</MenuItem>
              <MenuItem value="only_aws">☁️ Only AWS S3 Images</MenuItem>
            </TextField>
          </Grid>

          {/* Page Limit */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Items per page"
              variant="outlined"
              size="small"
              fullWidth
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <MenuItem value={12}>12 / page</MenuItem>
              <MenuItem value={24}>24 / page</MenuItem>
              <MenuItem value={48}>48 / page</MenuItem>
              <MenuItem value={96}>96 / page</MenuItem>
              <MenuItem value={200}>All (200)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Count Summary & Filter Chips Strip */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pt={1.5} borderTop="1px solid #f1f5f9" flexWrap="wrap" gap={1.5}>
          <Box display="flex" alignItems="center" gap={1.2} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{prompts.length > 0 ? (page - 1) * limit + 1 : 0}</strong>–<strong>{Math.min(page * limit, totalCount)}</strong> of <strong>{totalCount}</strong> matching prompts
            </Typography>
            {storageFilter !== 'hide_aws' && (
              <Chip
                label={storageFilter === 'include_all' ? 'AWS S3: Included' : 'AWS S3: Only'}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.7rem' }}
              />
            )}
            {(search || selectedCategory || filterTrending !== '' || storageFilter !== 'hide_aws') && (
              <Chip
                label="Reset Filters"
                size="small"
                onDelete={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setFilterTrending('');
                  setStorageFilter('hide_aws');
                  setPage(1);
                }}
                color="default"
                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            Page {page} of {totalPages}
          </Typography>
        </Box>
      </Paper>

      {/* Prompts Cards Grid */}
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={10} gap={2}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Loading prompts...</Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 2.5
            }}
          >
            {prompts.length === 0 ? (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  py: 8,
                  bgcolor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px dashed #cbd5e1'
                }}
              >
                <ImageIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                <Typography color="text.primary" variant="h6" fontWeight="bold">
                  No prompts found
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 400, mx: 'auto', mt: 0.5 }}>
                  Try changing your search query or reset active filters.
                </Typography>
                {(search || selectedCategory || filterTrending !== '' || storageFilter !== 'hide_aws') && (
                  <Button
                    variant="outlined"
                    sx={{ mt: 2.5 }}
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('');
                      setFilterTrending('');
                      setStorageFilter('hide_aws');
                      setPage(1);
                    }}
                  >
                    Reset All Filters
                  </Button>
                )}
              </Box>
            ) : (
              prompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    bgcolor: '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleOpenDetail(prompt)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    {/* Card Image with Floating Badges */}
                    <Box sx={{ position: 'relative', width: '100%', pt: '75%', bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={prompt.image_url}
                        alt={prompt.prompt_text}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.03)' }
                        }}
                      />

                      {/* AWS Tag */}
                      {prompt.image_url?.includes('amazonaws.com') && (
                        <Chip
                          label="AWS S3"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: 'rgba(245, 158, 11, 0.95)',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontSize: '0.62rem',
                            height: 20,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            zIndex: 2,
                            '& .MuiChip-label': { px: 0.6 }
                          }}
                        />
                      )}

                      {/* Trending Tag */}
                      {prompt.is_trending && (
                        <Chip
                          icon={<TrendingIcon sx={{ fontSize: '13px !important', color: '#ea580c !important' }} />}
                          label="Trending"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 800,
                            color: '#ea580c',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            zIndex: 2,
                            height: 22,
                            '& .MuiChip-label': { px: 0.7 }
                          }}
                        />
                      )}
                    </Box>

                    {/* Card Content with Category in Row */}
                    <CardContent sx={{ flexGrow: 1, width: '100%', boxSizing: 'border-box', p: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Chip
                          label={categories.find((c) => c.id === prompt.category_id)?.name || 'Uncategorized'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(79, 70, 229, 0.08)',
                            color: '#4f46e5',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            borderRadius: '6px'
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                          #{prompt.id}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                          lineHeight: 1.5,
                          fontSize: '0.83rem'
                        }}
                      >
                        {prompt.prompt_text}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  {/* Card Action Bar */}
                  <CardActions
                    sx={{
                      justifyContent: 'space-between',
                      px: 1.8,
                      py: 1,
                      borderTop: '1px solid #f1f5f9',
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary" title="Views">
                        <VisibilityIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" fontWeight="600" color="text.secondary" fontSize="0.75rem">
                          {prompt.view_count || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} color="text.secondary" title="Copies">
                        <ContentCopyIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="caption" fontWeight="600" color="text.secondary" fontSize="0.75rem">
                          {prompt.copy_count || 0}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.4}>
                      <Tooltip title={prompt.is_trending ? "Remove from Trending" : "Mark as Trending"}>
                        <IconButton
                          size="small"
                          color={prompt.is_trending ? "warning" : "default"}
                          onClick={(e) => handleToggleTrending(prompt, e)}
                          sx={{ '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)' } }}
                        >
                          <TrendingIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={copiedId === prompt.id ? "Copied!" : "Copy Prompt Text"}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt.prompt_text, prompt.id); }}
                          sx={{
                            color: copiedId === prompt.id ? '#10b981' : undefined,
                            '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.08)' }
                          }}
                        >
                          {copiedId === prompt.id ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Prompt">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => handleOpenEdit(prompt, e)}
                          sx={{ '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Prompt">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeletePrompt(prompt.id, e)}
                          sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>

          {/* Bottom Pagination Strip */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3.5,
              p: 2,
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{prompts.length > 0 ? (page - 1) * limit + 1 : 0}</strong>–<strong>{Math.min(page * limit, totalCount)}</strong> of <strong>{totalCount}</strong> prompts
            </Typography>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">Per page:</Typography>
              <TextField
                select
                size="small"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                sx={{ width: 100 }}
              >
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
                <MenuItem value={48}>48</MenuItem>
                <MenuItem value={96}>96</MenuItem>
                <MenuItem value={200}>200</MenuItem>
              </TextField>
            </Box>
          </Paper>
        </>
      )}

      {/* Prompt Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth scroll="body">
        {selectedPrompt && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Prompt Details</span>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label={`ID: #${selectedPrompt.id}`} size="small" variant="outlined" />
                <IconButton size="small" onClick={() => setOpenDetailDialog(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={selectedPrompt.image_url}
                    alt="Prompt visual"
                    sx={{ width: '100%', height: '100%', minHeight: 320, maxHeight: 440, objectFit: 'cover' }}
                  />
                </Grid>
                <Grid item xs={12} md={6} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Category
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {categories.find((c) => c.id === selectedPrompt.category_id)?.name || 'Uncategorized'}
                      </Typography>
                    </Box>
                    {selectedPrompt.is_trending ? (
                      <Chip
                        icon={<TrendingIcon sx={{ color: '#ea580c !important' }} />}
                        label="Trending"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    ) : (
                      <Chip label="Regular" size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Prompt Text
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', mt: 1, minHeight: 120, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {selectedPrompt.prompt_text}
                      </Typography>
                    </Paper>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyPrompt(selectedPrompt.prompt_text)}
                    fullWidth
                    sx={{ py: 1.2 }}
                  >
                    Copy Prompt Text
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5 }}>
              <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? 'Edit Prompt' : 'Add New Prompt'}</DialogTitle>
        <form onSubmit={handleSavePrompt}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Left Column: Form Fields */}
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2.5}>
                  <TextField
                    select
                    label="Category"
                    variant="outlined"
                    fullWidth
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Prompt Text"
                    variant="outlined"
                    fullWidth
                    required
                    multiline
                    rows={6}
                    placeholder="Enter prompt description..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />

                  {/* Trending Option Toggle */}
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: isTrending ? '#f59e0b' : '#e2e8f0',
                      borderRadius: '12px',
                      backgroundColor: isTrending ? 'rgba(245, 158, 11, 0.08)' : '#fafafa',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isTrending}
                          onChange={(e) => setIsTrending(e.target.checked)}
                          color="warning"
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <TrendingIcon color={isTrending ? "warning" : "action"} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Trending Prompt
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {isTrending ? 'Featured in trending feed' : 'Toggle to feature in trending feed'}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Image Preview & Upload Dropzone */}
              <Grid item xs={12} md={6}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    p: 3,
                    height: '100%',
                    minHeight: 280,
                    backgroundColor: '#f8fafc'
                  }}
                >
                  {imageUrl ? (
                    <Box display="flex" flexDirection="column" gap={2} alignItems="center" width="100%">
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          maxHeight: 220,
                          objectFit: 'contain',
                          borderRadius: '12px',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        disabled={uploadingImage}
                        size="small"
                        sx={{ borderRadius: '10px' }}
                      >
                        Change Image
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                    </Box>
                  ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2} textAlign="center">
                      <Avatar sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', color: 'primary.main', width: 56, height: 56 }}>
                        <CloudUploadIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Upload Prompt Visual
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          PNG, JPG, WebP up to 10MB
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={uploadingImage ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        disabled={uploadingImage}
                        sx={{ borderRadius: '10px' }}
                      >
                        {uploadingImage ? 'Uploading...' : 'Browse Image'}
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={uploadingImage} sx={{ px: 3 }}>
              {editMode ? 'Update Prompt' : 'Save Prompt'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar alerts */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
