import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d97706', // Gold Orange
      contrastText: '#ffffff',
      light: '#faebd7',
      dark: '#b45309',
    },
    secondary: {
      main: '#5d80b2', // Calming Periwinkle Slate Blue
      contrastText: '#ffffff',
      light: '#eaeef5',
      dark: '#3d5178',
    },
    background: {
      default: '#faf9f6', // Soft Warm White
      paper: '#ffffff', // Pure White Cards
    },
    text: {
      primary: '#3d3b32', // Soft Charcoal
      secondary: '#655f4d',
    },
    error: {
      main: '#d98880',
    },
    warning: {
      main: '#e0a96d',
    },
    success: {
      main: '#5c8f7a',
    },
  },
  typography: {
    fontFamily: [
      'var(--font-poppins)',
      'Poppins',
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 12,
    h1: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.45rem',
      letterSpacing: '-0.005em',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.2rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.05rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '0.95rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '0.85rem',
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '0.82rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.75rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '0.8rem',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.75rem',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.68rem',
    },
    overline: {
      fontWeight: 500,
      fontSize: '0.62rem',
      letterSpacing: '0.04em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.78rem',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '7px 18px',
          boxShadow: 'none',
          fontWeight: 500,
          fontSize: '0.78rem',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.1)',
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.72rem',
          borderRadius: 4,
        },
        sizeLarge: {
          padding: '10px 24px',
          fontSize: '0.85rem',
          borderRadius: 4,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: '1px solid rgba(227, 236, 231, 0.45)',
          boxShadow: '0 8px 24px -8px rgba(92, 143, 122, 0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.07)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            fontSize: '0.8rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.8rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(227, 236, 231, 0.8)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
          fontSize: '0.68rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.78rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.78rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.76rem',
          fontWeight: 400,
        },
        head: {
          fontWeight: 500,
          fontSize: '0.72rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.78rem',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.78rem',
          fontWeight: 400,
        },
        secondary: {
          fontSize: '0.68rem',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
          fontSize: '0.68rem',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '0.62rem',
          fontWeight: 500,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '0.95rem',
          fontWeight: 500,
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: '0.78rem',
        },
      },
    },
  },
});
