import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import { CssBaseline } from '@mui/joy';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SearchBox } from './components/SearchBox';

const theme = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'var(--joy-palette-neutral-100)',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, white, #e6f3ff)',
            padding: '2rem',
          }}
        >
          <SearchBox />
        </div>
      </CssVarsProvider>
    </Provider>
  );
}

export default App;
