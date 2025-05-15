import { useState, type FormEventHandler, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    setError('');
    setOpenError(false);
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/Status');
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';

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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (openError) {
      timer = setTimeout(() => {
        setOpenError(false);
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [openError]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <Collapse in={openError}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpenError(false);
                }}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 3 }}>
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
