import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ScheduleProvider } from './contexts/ScheduleProvider'; // schedules context provider

import Router from './Router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
          <ScheduleProvider>
            <Router />
          </ScheduleProvider>
    </QueryClientProvider>
  );
}

export default App;
