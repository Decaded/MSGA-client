import { useState, type MouseEventHandler } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Menu,
  MenuItem,
  Link
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { User } from '../types/User';

const roleColors = {
  admin: 'error',
  user: 'success'
} as const;

interface Props {
  user: User;
  onUpdateUser: (userId: User['id'], updates: Partial<User>) => void;
  onDeleteUser?: (userId: User['id']) => void;
}

function UserItem({ user, onUpdateUser, onDeleteUser }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>();
  const open = Boolean(anchorEl);

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (action: 'approve' | 'block') => {
    handleClose();
    let updates: Partial<User> = {};
    switch (action) {
      case 'approve':
        updates = { approved: true };
        break;
      case 'block':
        updates = { approved: false };
        break;
      default:
        return;
    }
    await onUpdateUser(user.id, updates);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div">
              {user.username}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label={user.role}
                color={roleColors[user.role] || 'default'}
                size="small"
              />
              {!user.approved && (
                <Chip
                  label="Pending"
                  color="default"
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
            {user.shProfileURL && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                SH Profile:{' '}
                <Link href={user.shProfileURL} target="_blank" rel="noopener">
                  {user.shProfileURL}
                </Link>
              </Typography>
            )}
          </Box>

          <Button
            aria-controls={open ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}>
            <MoreVertIcon />
          </Button>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}>
            {!user.approved && (
              <MenuItem onClick={() => handleAction('approve')}>
                Approve User
              </MenuItem>
            )}
            {user.approved && (
              <MenuItem onClick={() => handleAction('block')}>
                Block User
              </MenuItem>
            )}
            {onDeleteUser && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  if (
                    confirm(
                      `Are you sure you want to permanently delete ${user.username}?`
                    )
                  ) {
                    onDeleteUser(user.id);
                  }
                }}
                sx={{ color: 'error.main' }}>
                Delete User
              </MenuItem>
            )}
          </Menu>
        </Box>
      </CardContent>
    </Card>
  );
}

export default UserItem;
