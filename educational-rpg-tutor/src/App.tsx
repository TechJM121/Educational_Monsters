import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import { SimpleErrorBoundary } from './components/SimpleErrorBoundary';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <SimpleErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </SimpleErrorBoundary>
  );
}

export default App;
