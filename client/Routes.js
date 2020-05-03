import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './components/core/Login';
import NavBar from './components/core/NavBar';
import AdminDashboard from './components/user/AdminDashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Switch>
        <Route path='/' exact component={Login} />
        <Route path='/orgAdmin' exact component={AdminDashboard} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
