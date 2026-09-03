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
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api, { getErrorMessage } from '../api';

export default function Prompts() {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

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
  const [uploadingImage, setUploadingImage] = useState(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [page, selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
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
        search: search || undefined,
        category_id: selectedCategory || undefined
      };
      const response = await api.get('/api/prompts', { params });
      setPrompts(response.data);
      if (response.data.length === limit) {
        setTotalPages(page + 1);
      } else {
        setTotalPages(page);
      }
    } catch (err) {
      setError('Failed to fetch prompts.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setPromptText('');
    setCategoryId('');
    setImageUrl('');
    setCurrentPromptId(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (prompt, e) => {
    e.stopPropagation(); // Prevent card click trigger
    setEditMode(true);
    setPromptText(prompt.prompt_text);
    setCategoryId(prompt.category_id);
    setImageUrl(prompt.image_url);
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
    setLoadingMessage('Uploading image to AWS S3...');
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
      setError(getErrorMessage(err, 'Failed to upload image to S3.'));
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
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save prompt.'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDeletePrompt = async (id, e) => {
    e.stopPropagation(); // Prevent card click trigger
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    setError('');
    setSuccess('');
    setGlobalLoading(true);
    setLoadingMessage('Deleting prompt...');
    try {
      await api.delete(`/api/admin/prompts/${id}`);
      setSuccess('Prompt deleted successfully!');
      fetchPrompts();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete prompt.'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Prompt copied to clipboard!');
    setSnackbarOpen(true);
  };

  return (
    <Box>
      {/* Global loading overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000, flexDirection: 'column', gap: 2 }}
        open={globalLoading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">{loadingMessage}</Typography>
      </Backdrop>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight="bold">
          Manage Prompts
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenAdd}>
          Add New Prompt
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Filter by Category"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Prompts Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3
          }}>
            {prompts.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No prompts found matching the criteria.
                </Typography>
              </Box>
            ) : (
              prompts.map((prompt) => (
                <Card key={prompt.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardActionArea onClick={() => handleOpenDetail(prompt)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={prompt.image_url}
                      alt={prompt.prompt_text}
                      sx={{ objectFit: 'cover', width: '100%' }}
                    />
                    <CardContent sx={{ flexGrow: 1, width: '100%', boxSizing: 'border-box' }}>
                      <Typography variant="caption" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }} gutterBottom>
                        {categories.find((c) => c.id === prompt.category_id)?.name || 'Uncategorized'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        mt: 1
                      }}>
                        {prompt.prompt_text}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="caption" color="text.secondary">
                      Views: {prompt.view_count || 0}
                    </Typography>
                    <Box>
                      <Tooltip title="Copy Prompt">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopyPrompt(prompt.prompt_text); }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(prompt, e)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={(e) => handleDeletePrompt(prompt.id, e)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth scroll="body">
        {selectedPrompt && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Prompt Details</DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <Box component="img" src={selectedPrompt.image_url} alt="Prompt visual" sx={{ width: '100%', height: '100%', maxHeight: 400, objectFit: 'cover' }} />
                </Grid>
                <Grid item xs={12} md={6} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Category
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {categories.find((c) => c.id === selectedPrompt.category_id)?.name || 'Uncategorized'}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Prompt Text
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', mt: 1, minHeight: 120 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedPrompt.prompt_text}
                      </Typography>
                    </Paper>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyPrompt(selectedPrompt.prompt_text)}
                    fullWidth
                  >
                    Copy Prompt Text
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editMode ? 'Edit Prompt' : 'Add New Prompt'}</DialogTitle>
        <form onSubmit={handleSavePrompt}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Left Column: Text Inputs */}
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={3}>
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
                    rows={8}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />
                </Box>
              </Grid>

              {/* Right Column: Image Preview & Upload Button */}
              <Grid item xs={12} md={6}>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: 3,
                    p: 3,
                    height: '100%',
                    minHeight: 250,
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
                          maxHeight: 200,
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        disabled={uploadingImage}
                        size="small"
                      >
                        Change Image
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                      </Button>
                    </Box>
                  ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" align="center">
                        No image uploaded yet. Upload a square or landscape image.
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
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
            <Button type="submit" variant="contained" color="primary" disabled={uploadingImage}>
              Save
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
