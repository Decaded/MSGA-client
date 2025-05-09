import { useState } from 'react';
import { Card, CardContent, Typography, Chip, Collapse, Button, Box, Link, List, ListItem, ListItemIcon, ListItemText, Divider, TextField, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AdminTools from './AdminTools';

const statusColors = {
	pending_review: 'warning',
	in_progress: 'info',
	confirmed: 'success',
	taken_down: 'error',
	original: 'secondary',
};

function WorkItem({ work, onUpdate, onDelete, onApprove }) {
	const [expanded, setExpanded] = useState(false);
	const [additionalProofs, setAdditionalProofs] = useState(['']);
	const [additionalInfo, setAdditionalInfo] = useState('');
	const { user, isModerator, isAdmin } = useAuth();

	const canEdit = user && isModerator();
	const canDelete = user && isAdmin();

	const showPublic = work.approved || (user && isModerator());

	if (!showPublic) return null;

	const handleAddProof = () => {
		setAdditionalProofs([...additionalProofs, '']);
	};

	const handleUpdateProof = (index, value) => {
		const newProofs = [...additionalProofs];
		newProofs[index] = value;
		setAdditionalProofs(newProofs);
	};

	const handleSubmitUpdate = async () => {
		const updates = {
			proofs: [...work.proofs, ...additionalProofs.filter(p => p)],
			additionalInfo: additionalInfo || work.additionalInfo,
		};
		await onUpdate(work.id, updates);
		setAdditionalProofs(['']);
		setAdditionalInfo('');
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Card sx={{ mb: 2 }}>
				<CardContent>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Typography
							variant='h6'
							component='div'
						>
							{work.title}
							{!work.approved && (
								<Chip
									label='Pending Approval'
									color='warning'
									size='small'
									sx={{ ml: 1 }}
								/>
							)}
						</Typography>
						<Chip
							label={work.status.replace('_', ' ')}
							color={statusColors[work.status] || 'default'}
							size='small'
						/>
					</Box>

					<Typography
						variant='body2'
						color='text.secondary'
						sx={{ mt: 1 }}
					>
						{work.url}
					</Typography>

					<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
						<Button
							size='small'
							endIcon={
								<ExpandMoreIcon
									sx={{
										transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
										transition: 'transform 0.3s',
									}}
								/>
							}
							onClick={() => setExpanded(!expanded)}
						>
							{expanded ? 'Less' : 'More'} details
						</Button>
					</Box>

					<Collapse
						in={expanded}
						timeout='auto'
						unmountOnExit
					>
						<Divider sx={{ my: 2 }} />
						<Typography
							variant='body2'
							paragraph
						>
							Reported by: {work.reporter || 'Anonymous'} on {work.dateReported}
						</Typography>

						{work.reason && (
							<Typography
								variant='body2'
								paragraph
							>
								Reason: {work.reason}
							</Typography>
						)}

						{work.additionalInfo && (
							<Typography
								variant='body2'
								paragraph
							>
								Additional Info: {work.additionalInfo}
							</Typography>
						)}

						{work.proofs && work.proofs.length > 0 && (
							<>
								<Typography variant='subtitle2'>Proofs:</Typography>
								<List dense>
									{work.proofs.map((proof, index) => (
										<ListItem key={index}>
											<ListItemIcon>
												<LinkIcon fontSize='small' />
											</ListItemIcon>
											<ListItemText>
												<Link
													href={proof}
													target='_blank'
													rel='noopener'
												>
													{proof}
												</Link>
											</ListItemText>
										</ListItem>
									))}
								</List>
							</>
						)}

						{canEdit && (
							<Box sx={{ mt: 3 }}>
								<Typography
									variant='subtitle2'
									gutterBottom
								>
									Update Report:
								</Typography>

								<Stack spacing={2}>
									{additionalProofs.map((proof, index) => (
										<TextField
											key={index}
											label={`Additional Proof URL ${index + 1}`}
											value={proof}
											onChange={e => handleUpdateProof(index, e.target.value)}
											placeholder='https://example.com/proof'
											fullWidth
										/>
									))}
									<Button
										onClick={handleAddProof}
										variant='outlined'
										size='small'
									>
										Add Another Proof
									</Button>

									<TextField
										label='Additional Information'
										value={additionalInfo}
										onChange={e => setAdditionalInfo(e.target.value)}
										multiline
										rows={3}
										fullWidth
									/>

									<Button
										variant='contained'
										onClick={handleSubmitUpdate}
										disabled={!additionalProofs.some(p => p) && !additionalInfo}
									>
										Update Report
									</Button>
								</Stack>
							</Box>
						)}

						{isModerator() && (
							<AdminTools
								work={work}
								onStatusChange={onUpdate}
								canDelete={canDelete}
								onDelete={onDelete}								
								onApprove={onApprove}
							/>
						)}
					</Collapse>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default WorkItem;
