import { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import type { Work } from '../types/Work';

interface Props {
  work: Work;
  onStatusChange?: (
    workId: Work['id'],
    status: Work['status']
  ) => Promise<void>;
  onDelete?: (workId: Work['id']) => Promise<void>;
  canDelete: boolean;
}

function AdminTools({ work, onStatusChange, onDelete, canDelete }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<Work['status'] | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleStatusChange = async () => {
    if (selectedStatus) {
      setIsUpdating(true);
      try {
        await onStatusChange?.(work.id, selectedStatus);
        setSelectedStatus('');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setIsUpdating(true);
    try {
      await onDelete?.(work.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Work Management:
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            label="Status">
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="taken_down">Taken Down</MenuItem>
            <MenuItem value="original">Original (False Positive)</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleStatusChange}
          disabled={!selectedStatus || isUpdating}
          size="small">
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>

        {canDelete && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isUpdating}
              size="small">
              Delete Entry
            </Button>

            <Dialog
              open={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to permanently delete this entry? This
                  action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  color="error"
                  variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Box>
  );
}

export default AdminTools;
