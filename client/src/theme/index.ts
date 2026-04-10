import { createMuiTheme } from '@material-ui/core';
import { responsiveFontSizes } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    unassigned: PaletteColor;
    confirmed: PaletteColor;
    assigned: PaletteColor;
    inProgress: PaletteColor;
    paused: PaletteColor;
    completed: PaletteColor;
    overdue: PaletteColor;
    cancelled: PaletteColor;
  }

  interface PaletteOptions {
    unassigned: PaletteColorOptions;
    confirmed: PaletteColorOptions;
    assigned: PaletteColorOptions;
    inProgress: PaletteColorOptions;
    paused: PaletteColorOptions;
    completed: PaletteColorOptions;
    overdue: PaletteColorOptions;
    cancelled: PaletteColorOptions;
  }
}

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    border: {
      primary: string;
    };
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    border?: {
      primary?: string;
    };
  }
}

let theme = createMuiTheme({
  border: {
    primary: grey[300]
  },
  palette: {
    background: { default: '#F5F8FA' },
    primary: {
      main: '#53a0be',
      contrastText: '#fff',
      light: '#53a0be24'
    },
    secondary: {
      main: '#ef965a',
      contrastText: '#fff',
      light: '#ef965a24'
    },
    success: {
      main: '#4CAF50',
      light: '#4CAF503D'
    },
    error: {
      main: '#EB5757',
      contrastText: '#fff',
      light: '#EB575724'
    },
    unassigned: {
      main: '#F4F4F4',
      contrastText: '#848484'
    },
    confirmed: {
      main: '#FFF4CC',
      contrastText: '#FFAA00'
    },
    assigned: {
      main: '#DFFBFB',
      contrastText: '#53A0BE'
    },
    inProgress: {
      main: '#53A0BE',
      contrastText: '#DFFBFB'
    },
    paused: {
      main: '#848484',
      contrastText: '#F4F4F4'
    },
    completed: {
      main: '#D4FAD4',
      contrastText: '#27AE60'
    },
    overdue: {
      main: '#FEE9DE',
      contrastText: '#EB5757'
    },
    cancelled: {
      main: '#EB5757',
      contrastText: '#FEE9DE'
    }
  },
  typography: {
    h4: {
      fontSize: '20px',
      fontWeight: 500
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500
    },
    h6: {
      fontSize: '14px',
      fontWeight: 400
    },
    body1: {
      fontSize: '13px',
      overflowWrap: 'anywhere'
    },
    body2: {
      fontSize: '12px',
      lineHeight: '16px'
    },
    subtitle1: {
      fontSize: '13px',
      fontWeight: 500
    },
    button: {
      fontSize: '13px'
    },
    overline: {
      fontSize: '13px',
      lineHeight: '13px'
    },
    caption: {
      fontSize: '11px',
      lineHeight: '11px'
    }
  },
  overrides: {
    MuiOutlinedInput: {
      adornedStart: {
        paddingLeft: 0,
        marginLeft: 0
      }
    },
    MuiListItem: {
      root: {
        '&$selected': {
          backgroundColor: '#53a0be24',
          '&:hover': {
            backgroundColor: '#53a0be24'
          }
        }
      },
      button: {
        '&:hover': {
          backgroundColor: '#53a0be24'
        }
      }
    },
    MuiButton: {
      root: {
        textTransform: 'capitalize'
      }
    }
  }
});

theme = responsiveFontSizes(theme);

export default theme;
