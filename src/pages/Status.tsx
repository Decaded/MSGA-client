import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import WorkItem from '../components/WorkItem';
import { getWorks, updateWork, deleteWork, approveWork } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Work } from '../types/Work';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'taken_down', label: 'Taken Down' },
  { value: 'original', label: 'Original' }
];

function Status() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'dateReported'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { user, isAdmin, isModerator } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSearch = searchParams.get('search') || '';
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(rawSearch);
  const itemsPerPage = 15;

  // Sync search input with actual search term
  useEffect(() => {
    setSearchInput(rawSearch);
  }, [rawSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (newValue) {
          next.set('search', newValue);
        } else {
          next.delete('search');
        }
        return next;
      });
    }, 300);
  };

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const data = await getWorks();
        setWorks(data);
      } catch (error) {
        console.error('Error fetching works:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  // Reset page when filter or search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, rawSearch]);

  const filteredWorks = useMemo(() => {
    if (!Array.isArray(works)) return [];

    const filtered = works.filter(work => {
      const canView =
        work.approved ||
        (user && (user.username === work.reporter || isModerator()));

      const matchesFilter = filter === 'all' || work.status === filter;
      const matchesSearch =
        work.title.toLowerCase().includes(rawSearch.toLowerCase()) ||
        work.url?.toLowerCase().includes(rawSearch.toLowerCase());

      return canView && matchesFilter && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      let compareVal = 0;

      if (sortBy === 'title') {
        compareVal = a.title.localeCompare(b.title);
      } else if (sortBy === 'dateReported') {
        const aTime = a.dateReported ? new Date(a.dateReported).getTime() : 0;
        const bTime = b.dateReported ? new Date(b.dateReported).getTime() : 0;
        compareVal = aTime - bTime;
      } else {
        compareVal = a.id - b.id;
      }

      return sortOrder === 'asc' ? compareVal : -compareVal;
    });

    return sorted;
  }, [works, user, isModerator, filter, rawSearch, sortBy, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorks.length / itemsPerPage)
  );

  const paginatedWorks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWorks.slice(start, start + itemsPerPage);
  }, [filteredWorks, currentPage]);

  const handleUpdateWork = async (id: Work['id'], updates: Partial<Work>) => {
    try {
      const updatedWork = await updateWork(id, updates);
      setWorks(works.map(w => (w.id === id ? updatedWork : w)));
    } catch (error) {
      console.error('Error updating work:', error);
    }
  };

  const handleDeleteWork = async (id: Work['id']) => {
    try {
      await deleteWork(id);
      setWorks(works.filter(work => work.id !== id));
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  const handleApproveWork = async (id: Work['id']) => {
    try {
      const approvedWork = await approveWork(id);
      setWorks(prevWorks =>
        prevWorks.map(work =>
          work.id === approvedWork.id ? approvedWork : work
        )
      );
    } catch (error) {
      console.error('Error approving work:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Report Status
      </Typography>

      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3 }}>
        <TextField
          label="Search by title or URL"
          value={searchInput}
          onChange={handleSearchChange}
          fullWidth
          size="small"
        />

        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          size="small"
          sx={{ minWidth: 140 }}>
          <MenuItem value="id">ID</MenuItem>
          <MenuItem value="title">Title</MenuItem>
          <MenuItem value="dateReported">Date Reported</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          onClick={() =>
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
          }>
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </Stack>

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => {
            if (newFilter !== null) setFilter(newFilter);
          }}
          aria-label="work status filter">
          {statusFilters.map(({ value, label }) => {
            if (value === 'pending_review' && !user) return null;
            return (
              <ToggleButton key={value} value={value} size="small">
                {label}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          my: 2
        }}>
        <IconButton
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 1}>
          <ArrowBack />
        </IconButton>
        <Typography variant="body2">
          Page {currentPage} of {totalPages}
        </Typography>
        <IconButton
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage === totalPages}>
          <ArrowForward />
        </IconButton>
      </Box>

      {paginatedWorks.length === 0 ? (
        <Typography>No works found matching your criteria.</Typography>
      ) : (
        paginatedWorks.map(work => (
          <Box key={`work-${work.id}-${work.dateReported}`} sx={{ mb: 2 }}>
            <WorkItem
              work={work}
              onUpdate={user ? handleUpdateWork : undefined}
              onDelete={isAdmin() ? handleDeleteWork : undefined}
              onApprove={user ? handleApproveWork : undefined}
            />
            {work.status === 'pending_review' && (user || isAdmin()) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleApproveWork(work.id)}
                sx={{ mt: 1 }}>
                Approve
              </Button>
            )}
          </Box>
        ))
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 4
        }}>
        <Typography variant="caption" color="text.secondary">
          Showing {paginatedWorks.length} of {filteredWorks.length} results
        </Typography>
      </Box>
    </Container>
  );
}

export default Status;
