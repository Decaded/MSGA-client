import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Collapse,
  Button,
  Box,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Stack,
  type ChipOwnProps
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AdminTools from './AdminTools';
import type { Work } from '../types/Work';

const getStatusColor = (status: Work['status']) => {
  const colors: Partial<Record<Work['status'], ChipOwnProps['color']>> = {
    pending_review: 'warning',
    in_progress: 'info',
    confirmed: 'success',
    taken_down: 'error',
    original: 'secondary'
  };
  return colors[status] || 'default';
};

interface Props {
  work: Work;
  onUpdate?: (workId: Work['id'], updates: Partial<Work>) => Promise<void>;
  onDelete?: (workId: Work['id']) => Promise<void>;
  onApprove?: (workId: Work['id']) => void;
}

function WorkItem({ work, onUpdate, onDelete, onApprove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editedWork, setEditedWork] = useState<Partial<Work>>({});
  const { user, isModerator, isAdmin } = useAuth();

  const canEdit = user && isModerator();
  const canDelete = user && isAdmin();
  const showPublic = work.approved || (user && isModerator());

  if (!showPublic) return null;

  const handleAddProof = () => {
    setEditedWork(prev => ({
      ...prev,
      proofs: [...(prev.proofs || work.proofs || []), '']
    }));
  };

  const handleSubmitUpdate = async () => {
    if (Object.keys(editedWork).length === 0) return;
    await onUpdate?.(work.id, editedWork);
    setEditedWork({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {editedWork.title !== undefined ? (
                <TextField
                  value={editedWork.title}
                  onChange={e =>
                    setEditedWork(prev => ({ ...prev, title: e.target.value }))
                  }
                  variant="standard"
                />
              ) : (
                <Typography variant="h6" component="div">
                  {work.title}
                </Typography>
              )}
              {canEdit && (
                <Button
                  size="small"
                  onClick={() =>
                    setEditedWork(prev =>
                      prev.title !== undefined
                        ? { ...prev, title: undefined }
                        : { ...prev, title: work.title }
                    )
                  }>
                  {editedWork.title !== undefined ? 'Cancel' : 'Edit'}
                </Button>
              )}
              {!work.approved && (
                <Chip
                  label="Pending Approval"
                  color="warning"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            <Chip
              label={work.status.replace('_', ' ')}
              color={getStatusColor(work.status)}
              size="small"
            />
          </Box>

          {work.url && (
            <Typography variant="body2">
              <Link href={work.url} target="_blank" rel="noopener noreferrer">
                {work.url}
              </Link>
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              size="small"
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                />
              }
              onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Less' : 'More'} details
            </Button>
          </Box>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" paragraph>
              Reported by: {work.reporter || 'Anonymous'} on {work.dateReported}
            </Typography>

            {work.reason && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" paragraph sx={{ mb: 0 }}>
                    Reason: {editedWork.reason ?? work.reason}
                  </Typography>
                  {canEdit && (
                    <Button
                      size="small"
                      onClick={() =>
                        setEditedWork(prev =>
                          prev.reason !== undefined
                            ? { ...prev, reason: undefined }
                            : { ...prev, reason: work.reason }
                        )
                      }>
                      {editedWork.reason !== undefined ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
                </Box>
                {editedWork.reason !== undefined && (
                  <TextField
                    value={editedWork.reason}
                    onChange={e =>
                      setEditedWork(prev => ({
                        ...prev,
                        reason: e.target.value
                      }))
                    }
                    fullWidth
                    variant="standard"
                  />
                )}
              </Box>
            )}

            {(editedWork.additionalInfo !== undefined ||
              work.additionalInfo) && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" paragraph sx={{ mb: 0 }}>
                    Additional Info:{' '}
                    {editedWork.additionalInfo ?? work.additionalInfo}
                  </Typography>
                  {canEdit && (
                    <Button
                      size="small"
                      onClick={() =>
                        setEditedWork(prev =>
                          prev.additionalInfo !== undefined
                            ? { ...prev, additionalInfo: undefined }
                            : { ...prev, additionalInfo: work.additionalInfo }
                        )
                      }>
                      {editedWork.additionalInfo !== undefined
                        ? 'Cancel'
                        : 'Edit'}
                    </Button>
                  )}
                </Box>
                {editedWork.additionalInfo !== undefined && (
                  <TextField
                    value={editedWork.additionalInfo}
                    onChange={e =>
                      setEditedWork(prev => ({
                        ...prev,
                        additionalInfo: e.target.value
                      }))
                    }
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              </Box>
            )}

            {work.proofs && work.proofs.length > 0 && (
              <>
                <Typography variant="subtitle2">Proofs:</Typography>
                <List dense>
                  {(editedWork.proofs || work.proofs).map((proof, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LinkIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>
                        {canEdit ? (
                          <TextField
                            value={proof}
                            onChange={e => {
                              const newProofs = [
                                ...(editedWork.proofs || work.proofs)
                              ];
                              newProofs[index] = e.target.value;
                              setEditedWork(prev => ({
                                ...prev,
                                proofs: newProofs
                              }));
                            }}
                            fullWidth
                            variant="standard"
                          />
                        ) : (
                          <Link href={proof} target="_blank" rel="noopener">
                            {proof}
                          </Link>
                        )}
                      </ListItemText>
                      {canEdit && (
                        <Button
                          size="small"
                          onClick={() => {
                            const newProofs = [
                              ...(editedWork.proofs || work.proofs)
                            ];
                            newProofs.splice(index, 1);
                            setEditedWork(prev => ({
                              ...prev,
                              proofs: newProofs
                            }));
                          }}>
                          Delete
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {canEdit && (
              <Box sx={{ mt: 3 }}>
                <Stack spacing={2}>
                  <Button
                    onClick={handleAddProof}
                    variant="outlined"
                    size="small">
                    Add Proof
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSubmitUpdate}
                    disabled={Object.keys(editedWork).length === 0}>
                    Update Report
                  </Button>
                </Stack>
              </Box>
            )}

            {isModerator() && (
              <AdminTools
                work={work}
                onStatusChange={onUpdate}
                canDelete={!!canDelete}
                onDelete={onDelete}
                onApprove={onApprove}
              />
            )}
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WorkItem;
