import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  CircularProgress,
  Button,
  TextField
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import WorkItem from '../components/WorkItem';
import ProfileItem from '../components/ProfileItem';
import {
  getWorks,
  updateWork,
  deleteWork,
  approveWork,
  updateWorkStatus,
  getProfiles,
  updateProfile,
  deleteProfile,
  approveProfile,
  updateProfileStatus
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Work } from '../types/Work';
import type { Profile } from '../types/Profile';

type ReportType = 'work' | 'profile';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'confirmed_violator', label: 'Confirmed violator' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'taken_down', label: 'Taken Down' },
  { value: 'original', label: 'Original' },
  { value: 'false_positive', label: 'Original author' }
];

function Status() {
  const [reportType, setReportType] = useState<ReportType>('work');
  const [works, setWorks] = useState<Work[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
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

  const handleUpdateWorkStatus = async (
    id: Work['id'],
    status: Work['status']
  ) => {
    setWorks(prevWorks =>
      prevWorks.map(work =>
        work.id === id ? { ...work, status, approved: true } : work
      )
    );
    try {
      await updateWorkStatus(id, status);
    } catch (error) {
      console.error('Error updating work status:', error);
      // Rollback on error
      setWorks(prevWorks =>
        prevWorks.map(work =>
          work.id === id ? { ...work, status: work.status } : work
        )
      );
    }
  };

  const handleUpdateProfileStatus = async (
    id: Profile['id'],
    status: Profile['status']
  ) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id ? { ...profile, status, approved: true } : profile
      )
    );
    try {
      await updateProfileStatus(id, status);
    } catch (error) {
      console.error('Error updating profile status:', error);
      // Rollback on error
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile.id === id ? { ...profile, status: profile.status } : profile
        )
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [worksData, profilesData] = await Promise.all([
          getWorks(),
          getProfiles()
        ]);
        setWorks(worksData);
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when filter, search term, or report type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, rawSearch, reportType]);

  const filteredItems = useMemo(() => {
    const items = reportType === 'work' ? works : profiles;
    if (!Array.isArray(items)) return [];

    const filtered = items.filter(item => {
      const canView =
        item.approved ||
        (user && (user.username === item.reporter || isModerator()));

      const matchesFilter = filter === 'all' || item.status === filter;
      const matchesSearch =
        item.title.toLowerCase().includes(rawSearch.toLowerCase()) ||
        item.url?.toLowerCase().includes(rawSearch.toLowerCase());

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
  }, [
    works,
    profiles,
    user,
    isModerator,
    filter,
    rawSearch,
    sortBy,
    sortOrder,
    reportType
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage)
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleUpdateWork = async (id: Work['id'], updates: Partial<Work>) => {
    try {
      const updatedWork = await updateWork(id, updates);
      setWorks(works.map(w => (w.id === id ? updatedWork : w)));
    } catch (error) {
      console.error('Error updating work:', error);
    }
  };

  const handleUpdateProfile = async (
    id: Profile['id'],
    updates: Partial<Profile>
  ) => {
    try {
      const updatedProfile = await updateProfile(id, updates);
      setProfiles(profiles.map(p => (p.id === id ? updatedProfile : p)));
    } catch (error) {
      console.error('Error updating profile:', error);
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

  const handleDeleteProfile = async (id: Profile['id']) => {
    try {
      await deleteProfile(id);
      setProfiles(profiles.filter(profile => profile.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
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

  const handleApproveProfile = async (id: Profile['id']) => {
    try {
      const approvedProfile = await approveProfile(id);
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile.id === approvedProfile.id ? approvedProfile : profile
        )
      );
    } catch (error) {
      console.error('Error approving profile:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const PaginationControls = () => {
    const [pageInput, setPageInput] = useState(currentPage.toString());

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
          my: 2
        }}>
        <Button
          variant="outlined"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
          sx={{ mx: 0.5 }}>
          First
        </Button>
        <Button
          variant="outlined"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          sx={{ mx: 0.5 }}>
          Prev
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
          <TextField
            value={pageInput}
            onChange={e => {
              const value = e.target.value;
              setPageInput(value);
              // Update currentPage on valid input
              if (/^\d+$/.test(value)) {
                const numValue = parseInt(value);
                if (numValue >= 1 && numValue <= totalPages) {
                  setCurrentPage(numValue);
                }
              }
            }}
            type="number"
            inputProps={{
              min: 1,
              max: totalPages,
              style: { textAlign: 'center', width: 60 }
            }}
            size="small"
            sx={{ mx: 1 }}
          />
          <Typography variant="body1" sx={{ alignSelf: 'center', mx: 1 }}>
            of {totalPages}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          sx={{ mx: 0.5 }}>
          Next
        </Button>
        <Button
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
          sx={{ mx: 0.5 }}>
          Last
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Report Status
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={reportType}
          exclusive
          onChange={(_, newType) => newType && setReportType(newType)}
          aria-label="report type"
          sx={{ mb: 2 }}>
          <ToggleButton value="work">Works</ToggleButton>
          <ToggleButton value="profile">Profiles</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label={`Search ${
            reportType === 'work' ? 'works' : 'profiles'
          } by title or URL`}
          value={searchInput}
          onChange={handleSearchChange}
          fullWidth
          size="small"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => {
            if (newFilter !== null) setFilter(newFilter);
          }}
          aria-label="status filter"
          sx={{ flexWrap: 'wrap', gap: 1 }}>
          {statusFilters.map(({ value, label }) => {
            if (value === 'pending_review' && !user) return null;
            // Filter out profile-specific statuses when viewing works and vice versa
            if (
              reportType === 'work' &&
              ['confirmed_violator', 'false_positive'].includes(value)
            )
              return null;
            if (
              reportType === 'profile' &&
              [
                'approved',
                'confirmed',
                'rejected',
                'taken_down',
                'original'
              ].includes(value)
            )
              return null;
            return (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          slotProps={{
            select: {
              native: true
            }
          }}
          size="small">
          <option value="id">ID</option>
          <option value="title">Title</option>
          <option value="dateReported">Date Reported</option>
        </TextField>

        <Button
          variant="outlined"
          onClick={() =>
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
          }>
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </Box>

      <PaginationControls />

      {paginatedItems.length === 0 ? (
        <Typography>
          No {reportType === 'work' ? 'works' : 'profiles'} found matching your
          criteria.
        </Typography>
      ) : (
        paginatedItems.map(item => (
          <Box
            key={`${reportType}-${item.id}-${item.dateReported}`}
            sx={{ mb: 2 }}>
            {reportType === 'work' ? (
              <WorkItem
                work={item as Work}
                onUpdate={user ? handleUpdateWork : undefined}
                onStatusUpdate={user ? handleUpdateWorkStatus : undefined}
                onDelete={isAdmin() ? handleDeleteWork : undefined}
                onApprove={user ? handleApproveWork : undefined}
              />
            ) : (
              <ProfileItem
                profile={item as Profile}
                onUpdate={user ? handleUpdateProfile : undefined}
                onStatusUpdate={user ? handleUpdateProfileStatus : undefined}
                onDelete={isAdmin() ? handleDeleteProfile : undefined}
                onApprove={user ? handleApproveProfile : undefined}
              />
            )}
          </Box>
        ))
      )}

      <PaginationControls />
    </Container>
  );
}

export default Status;
