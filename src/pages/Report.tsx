import { useState, type FormEventHandler, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  FormHelperText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { addWork, addProfile } from '../services/api';

function Report() {
  const [reportType, setReportType] = useState<'work' | 'profile'>('work');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [reason, setReason] = useState('');
  const [proofs, setProofs] = useState(['']);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidUrl = (url: string) => {
    try {
      const urlPattern = 
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}/i;
      if (!urlPattern.test(url)) return false;

      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (submissionSuccess) {
      timer = setTimeout(() => {
        setSubmissionSuccess(false);
        navigate('/status');
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submissionSuccess, navigate]);

  useEffect(() => {
    let errorTimer: ReturnType<typeof setTimeout>;

    if (openError) {
      errorTimer = setTimeout(() => {
        setOpenError(false);
      }, 3000);
    }

    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [openError]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    setError('');
    setOpenError(false);

    // Validation
    if (!targetUrl) {
      setError(`${reportType === 'work' ? 'Work' : 'Profile'} URL is required`);
      setOpenError(true);
      return;
    }

    const urlPattern = reportType === 'work' 
      ? /^https:\/\/www\.scribblehub\.com\/series\/\d+/
      : /^https:\/\/www\.scribblehub\.com\/profile\/\d+\/[a-zA-Z0-9-_]+\/?$/;

    if (!urlPattern.test(targetUrl)) {
      setError(`Please enter a valid ScribbleHub ${reportType} URL`);
      setOpenError(true);
      return;
    }

    const validProofs = proofs.filter(p => p);
    if (validProofs.length === 0) {
      setError('At least one proof URL is required');
      setOpenError(true);
      return;
    }

    for (const proof of validProofs) {
      if (!isValidUrl(proof)) {
        setError(`"${proof}" is not a valid URL. Please include http:// or https://`);
        setOpenError(true);
        return;
      }
    }

    setLoading(true);

    try {
      const title = extractTitleFromUrl(targetUrl) || 
        `Reported ${reportType === 'work' ? 'Work' : 'Profile'} ${new Date().toISOString()}`;

      const reportData = {
        title,
        url: targetUrl,
        reason,
        proofs: validProofs,
        reporter: nickname || 'Anonymous',
        additionalInfo: ''
      };

      if (reportType === 'work') {
        await addWork(reportData);
      } else {
        await addProfile(reportData);
      }

      setSubmissionSuccess(true);
    } catch (err) {
      let errorMessage = `Failed to submit ${reportType} report`;
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const updateProof = (index: number, value: string) => {
    const newProofs = [...proofs];
    newProofs[index] = formatUrl(value);
    setProofs(newProofs);
  };

  const extractTitleFromUrl = (url: string) => {
    try {
      if (reportType === 'work') {
        const match = url.match(/series\/\d+\/([^/]+)/);
        return match ? decodeURIComponent(match[1].replace(/-/g, ' ')) : null;
      } else {
        const match = url.match(/profile\/\d+\/([^/]+)/);
        return match ? decodeURIComponent(match[1].replace(/-/g, ' ')) : null;
      }
    } catch {
      return null;
    }
  };

  const addProofField = () => {
    setProofs([...proofs, '']);
  };

  const removeProofField = (index: number) => {
    if (proofs.length > 1) {
      const newProofs = [...proofs];
      newProofs.splice(index, 1);
      setProofs(newProofs);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report Content
        </Typography>

        <Collapse in={openError}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setOpenError(false)}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={(_, newType) => newType && setReportType(newType)}
              aria-label="report type"
              fullWidth>
              <ToggleButton value="work">Report Work</ToggleButton>
              <ToggleButton value="profile">Report Profile</ToggleButton>
            </ToggleButtonGroup>
            
            <FormHelperText sx={{ mt: 1 }}>
              {reportType === 'work' ? (
                'Use this for reporting novels/series that appear to be unauthorized translations'
              ) : (
                'Use this for reporting user profiles that are uploading or promoting stolen content'
              )}
            </FormHelperText>
          </Box>

          <TextField
            label={reportType === 'work' ? "Work URL" : "Profile URL"}
            value={targetUrl}
            onChange={e => setTargetUrl(e.target.value)}
            placeholder={
              reportType === 'work' 
                ? "https://www.scribblehub.com/series/..." 
                : "https://www.scribblehub.com/profile/123/username/"
            }
            fullWidth
            required
            margin="normal"
            variant="outlined"
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Proof URLs
          </Typography>

          <Stack spacing={2}>
            {proofs.map((proof, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Proof ${index + 1}`}
                  value={proof}
                  onChange={e => updateProof(index, e.target.value)}
                  onBlur={() => {
                    if (proof && !isValidUrl(proof)) {
                      setError(`"${proof}" is not a valid URL`);
                      setOpenError(true);
                    }
                  }}
                  placeholder="https://example.com/proof"
                  fullWidth
                  required={index === 0}
                  variant="outlined"
                  error={!!proof && !isValidUrl(proof)}
                  helperText={
                    !!proof && !isValidUrl(proof)
                      ? 'Must start with http:// or https:// and be a valid URL'
                      : ''
                  }
                />
                {proofs.length > 1 && (
                  <IconButton
                    onClick={() => removeProofField(index)}
                    color="error">
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
                {index === proofs.length - 1 && (
                  <IconButton onClick={addProofField} color="primary">
                    <AddCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>

          <TextField
            label="Your nickname (optional)"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />

          <TextField
            label="Reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            margin="normal"
            variant="outlined"
            required
            sx={{
              '& .MuiInputBase-root': {
                whiteSpace: 'pre-wrap',
                alignItems: 'flex-start'
              },
              '& .MuiInputBase-input': {
                lineHeight: 1.5
              }
            }}
            InputProps={{
              style: {
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }
            }}
            helperText="Press Enter for new lines. Use Shift+Enter for soft returns."
            FormHelperTextProps={{
              sx: {
                whiteSpace: 'pre-line',
                lineHeight: 1.4
              }
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit Report'}
            </Button>
          </Box>
        </Box>

        <Dialog
          open={submissionSuccess}
          onClose={() => {
            setSubmissionSuccess(false);
            navigate('/status');
          }}>
          <DialogTitle sx={{ color: 'success.main' }}>
            <Box display="flex" alignItems="center">
              <CheckCircleIcon sx={{ mr: 1 }} />
              Report Submitted Successfully!
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Your report has been received and will be reviewed by our team.
            </DialogContentText>
            <DialogContentText sx={{ mt: 2 }}>
              You'll be redirected to the status page in 3 seconds...
            </DialogContentText>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress size={48} color="success" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setSubmissionSuccess(false);
                navigate('/status');
              }}
              color="primary">
              View Status Now
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default Report;
