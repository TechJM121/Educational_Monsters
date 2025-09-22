import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import { SimpleErrorBoundary } from './components/SimpleErrorBoundary';
import { AppRouter } from './router/AppRouter';
import { ResponsiveDebug } from './components/shared/ResponsiveDebug';

function App() {
  return (
    <SimpleErrorBoundary>
      <AuthProvider>
        <AppRouter />
        {/* Show responsive debug in development */}
        {import.meta.env.DEV && <ResponsiveDebug />}
      </AuthProvider>
    </SimpleErrorBoundary>
  );
}

export default App;
