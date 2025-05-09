import { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const roleColors = {
	admin: 'error',
	user: 'success',
};

function UserItem({ user, onUpdateUser }) {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = event => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleAction = async action => {
		handleClose();
		let updates = {};
		switch (action) {
			case 'approve':
				updates = { approved: true };
				break;
			case 'block':
				updates = { approved: false };
				break;
			default:
				return;
		}
		await onUpdateUser(user.id, updates);
	};

	return (
		<Card sx={{ mb: 2 }}>
			<CardContent>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Box>
						<Typography
							variant='h6'
							component='div'
						>
							{user.username}
						</Typography>
						<Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
							<Chip
								label={user.role}
								color={roleColors[user.role] || 'default'}
								size='small'
							/>
							{!user.approved && (
								<Chip
									label='Pending'
									color='default'
									variant='outlined'
									size='small'
								/>
							)}
						</Box>
					</Box>

					<Button
						aria-controls={open ? 'user-menu' : undefined}
						aria-haspopup='true'
						aria-expanded={open ? 'true' : undefined}
						onClick={handleClick}
					>
						<MoreVertIcon />
					</Button>
					<Menu
						id='user-menu'
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
					>
						{!user.approved && <MenuItem onClick={() => handleAction('approve')}>Approve User</MenuItem>}
						{user.approved && <MenuItem onClick={() => handleAction('block')}>Block User</MenuItem>}
					</Menu>
				</Box>
			</CardContent>
		</Card>
	);
}

export default UserItem;
