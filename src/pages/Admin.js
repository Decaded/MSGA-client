import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Container, CircularProgress } from '@mui/material';
import { getUsers, updateUser } from '../services/mockBackend';
import UserItem from '../components/UserItem';
import { useAuth } from '../contexts/AuthContext';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role='tabpanel'
			hidden={value !== index}
			id={`admin-tabpanel-${index}`}
			aria-labelledby={`admin-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function Admin() {
	const [tabValue, setTabValue] = useState(0);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const { isAdmin } = useAuth();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await getUsers();
				const usersData = Array.isArray(response) ? response : response.users || [];
				setUsers(usersData);
			} catch (error) {
				console.error('Error fetching users:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

	const handleUpdateUser = async (id, updates) => {
		try {
			const updatedUser = await updateUser(id, updates);
			setUsers(users.map(user => (user.id === id ? updatedUser : user)));
		} catch (error) {
			console.error('Error updating user:', error);
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
				<Typography variant='h6'>You don't have permission to access this page</Typography>
			</Container>
		);
	}

	return (
		<Container maxWidth='lg'>
			<Typography
				variant='h4'
				gutterBottom
				sx={{ mt: 2 }}
			>
				Admin Dashboard
			</Typography>

			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs
					value={tabValue}
					onChange={(_, newValue) => setTabValue(newValue)}
				>
					<Tab label='User Management' />
					<Tab label='Pending Approvals' />
				</Tabs>
			</Box>

			<TabPanel
				value={tabValue}
				index={0}
			>
				{users.length === 0 ? (
					<Typography>No users found.</Typography>
				) : (
					users.map(user => (
						<UserItem
							key={user.id}
							user={user}
							onUpdateUser={handleUpdateUser}
						/>
					))
				)}
			</TabPanel>

			<TabPanel
				value={tabValue}
				index={1}
			>
				{/* Placeholder for pending approvals */}
				<Typography>Pending approval items will appear here</Typography>
			</TabPanel>
		</Container>
	);
}

export default Admin;
