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
  onStatusUpdate?: (
    workId: Work['id'],
    status: Work['status']
  ) => Promise<void>;
  onDelete?: (workId: Work['id']) => Promise<void>;
  onApprove?: (workId: Work['id']) => void;
}

function WorkItem({
  work,
  onUpdate,
  onStatusUpdate,
  onDelete,
  onApprove
}: Props) {
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

  const renderEditableField = (
    field: keyof Work,
    label: string,
    value: string,
    multiline = false
  ) => {
    const isEditing = editedWork[field] !== undefined;
    const currentValue = editedWork[field] ?? value;

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {label}:
          </Typography>
          {canEdit && expanded && (
            <Button
              size="small"
              onClick={() => {
                if (isEditing) {
                  const newState = { ...editedWork };
                  delete newState[field];
                  setEditedWork(newState);
                } else {
                  setEditedWork(prev => ({
                    ...prev,
                    [field]: currentValue
                  }));
                }
              }}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </Box>

        {isEditing ? (
          <TextField
            value={currentValue}
            onChange={e =>
              setEditedWork(prev => ({
                ...prev,
                [field]: e.target.value
              }))
            }
            fullWidth
            multiline
            minRows={multiline ? 3 : 1}
            maxRows={multiline ? 6 : 1}
            variant="outlined"
            sx={{
              '& .MuiInputBase-root': {
                whiteSpace: 'pre-wrap',
                alignItems: 'flex-start'
              }
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-line',
              p: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme => theme.palette.divider,
              backgroundColor: theme => theme.palette.grey[800],
              display: 'block',
              width: '100%',
              minHeight: multiline ? '80px' : 'auto',
              boxSizing: 'border-box',
              verticalAlign: 'top'
            }}>
            {currentValue ||
              (field === 'additionalInfo' && <em>No notes added</em>)}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent
          sx={{
            '&:last-child': { pb: 2 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
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
              {canEdit && expanded && (
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
            <Typography variant="body2" sx={{ mt: 1 }}>
              <Link href={work.url} target="_blank" rel="noopener noreferrer">
                {work.url}
              </Link>
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1
            }}>
            <Box>
              {work.status === 'pending_review' && user && onApprove && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onApprove(work.id)}
                  size="small"
                  sx={{ mr: 1 }}>
                  Approve
                </Button>
              )}
            </Box>

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

            {work.reason &&
              renderEditableField('reason', 'Reason', work.reason, true)}

            {(work.additionalInfo || editedWork.additionalInfo !== undefined) &&
              renderEditableField(
                'additionalInfo',
                'Additional Info',
                work.additionalInfo || '',
                true
              )}

            {!work.additionalInfo && !editedWork.additionalInfo && canEdit && (
              <Button
                size="small"
                onClick={() =>
                  setEditedWork(prev => ({
                    ...prev,
                    additionalInfo: ''
                  }))
                }
                sx={{ mb: 2 }}>
                Add Notes
              </Button>
            )}

            {work.proofs && work.proofs.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Proofs:
                </Typography>
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

                  {Object.keys(editedWork).length > 0 && (
                    <Button
                      variant="contained"
                      onClick={handleSubmitUpdate}
                      color="primary">
                      Update Report
                    </Button>
                  )}
                </Stack>
              </Box>
            )}

            {isModerator() && (
              <AdminTools
                item={work}
                type="work"
                onStatusChange={
                  onStatusUpdate as (
                    id: number,
                    status: string
                  ) => Promise<void>
                }
                canDelete={!!canDelete}
                onDelete={onDelete}
              />
            )}
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WorkItem;
