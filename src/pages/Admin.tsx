import {
  useState,
  useEffect,
  type PropsWithChildren,
  type ComponentProps
} from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';
import { getUsers, updateUser, deleteUser } from '../services/api';
import UserItem from '../components/UserItem';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types/User';

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

function Admin() {
  const [tabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        const usersData = Array.isArray(response)
          ? response
          : response.users || [];
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
        Admin Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}></Box>

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
    </Container>
  );
}

export default Admin;
