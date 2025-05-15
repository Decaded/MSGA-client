import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MSGA - Make Scribble Hub Great Again
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/report">
            Report
          </Button>
          <Button color="inherit" component={RouterLink} to="/status">
            Status
          </Button>

          {isAdmin() && (
            <Button color="inherit" component={RouterLink} to="/admin">
              Admin
            </Button>
          )}

          {user ? (
            <Button color="secondary" variant="outlined" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button
                color="primary"
                variant="outlined"
                component={RouterLink}
                to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
