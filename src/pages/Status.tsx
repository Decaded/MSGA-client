import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  CircularProgress,
  Button
} from '@mui/material';
import WorkItem from '../components/WorkItem';
import {
  getWorks,
  updateWork,
  deleteWork,
  approveWork
} from '../services/mockBackend';
import { useAuth } from '../contexts/AuthContext';
import type { Work } from '../types/Work';

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
  const { user, isAdmin, isModerator } = useAuth();

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

  const filteredWorks = Array.isArray(works)
    ? works.filter(work => {
        const canView =
          work.approved ||
          (user && (user.username === work.reporter || isModerator()));
        return canView && (filter === 'all' || work.status === filter);
      })
    : [];

  const handleUpdateWork = async (id: Work['id'], updates: Partial<Work>) => {
    try {
      const updatedWork = await updateWork(id, updates);
      setWorks(works.map(w => (w.id === id ? updatedWork : w)));
    } catch (error) {
      console.error('Error updating work:', error);
    }
  };

  // TODO: maybe use it xd
  //   const handleUpdateStatus = async (id: Work['id'], status: Work['status']) => {
  //     try {
  //       const updatedWork = await updateWorkStatus(id, status);
  //       setWorks(works.map(work => (work.id === id ? updatedWork : work)));
  //     } catch (error) {
  //       console.error('Error updating work status:', error);
  //     }
  //   };

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
      setWorks(prevWorks => {
        return prevWorks.map(work =>
          work.id === approvedWork.id ? approvedWork : work
        );
      });
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

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => setFilter(newFilter)}
          aria-label="work status filter"
          sx={{ flexWrap: 'wrap', gap: 1 }}>
          {statusFilters.map(({ value, label }) => (
            <ToggleButton key={value} value={value}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {filteredWorks.length === 0 ? (
        <Typography>No works found matching your criteria.</Typography>
      ) : (
        filteredWorks.map(work => (
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
    </Container>
  );
}

export default Status;
