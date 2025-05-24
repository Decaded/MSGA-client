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
import type { Profile } from '../types/Profile';

const getStatusColor = (status: Profile['status']) => {
  const colors: Partial<Record<Profile['status'], ChipOwnProps['color']>> = {
    pending_review: 'warning',
    in_progress: 'info',
    confirmed_violator: 'error',
    false_positive: 'success'
  };
  return colors[status] || 'default';
};

interface Props {
  profile: Profile;
  onUpdate?: (
    profileId: Profile['id'],
    updates: Partial<Profile>
  ) => Promise<void>;
  onStatusUpdate?: (
    profileId: Profile['id'],
    status: Profile['status']
  ) => Promise<void>;
  onDelete?: (profileId: Profile['id']) => Promise<void>;
  onApprove?: (profileId: Profile['id']) => void;
}

function ProfileItem({
  profile,
  onUpdate,
  onStatusUpdate,
  onDelete,
  onApprove
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const { user, isModerator, isAdmin } = useAuth();

  const canEdit = user && isModerator();
  const canDelete = user && isAdmin();
  const showPublic = profile.approved || (user && isModerator());

  if (!showPublic) return null;

  const handleAddProof = () => {
    setEditedProfile(prev => ({
      ...prev,
      proofs: [...(prev.proofs || profile.proofs || []), '']
    }));
  };

  const handleSubmitUpdate = async () => {
    if (Object.keys(editedProfile).length === 0) return;
    await onUpdate?.(profile.id, editedProfile);
    setEditedProfile({});
  };

  const renderEditableField = (
    field: keyof Profile,
    label: string,
    value: string,
    multiline = false
  ) => {
    const isEditing = editedProfile[field] !== undefined;
    const currentValue = editedProfile[field] ?? value;

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
                  const newState = { ...editedProfile };
                  delete newState[field];
                  setEditedProfile(newState);
                } else {
                  setEditedProfile(prev => ({
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
              setEditedProfile(prev => ({
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
              {editedProfile.title !== undefined ? (
                <TextField
                  value={editedProfile.title}
                  onChange={e =>
                    setEditedProfile(prev => ({
                      ...prev,
                      title: e.target.value
                    }))
                  }
                  variant="standard"
                />
              ) : (
                <Typography variant="h6" component="div">
                  {profile.title}
                </Typography>
              )}
              {canEdit && expanded && (
                <Button
                  size="small"
                  onClick={() =>
                    setEditedProfile(prev =>
                      prev.title !== undefined
                        ? { ...prev, title: undefined }
                        : { ...prev, title: profile.title }
                    )
                  }>
                  {editedProfile.title !== undefined ? 'Cancel' : 'Edit'}
                </Button>
              )}
              {!profile.approved && (
                <Chip
                  label="Pending Approval"
                  color="warning"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            <Chip
              label={profile.status.replace('_', ' ')}
              color={getStatusColor(profile.status)}
              size="small"
            />
          </Box>

          {profile.url && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <Link
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer">
                {profile.url}
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
              {profile.status === 'pending_review' && user && onApprove && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onApprove(profile.id)}
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
              Reported by: {profile.reporter || 'Anonymous'} on{' '}
              {profile.dateReported}
            </Typography>

            {profile.reason &&
              renderEditableField('reason', 'Reason', profile.reason, true)}

            {(profile.additionalInfo ||
              editedProfile.additionalInfo !== undefined) &&
              renderEditableField(
                'additionalInfo',
                'Additional Info',
                profile.additionalInfo || '',
                true
              )}

            {!profile.additionalInfo &&
              !editedProfile.additionalInfo &&
              canEdit && (
                <Button
                  size="small"
                  onClick={() =>
                    setEditedProfile(prev => ({
                      ...prev,
                      additionalInfo: ''
                    }))
                  }
                  sx={{ mb: 2 }}>
                  Add Notes
                </Button>
              )}

            {profile.proofs && profile.proofs.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Proofs:
                </Typography>
                <List dense>
                  {(editedProfile.proofs || profile.proofs).map(
                    (proof, index) => (
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
                                  ...(editedProfile.proofs || profile.proofs)
                                ];
                                newProofs[index] = e.target.value;
                                setEditedProfile(prev => ({
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
                                ...(editedProfile.proofs || profile.proofs)
                              ];
                              newProofs.splice(index, 1);
                              setEditedProfile(prev => ({
                                ...prev,
                                proofs: newProofs
                              }));
                            }}>
                            Delete
                          </Button>
                        )}
                      </ListItem>
                    )
                  )}
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

                  {Object.keys(editedProfile).length > 0 && (
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
                item={profile}
                type="profile"
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

export default ProfileItem;
