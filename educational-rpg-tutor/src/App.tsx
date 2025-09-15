import React from 'react';
import { AppRouter } from './router/AppRouter';
import { ErrorHandlingProvider } from './components/shared/ErrorHandlingProvider';
import { FloatingFeedbackButton } from './components/shared/FeedbackSystem';

function App() {
  return (
    <ErrorHandlingProvider>
      <AppRouter />
      <FloatingFeedbackButton />
    </ErrorHandlingProvider>
  );
}

export default App;
