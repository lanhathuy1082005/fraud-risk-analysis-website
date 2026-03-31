import { RouterProvider } from 'react-router';
import { router } from './routes';
import { TransactionAnalysisProvider } from './context/TransactionAnalysisContext';

export default function App() {
  return (
    <TransactionAnalysisProvider>
      <RouterProvider router={router} />
    </TransactionAnalysisProvider>
  );
}
