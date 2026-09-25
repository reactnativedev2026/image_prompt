import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Grid,
  Chip,
  MenuItem,
  Pagination,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Collections as CollectionsIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';
import api, { getErrorMessage } from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation dialog states
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);

  // Edit category dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/categories', { params: { include_all: false } });
      const cats = response.data || [];
      
      // Enrich with prompt counts if stats API is available
      try {
        const statsRes = await api.get('/api/admin/stats', { params: { include_all: false } });
        const statsMap = {};
        (statsRes.data?.category_stats || []).forEach((s) => {
          statsMap[s.id] = s.prompt_count;
        });
        setCategories(
          cats.map((c) => ({
            ...c,
            prompt_count: c.prompt_count !== undefined && c.prompt_count !== 0 ? c.prompt_count : (statsMap[c.id] || 0)
          }))
        );
      } catch (statsErr) {
        setCategories(
          cats.map((c) => ({
            ...c,
            prompt_count: c.prompt_count || 0
          }))
        );
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch categories.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/api/admin/categories', { name: newCategoryName.trim() });
      setCategories([...categories, { ...response.data, prompt_count: 0 }]);
      setNewCategoryName('');
      setSuccess('Category added successfully!');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create category.'));
    }
  };

  const handleEditClick = (cat) => {
    setEditingCat(cat);
    setEditCategoryName(cat.name);
    setError('');
    setSuccess('');
    setOpenEditDialog(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editingCat) return;
    setIsSubmittingEdit(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/api/admin/categories/${editingCat.id}`, {
        name: editCategoryName.trim()
      });
      setCategories(
        categories.map((c) =>
          c.id === editingCat.id ? { ...c, name: response.data.name } : c
        )
      );
      setOpenEditDialog(false);
      setSuccess('Category updated successfully!');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update category.'));
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedCatId(id);
    setOpenConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    setOpenConfirm(false);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/admin/categories/${selectedCatId}`);
      setCategories(categories.filter((cat) => cat.id !== selectedCatId));
      setSuccess('Category deleted successfully!');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete category.'));
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculation
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const displayedCategories = filteredCategories.slice(startIndex, startIndex + rowsPerPage);

  // Summary counts
  const totalPromptsCount = categories.reduce((sum, c) => sum + (c.prompt_count || 0), 0);

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', pb: 6 }}>
      {/* Page Header */}
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
              Categories Management
            </Typography>
            <Tooltip title="Refresh categories">
              <IconButton
                size="small"
                onClick={fetchCategories}
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
            Create, rename, and organize image prompt categories
          </Typography>
        </Box>
      </Box>

      {/* Summary Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
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
                  Total Categories
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6', mt: 0.5, lineHeight: 1.2 }}>
                  {categories.length}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', p: 1.2, borderRadius: '12px', display: 'flex' }}>
                <CategoryIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
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
                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.08)',
                borderColor: 'rgba(79, 70, 229, 0.3)'
              }
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
                  Total Linked Prompts
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#4f46e5', mt: 0.5, lineHeight: 1.2 }}>
                  {totalPromptsCount}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', p: 1.2, borderRadius: '12px', display: 'flex' }}>
                <CollectionsIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
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
                  Avg Prompts / Category
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5, lineHeight: 1.2 }}>
                  {categories.length > 0 ? (totalPromptsCount / categories.length).toFixed(1) : 0}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', p: 1.2, borderRadius: '12px', display: 'flex' }}>
                <FolderIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Horizontal Category Badges Bar with Name & Count in Row */}
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <CategoryIcon color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0f172a', fontSize: '0.95rem' }}>
              Categories & Image Counts
            </Typography>
            <Chip
              label={`${categories.length} Categories • ${totalPromptsCount} Images`}
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
        </Box>

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
          {categories.map((cat) => {
            const isMatch = search && cat.name.toLowerCase().includes(search.toLowerCase());
            return (
              <Chip
                key={cat.id}
                clickable
                onClick={() => {
                  if (search === cat.name) {
                    setSearch('');
                  } else {
                    setSearch(cat.name);
                  }
                  setPage(1);
                }}
                label={
                  <Box sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" sx={{ fontWeight: isMatch ? 700 : 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {cat.name}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isMatch
                          ? 'rgba(255, 255, 255, 0.3)'
                          : (cat.prompt_count || 0) > 0
                          ? 'rgba(79, 70, 229, 0.08)'
                          : '#f1f5f9',
                        color: isMatch
                          ? '#ffffff'
                          : (cat.prompt_count || 0) > 0
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
                      {cat.prompt_count || 0}
                    </Box>
                  </Box>
                }
                sx={{
                  py: 2.2,
                  px: 1,
                  borderRadius: '12px',
                  border: '1.5px solid',
                  borderColor: isMatch ? '#4f46e5' : '#e2e8f0',
                  bgcolor: isMatch ? '#4f46e5' : '#ffffff',
                  color: isMatch ? '#ffffff' : '#1e293b',
                  flexShrink: 0,
                  boxShadow: isMatch ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: isMatch ? '#4338ca' : '#f8fafc',
                    borderColor: isMatch ? '#4338ca' : '#cbd5e1',
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

      {/* Add New Category Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          bgcolor: '#ffffff'
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0f172a' }}>
          Create New Category
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add a new category name to categorize image generation prompts
        </Typography>
        <Box component="form" onSubmit={handleAddCategory} sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label="Category Name"
            variant="outlined"
            size="small"
            fullWidth
            placeholder="e.g. Cyberpunk, Anime, Cinematic, 3D Render..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ px: 3, flexShrink: 0, borderRadius: '10px' }}
          >
            Add Category
          </Button>
        </Box>
      </Paper>

      {/* Search & Items Per Page Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          bgcolor: '#ffffff'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              label="Search Categories"
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search category name..."
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
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Items per page"
              variant="outlined"
              size="small"
              fullWidth
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <MenuItem value={5}>5 / page</MenuItem>
              <MenuItem value={10}>10 / page</MenuItem>
              <MenuItem value={25}>25 / page</MenuItem>
              <MenuItem value={50}>50 / page</MenuItem>
              <MenuItem value={100}>100 / page</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Category Table with Name & Count in Row */}
      {loading ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" my={8} gap={2}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary">Loading categories...</Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell width="90"><strong>ID</strong></TableCell>
                  <TableCell><strong>Category Name & Linked Prompts</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {search ? 'No categories found matching your search.' : 'No categories found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedCategories.map((cat) => (
                    <TableRow key={cat.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>#{cat.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {cat.name}
                          </Typography>
                          <Chip
                            label={`${cat.prompt_count || 0} images`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: (cat.prompt_count || 0) > 0 ? 'rgba(79, 70, 229, 0.08)' : '#f1f5f9',
                              color: (cat.prompt_count || 0) > 0 ? '#4f46e5' : '#94a3b8',
                              borderRadius: '6px',
                              height: 22,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Category">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(cat)}
                            sx={{ mr: 1, '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.1)' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(cat.id)}
                            sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer with Summary & Pagination */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            borderTop="1px solid #f1f5f9"
            flexWrap="wrap"
            gap={2}
            bgcolor="#fafafa"
          >
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong>–<strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> categories
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
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                sx={{ width: 90 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </TextField>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Edit Category Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => !isSubmittingEdit && setOpenEditDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box component="form" onSubmit={handleSaveCategory}>
          <DialogTitle fontWeight="bold">Edit Category</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Update the name for category <strong>#{editingCat?.id}</strong>.
            </DialogContentText>
            <TextField
              autoFocus
              label="Category Name"
              variant="outlined"
              fullWidth
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              disabled={isSubmittingEdit}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setOpenEditDialog(false)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmittingEdit || !editCategoryName.trim()}
              startIcon={isSubmittingEdit ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle fontWeight="bold">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category? Any prompts belonging to this category might be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCategory} color="error" variant="contained" autoFocus>
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
