import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ThemeProvider } from './ThemeProvider';
import { usePrefs } from '../hooks/usePrefs';

function AppContent() {
  usePrefs();
  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
