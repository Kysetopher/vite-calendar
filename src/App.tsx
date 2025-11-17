import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ScheduleProvider } from './contexts/ScheduleProvider'; // schedules context provider
import { RelationshipProvider } from './contexts/RelationshipProvider';
import Router from './Router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>

        <RelationshipProvider>
          <ScheduleProvider>
            <Router />
          </ScheduleProvider>
        </RelationshipProvider>
    </QueryClientProvider>
  );
}

export default App;
