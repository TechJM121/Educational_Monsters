import React from 'react';
import { SimpleAuthProvider } from './hooks/useSimpleAuth';
import { SimpleErrorBoundary } from './components/SimpleErrorBoundary';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <SimpleErrorBoundary>
      <SimpleAuthProvider>
        <AppRouter />
      </SimpleAuthProvider>
    </SimpleErrorBoundary>
  );
}

export default App;