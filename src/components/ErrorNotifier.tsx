import { Snackbar, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function ErrorNotifier() {
  const { authError, clearAuthError } = useAuth();

  return (
    <Snackbar
      open={!!authError}
      autoHideDuration={6000}
      onClose={clearAuthError}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity="error" onClose={clearAuthError} sx={{ width: '100%' }}>
        {authError}
      </Alert>
    </Snackbar>
  );
}
