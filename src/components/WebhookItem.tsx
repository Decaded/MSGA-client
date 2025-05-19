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

interface Webhook {
  id: string;
  url: string;
  name: string;
  created: string;
  lastUsed: string | null;
}

interface Props {
  webhook: Webhook;
  onDelete: (id: string) => void;
}

function WebhookItem({ webhook, onDelete }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

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
            <Typography variant="body2" color="text.secondary">
              <Link href={webhook.url} target="_blank" rel="noopener">
                {webhook.url}
              </Link>
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
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
            </Box>
          </Box>

          <Button
            aria-controls={open ? 'webhook-menu' : undefined}
            aria-haspopup="true"
            onClick={handleClick}>
            <MoreVertIcon />
          </Button>
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
