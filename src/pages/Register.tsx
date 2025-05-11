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
  CircularProgress
} from '@mui/material';

export default function Register() {
  const [username, setUsername] = useState('');
  const [shProfileURL, setScribbleHubAccountURL] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    setLoading(true);
    setError('');

    try {
      await register({ username, shProfileURL, password });
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your account must be approved by an admin before you can log in. <br /> SH profile link is needed for user verification.
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
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
      </Paper>
    </Container>
  );
}
