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
  IconButton,
  CircularProgress,
  type ChipOwnProps
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
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

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
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
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isModerator, isAdmin } = useAuth();

  const canEdit = user && isModerator();
  const canDelete = user && isAdmin();
  const showPublic = work.approved || (user && isModerator());

  const handleAddProof = () => {
    setEditedWork(prev => ({
      ...prev,
      proofs: [...(prev.proofs || work.proofs || []), '']
    }));
  };

  const handleSubmitUpdate = async () => {
    if (Object.keys(editedWork).length === 0) return;
    setIsUpdating(true);
    try {
      await onUpdate?.(work.id, editedWork);
      setEditedWork({});
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderEditableField = (
    field: keyof Work,
    label: string,
    value: string,
    multiline = false
  ) => {
    const isEditing = editedWork[field] !== undefined;
    const currentValue = editedWork[field] ?? value;
    const isUrlField = field === 'url';

    return (
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: isEditing ? 'primary.main' : 'divider',
          backgroundColor: isEditing ? 'rgba(25, 118, 210, 0.08)' : 'grey.900',
          transition: 'all 0.2s ease'
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {label}:
          </Typography>
          {canEdit && (
            <IconButton
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
              {isEditing ? (
                <ClearIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>

        {isEditing ? (
          <TextField
            autoFocus
            value={currentValue}
            onChange={e =>
              setEditedWork(prev => ({
                ...prev,
                [field]: e.target.value
              }))
            }
            error={
              isUrlField &&
              typeof currentValue === 'string' &&
              !isValidUrl(currentValue)
            }
            helperText={
              isUrlField &&
              typeof currentValue === 'string' &&
              !isValidUrl(currentValue) &&
              'Invalid URL format'
            }
            fullWidth
            multiline={multiline}
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

  if (!showPublic) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <Card sx={{ mb: 2, position: 'relative' }}>
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
                  fullWidth
                  autoFocus
                />
              ) : (
                <Typography variant="h6" component="div">
                  {work.title}
                </Typography>
              )}
              {canEdit && (
                <IconButton
                  size="small"
                  onClick={() =>
                    setEditedWork(prev =>
                      prev.title !== undefined
                        ? { ...prev, title: undefined }
                        : { ...prev, title: work.title }
                    )
                  }>
                  {editedWork.title !== undefined ? (
                    <ClearIcon fontSize="small" />
                  ) : (
                    <EditIcon fontSize="small" />
                  )}
                </IconButton>
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
            <Box sx={{ mt: 1 }}>
              {renderEditableField('url', 'URL', work.url)}
            </Box>
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
              <Box
                sx={{
                  p: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() =>
                  setEditedWork(prev => ({ ...prev, additionalInfo: '' }))
                }>
                <Typography variant="body2" color="text.secondary">
                  + Click to add notes
                </Typography>
              </Box>
            )}

            {work.proofs && work.proofs.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', mt: 2 }}>
                  Proofs:
                </Typography>
                <List dense>
                  {(editedWork.proofs || work.proofs).map((proof, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        backgroundColor: theme => theme.palette.grey[900],
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: theme => theme.palette.grey[800]
                        }
                      }}>
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
                            error={!isValidUrl(proof)}
                            helperText={
                              !isValidUrl(proof) && 'Invalid URL format'
                            }
                          />
                        ) : (
                          <Link href={proof} target="_blank" rel="noopener">
                            {proof}
                          </Link>
                        )}
                      </ListItemText>
                      {canEdit && (
                        <IconButton
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
                          <ClearIcon fontSize="small" />
                        </IconButton>
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
                    size="small"
                    startIcon={<CheckIcon />}>
                    Add Proof
                  </Button>

                  {Object.keys(editedWork).length > 0 && (
                    <Button
                      variant="contained"
                      onClick={handleSubmitUpdate}
                      color="primary"
                      disabled={isUpdating}
                      startIcon={
                        isUpdating ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CheckIcon />
                        )
                      }
                      sx={{
                        position: 'sticky',
                        bottom: 16,
                        alignSelf: 'flex-end',
                        boxShadow: 3
                      }}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
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
