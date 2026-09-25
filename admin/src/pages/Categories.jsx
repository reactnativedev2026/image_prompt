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
  Add as AddIcon
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
      const response = await api.get('/api/categories');
      const cats = response.data || [];
      
      // Try to enrich with prompt counts if stats API is available
      try {
        const statsRes = await api.get('/api/admin/stats');
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
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Header & Main Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="h5" fontWeight="bold">
            Manage Categories
          </Typography>
          <Tooltip title="Refresh categories">
            <IconButton size="small" onClick={fetchCategories} color="primary">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderLeft: '4px solid #9c27b0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Box sx={{ bgcolor: 'rgba(156, 39, 176, 0.1)', p: 1, borderRadius: 2, display: 'flex' }}>
              <CategoryIcon sx={{ color: '#9c27b0' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {categories.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Categories
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderLeft: '4px solid #1976d2', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Box sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', p: 1, borderRadius: 2, display: 'flex' }}>
              <CollectionsIcon sx={{ color: '#1976d2' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {totalPromptsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Prompts Linked
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, borderRadius: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderLeft: '4px solid #4caf50', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <Box sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', p: 1, borderRadius: 2, display: 'flex' }}>
              <CollectionsIcon sx={{ color: '#4caf50' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {categories.length > 0 ? (totalPromptsCount / categories.length).toFixed(1) : 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Prompts / Category
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Horizontal Categories with Image Counts Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          background: '#ffffff',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <CategoryIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              Category Image Counts
            </Typography>
            <Chip
              label={`${categories.length} Categories • ${totalPromptsCount} Total Images`}
              size="small"
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: 'rgba(25, 118, 210, 0.08)', color: '#1976d2' }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            pt: 0.5,
            '::-webkit-scrollbar': {
              height: 6,
            },
            '::-webkit-scrollbar-track': {
              background: '#f1f5f9',
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
                color={isMatch ? 'primary' : 'default'}
                variant={isMatch ? 'filled' : 'outlined'}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={isMatch ? 'bold' : 'medium'}>
                      {cat.name}
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: isMatch
                          ? 'rgba(255, 255, 255, 0.28)'
                          : (cat.prompt_count || 0) > 0
                          ? 'rgba(25, 118, 210, 0.1)'
                          : 'rgba(0, 0, 0, 0.06)',
                        color: isMatch
                          ? '#fff'
                          : (cat.prompt_count || 0) > 0
                          ? '#1976d2'
                          : 'text.secondary',
                        px: 1,
                        py: 0.2,
                        borderRadius: 10,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {cat.prompt_count || 0} {(cat.prompt_count || 0) === 1 ? 'image' : 'images'}
                    </Box>
                  </Box>
                }
                sx={{
                  py: 2.2,
                  px: 0.5,
                  borderRadius: 3,
                  borderColor: isMatch ? 'primary.main' : '#e2e8f0',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Add New Category Box */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Add New Category
        </Typography>
        <Box component="form" onSubmit={handleAddCategory} sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            label="Category Name"
            variant="outlined"
            size="small"
            fullWidth
            placeholder="e.g. Cyberpunk, Anime, Cinematic..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />} sx={{ px: 3 }}>
            Add
          </Button>
        </Box>
      </Paper>

      {/* Search & Items Per Page Controls */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
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
              placeholder="Search by category name..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
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
              label="Items per Page"
              variant="outlined"
              size="small"
              fullWidth
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <MenuItem value={5}>5 items / page</MenuItem>
              <MenuItem value={10}>10 items / page</MenuItem>
              <MenuItem value={25}>25 items / page</MenuItem>
              <MenuItem value={50}>50 items / page</MenuItem>
              <MenuItem value={100}>All (100) / page</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Category Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell width="80"><strong>ID</strong></TableCell>
                  <TableCell><strong>Category Name</strong></TableCell>
                  <TableCell align="center"><strong>Linked Prompts</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {search ? 'No categories found matching your search.' : 'No categories found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedCategories.map((cat) => (
                    <TableRow key={cat.id} hover>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>#{cat.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {cat.name}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${cat.prompt_count || 0} prompts`}
                          size="small"
                          color={cat.prompt_count > 0 ? "primary" : "default"}
                          variant={cat.prompt_count > 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Category">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(cat)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(cat.id)}
                          >
                            <DeleteIcon />
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
          >
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong>–<strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> categories
            </Typography>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
              showFirstButton
              showLastButton
            />

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">Per page:</Typography>
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
          <DialogActions sx={{ px: 3, pb: 2 }}>
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category? Any prompts belonging to this category might be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCategory} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
