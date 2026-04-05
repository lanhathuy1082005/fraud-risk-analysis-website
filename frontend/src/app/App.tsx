import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AuthProvider } from './features/auth/AuthContext';

export default function App() {
  return (
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
  );
}
