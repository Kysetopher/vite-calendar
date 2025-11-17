// src/Router.tsx
import React from 'react';
import { Switch, Route } from 'wouter';

import Schedule from './pages/schedule';

export default function Router() {
  return (
    <Switch>
      <Route path="/" component={Schedule} />
      <Route>
        <Schedule />
      </Route>
    </Switch>
  );
}
