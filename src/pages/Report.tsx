import { useState, type FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Stack
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

function Report() {
  const [workUrl, setWorkUrl] = useState('');
  const [reason, setReason] = useState('');
  const [proofs, setProofs] = useState(['']);
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    console.log('Submitted:', { workUrl, reason, proofs, nickname });
    navigate('/status');
  };

  const addProofField = () => {
    setProofs([...proofs, '']);
  };

  const removeProofField = (index: number) => {
    if (proofs.length > 1) {
      const newProofs = [...proofs];
      newProofs.splice(index, 1);
      setProofs(newProofs);
    }
  };

  const updateProof = (index: number, value: string) => {
    const newProofs = [...proofs];
    newProofs[index] = value;
    setProofs(newProofs);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report a Work
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Work URL"
            value={workUrl}
            onChange={e => setWorkUrl(e.target.value)}
            placeholder="https://www.scribblehub.com/series/..."
            fullWidth
            required
            margin="normal"
            variant="outlined"
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Proof URLs
          </Typography>

          <Stack spacing={2}>
            {proofs.map((proof, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label={`Proof ${index + 1}`}
                  value={proof}
                  onChange={e => updateProof(index, e.target.value)}
                  placeholder="https://example.com/proof"
                  fullWidth
                  required={index === 0}
                  variant="outlined"
                />
                {proofs.length > 1 && (
                  <IconButton
                    onClick={() => removeProofField(index)}
                    color="error">
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
                {index === proofs.length - 1 && (
                  <IconButton onClick={addProofField} color="primary">
                    <AddCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>

          <TextField
            label="Your nickname (optional)"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />

          <TextField
            label="Reason (optional)"
            value={reason}
            onChange={e => setReason(e.target.value)}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" size="large">
              Submit Report
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Report;
