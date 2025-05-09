import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#90caf9',
		},
		secondary: {
			main: '#f48fb1',
		},
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
		text: {
			primary: '#ffffff',
			secondary: '#b3b3b3',
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontWeight: 600,
			fontSize: '2.5rem',
		},
		h2: {
			fontWeight: 500,
			fontSize: '2rem',
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
					textTransform: 'none',
					padding: '8px 16px',
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: '12px',
					boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
				},
			},
		},
	},
});
