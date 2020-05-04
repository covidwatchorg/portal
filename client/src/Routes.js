import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './components/core/Login';
import NavBar from './components/core/NavBar';
import AdminDashboard from './components/user/AdminDashboard';
import Footer from './components/core/Footer'

const Routes = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Switch>
        <Route path='/' exact component={Login} />
        <Route path='/orgAdmin' exact component={AdminDashboard} />
      </Switch>
      <Footer />
    </BrowserRouter>
  );
};

export default Routes;
