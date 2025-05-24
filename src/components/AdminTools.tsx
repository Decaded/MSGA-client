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
import type { Profile } from '../types/Profile';

type ItemType = 'work' | 'profile';
type Item = Work | Profile;

interface Props {
  item: Item;
  type: ItemType;
  onStatusChange?: (
    id: number,
    status: Work['status'] | Profile['status']
  ) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  canDelete: boolean;
}

function AdminTools({
  item,
  type,
  onStatusChange,
  onDelete,
  canDelete
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const statusOptions =
    type === 'work'
      ? [
          { value: 'in_progress', label: 'In Progress' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'taken_down', label: 'Taken Down' },
          { value: 'original', label: 'Original (Not translation)' }
        ]
      : [
          { value: 'in_progress', label: 'In Progress' },
          { value: 'confirmed_violator', label: 'Confirmed violator' },
          { value: 'false_positive', label: 'Not confirmed (Original author)' }
        ];

  const handleStatusChange = async () => {
    if (selectedStatus) {
      setIsUpdating(true);
      try {
        await onStatusChange?.(
          item.id,
          selectedStatus as Work['status'] | Profile['status']
        );
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
      await onDelete?.(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {type === 'work' ? 'Work' : 'Profile'} Management:
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
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
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
                  Are you sure you want to permanently delete this {type} entry?
                  This action cannot be undone.
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
