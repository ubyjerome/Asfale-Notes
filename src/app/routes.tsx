import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { AppShell } from '../components/layout/AppShell';
import { NotePage } from '../pages/NotePage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { AuthGate } from './AuthGate';

export const router = createBrowserRouter([
  {
    path: ROUTES.ONBOARDING,
    element: <OnboardingPage />,
  },
  {
    path: ROUTES.HOME,
    element: (
      <AuthGate>
        <AppShell />
      </AuthGate>
    ),
  },
  {
    path: ROUTES.NOTE,
    element: (
      <AuthGate>
        <NotePage />
      </AuthGate>
    ),
  },
]);
