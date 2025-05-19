import { useState, type MouseEventHandler } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Link,
  Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import type { Webhook } from '../types/Webhook';

interface Props {
  webhook: Webhook;
  onDelete: (id: string) => void;
}

function WebhookItem({ webhook, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const [showURL, setShowURL] = useState(false);

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div">
              {webhook.name}
            </Typography>
            {showURL ? (
              <Typography variant="body2" color="text.secondary">
                <Link href={webhook.url} target="_blank" rel="noopener noreferrer">
                  {webhook.url}
                </Link>
              </Typography>
            ) : (
              <Button onClick={() => setShowURL(true)} size="small">
                Show URL
              </Button>
            )}
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Created: ${new Date(
                  webhook.created
                ).toLocaleDateString()}`}
                size="small"
                variant="outlined"
              />
              {webhook.lastUsed && (
                <Chip
                  label={`Last used: ${new Date(
                    webhook.lastUsed
                  ).toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                />
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}>
                Added by: {webhook.createdBy}
              </Typography>
            </Box>
          </Box>

          <IconButton
            aria-controls={open ? 'webhook-menu' : undefined}
            aria-haspopup="true"
            onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="webhook-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleClose();
                if (confirm(`Delete ${webhook.name}?`)) {
                  onDelete(webhook.id);
                }
              }}
              sx={{ color: 'error.main' }}>
              Delete Webhook
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>
    </Card>
  );
}

export default WebhookItem;
