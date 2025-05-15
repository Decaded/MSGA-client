import { useState, type FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/mockBackend';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

export default function Register() {
  const [username, setUsername] = useState('');
  const [shProfileURL, setScribbleHubAccountURL] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const extractUsernameFromURL = (url: string) => {
    const match = url.match(/profile\/\d+\/([^\\/]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const scribbleHubURLPattern =
      /^https:\/\/www\.scribblehub\.com\/profile\/\d+\/[a-zA-Z0-9-_]+\/?$/;
    if (!scribbleHubURLPattern.test(shProfileURL)) {
      setError('Please enter a valid Scribble Hub profile URL.');
      return;
    }

    const urlUsername = extractUsernameFromURL(shProfileURL);
    if (urlUsername && username.toLowerCase() !== urlUsername.toLowerCase()) {
      setShowConfirmation(true);
      return;
    }
    await proceedWithRegistration();
  };

  const proceedWithRegistration = async () => {
    setLoading(true);
    setError('');
    setShowConfirmation(false);

    try {
      await register({ username, shProfileURL, password });
      navigate('/');
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';

      if (err instanceof Error) {
        try {
          // Try to parse the error message as JSON
          const errorData = JSON.parse(err.message);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If not JSON, use the original error message
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Register
        </Typography>
        <Box
          sx={{
            backgroundColor: 'info.dark',
            borderLeft: '4px solid',
            borderColor: 'info.main',
            p: 2,
            mb: 3
          }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            Important Account Approval Notice
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
            Your account must be manually approved by an administrator before
            you can log in. This process may take up to 24 hours.
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, fontStyle: 'italic', fontWeight: 'bold' }}>
            Please ensure your Scribble Hub profile URL is correct, and the
            profile is accessible, as it will be used for verification.
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 2, fontWeight: 'bold', fontStyle: 'italic' }}>
            Only selected accounts will be approved.
          </Typography>
        </Box>

        {error && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: 'error.dark',
              color: 'error.contrastText',
              borderRadius: 1
            }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Username"
            placeholder="Your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Scribble Hub Profile URL"
            placeholder="https://www.scribblehub.com/profile/123456/username/"
            value={shProfileURL}
            onChange={e => setScribbleHubAccountURL(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <Link href="/login" variant="body2">
              Already have an account? Login
            </Link>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </Box>
        </Box>
        <Dialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}>
          <DialogTitle>Username Mismatch</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Your username doesn't match the one in your Scribble Hub URL. This
              might increase verification time. Are you sure you want to
              continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
            <Button onClick={proceedWithRegistration} color="primary" autoFocus>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}
