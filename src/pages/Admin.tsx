import {
  useState,
  useEffect,
  type PropsWithChildren,
  type ComponentProps
} from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Button
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  getUsers,
  updateUser,
  deleteUser,
  getWebhooks,
  addWebhook,
  deleteWebhook
} from '../services/api';
import UserItem from '../components/UserItem';
import WebhookItem from '../components/WebhookItem';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/User';
import type { Webhook } from '../types/Webhook';

interface Props
  extends PropsWithChildren,
    Omit<ComponentProps<'div'>, 'children'> {
  value: number;
  index: number;
}

function TabPanel({ children, value, index, ...other }: Props) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
const tanyaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#bf3b3b', // Military red
      contrastText: '#fff'
    },
    secondary: {
      main: '#d4af37' // Gold accents
    },
    background: {
      default: '#0a192f', // Navy blue
      paper: '#172a45'
    },
    text: {
      primary: '#e1e1e1',
      secondary: '#8c9db5'
    }
  },
  typography: {
    fontFamily: '"Orbitron", "Inter", sans-serif',
    h4: {
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          border: '1px solid #d4af37',
          fontWeight: 'bold',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #172a45 0%, #0a192f 100%)',
          border: '1px solid #d4af3755',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#d4af37',
          height: '3px'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          '&.Mui-selected': {
            color: '#d4af37 !important'
          }
        }
      }
    }
  }
});

function Admin() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '' });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, webhooksResponse] = await Promise.all([
          getUsers(),
          getWebhooks()
        ]);

        setUsers(
          Array.isArray(usersResponse)
            ? usersResponse
            : usersResponse.users || []
        );
        setWebhooks(Object.values(webhooksResponse));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateUser = async (id: User['id'], updates: Partial<User>) => {
    try {
      const updatedUser = await updateUser(id, updates);
      setUsers(users.map(user => (user.id === id ? updatedUser : user)));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // In the handleDeleteUser function
  const handleDeleteUser = async (id: User['id']) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      let errorMessage = 'Failed to delete user';

      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }

      alert(errorMessage);
    }
  };

  const handleAddWebhook = async () => {
    if (!webhookForm.url || !webhookForm.name) return;

    try {
      const newWebhook = await addWebhook(webhookForm);
      setWebhooks(prev => [...prev, newWebhook]);
      setWebhookForm({ name: '', url: '' });
    } catch (error) {
      console.error('Error adding webhook:', error);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await deleteWebhook(id);
      setWebhooks(prev => prev.filter(wh => wh.id !== id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAdmin()) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">
          You don't have permission to access this page
        </Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={tanyaTheme}>
      <Container maxWidth="lg" className="admin-theme">
        <div className="scanline-overlay" />
        <Box className="admin-header">
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '2px',
              position: 'relative',
              '&::before': {
                content: '"»"',
                color: '#d4af37',
                marginRight: '1rem'
              },
              '&::after': {
                content: '"«"',
                color: '#d4af37',
                marginLeft: '1rem'
              }
            }}>
            Imperial Admin Dashboard
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="User Management" />
          <Tab label="Webhook Management" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {users.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            users.map(user => (
              <UserItem
                key={user.id}
                user={user}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            ))
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              label="Webhook Name"
              value={webhookForm.name}
              onChange={e =>
                setWebhookForm({ ...webhookForm, name: e.target.value })
              }
              size="small"
            />
            <TextField
              label="Webhook URL"
              value={webhookForm.url}
              onChange={e =>
                setWebhookForm({ ...webhookForm, url: e.target.value })
              }
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddWebhook}
              disabled={!webhookForm.name || !webhookForm.url}>
              Add Webhook
            </Button>
          </Box>

          {webhooks.length === 0 ? (
            <Typography>No webhooks configured</Typography>
          ) : (
            webhooks.map(webhook => (
              <WebhookItem
                key={webhook.id}
                webhook={webhook}
                onDelete={handleDeleteWebhook}
              />
            ))
          )}
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default Admin;
