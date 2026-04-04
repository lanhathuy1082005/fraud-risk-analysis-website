import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { TransactionAnalysisProvider } from './context/TransactionAnalysisContext';
import { AuthProvider } from './auth/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <TransactionAnalysisProvider>
        <RouterProvider router={router} />
      </TransactionAnalysisProvider>
    </AuthProvider>
  );
}
