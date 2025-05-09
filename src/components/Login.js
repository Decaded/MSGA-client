import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			await login({ username, password });
			navigate('/Status'); // Redirect to status after successful login
		} catch (err) {
			setError(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth='sm'>
			<Paper
				elevation={3}
				sx={{ p: 4, mt: 4 }}
			>
				<Typography
					variant='h4'
					gutterBottom
				>
					Login
				</Typography>

				{error && (
					<Typography
						color='error'
						sx={{ mb: 2 }}
					>
						{error}
					</Typography>
				)}

				<Box
					component='form'
					onSubmit={handleSubmit}
				>
					<TextField
						label='Username'
						value={username}
						onChange={e => setUsername(e.target.value)}
						fullWidth
						margin='normal'
						required
					/>

					<TextField
						label='Password'
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						fullWidth
						margin='normal'
						required
					/>

					<Button
						type='submit'
						variant='contained'
						fullWidth
						disabled={loading}
						sx={{ mt: 3 }}
					>
						{loading ? <CircularProgress size={24} /> : 'Login'}
					</Button>
				</Box>
			</Paper>
		</Container>
	);
}
