// src/Router.tsx
import React from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { useAuth } from './hooks/useAuth';

// Public pages
import Landing from './pages/landing';
import Signup from './pages/signup';
import AcceptInvitation from './pages/accept-invitation';
import CompleteConnection from './pages/complete-connection';
import Demo from './pages/demo';
import ResetPassword from './pages/reset-password';
import MagicLinkVerify from './components/auth/MagicLinkVerify';

// Protected pages
import Dashboard from './pages/dashboard';
import Schedule from './pages/schedule';
import Messages from './pages/messages';
import Documents from './pages/documents';
import Profile from './pages/profile';
import AIAssistant from './pages/ai-assistant';
import Expenses from './pages/expenses';
import InviteCoParent from './pages/invite-coparent';
import GoogleCalendarCallback from './pages/google-calendar-callback';
import ParentingPlans from './pages/parenting-plans';
import Skills from './pages/skills';
import Onboarding from './pages/onboarding';
import Circle from './pages/circle';

import Loading from './components/Loading';


import NotFound from './pages/not-found';

export default function Router() {
  const { isLoading, isAuthenticated } = useAuth();

  // While we’re checking the cookie → user fetch
  // if (isLoading) {
  //   return <Loading message="Verifying credentials"/>;
  // }

  return (
    <Switch>
      {/** Public routes **/}
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Schedule /> }
      </Route>
      <Route path="/signup" component={Signup} />
      <Route path="/invite/:token" component={AcceptInvitation} />
      <Route path="/complete-connection" component={CompleteConnection} />
      <Route path="/demo" component={Demo} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/auth/verify-magic" component={MagicLinkVerify} />

      {/** Protected routes **/}
      <Route path="/dashboard">
        {isAuthenticated ? <Dashboard /> : <Redirect to="/" />}
      </Route>

      <Route path="/onboarding">
        {isAuthenticated ? <Onboarding /> : <Redirect to="/" />}
      </Route>

      <Route path="/messages">
        {isAuthenticated ? <Messages /> : <Redirect to="/" />}
      </Route>

      <Route path="/schedule">
        {isAuthenticated ? <Schedule /> : <Redirect to="/" />}
      </Route>



      <Route path="/documents">
        {isAuthenticated ? <Documents /> : <Redirect to="/" />}
      </Route>

      <Route path="/circle">
        {isAuthenticated ? <Circle /> : <Redirect to="/" />}
      </Route>

      <Route path="/expenses">
        {isAuthenticated ? <Expenses /> : <Redirect to="/" />}
      </Route>

      <Route path="/profile">
        {isAuthenticated ? <Profile /> : <Redirect to="/" />}
      </Route>

      <Route path="/ai-assistant">
        {isAuthenticated ? <AIAssistant /> : <Redirect to="/" />}
      </Route>

      <Route path="/invite-coparent">
        {isAuthenticated ? <InviteCoParent /> : <Redirect to="/" />}
      </Route>


      <Route path="/google-calendar-callback">
        {isAuthenticated ? <GoogleCalendarCallback /> : <Redirect to="/" />}
      </Route>

      <Route path="/parenting-plans">
        {isAuthenticated ? <ParentingPlans /> : <Redirect to="/" />}
      </Route>

      <Route path="/skills">
        {isAuthenticated ? <Skills /> : <Redirect to="/" />}
      </Route>

      {/** Fallback for anything else **/}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
