import React, { useState, Fragment } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './src/screens/Login';
import CodeValidations from './src/screens/CodeValidations';
import Settings from './src/screens/Settings';
import AccountBranding from './src/screens/AccountBranding';
import ManageTeams from './src/screens/ManageTeams';
import Footer from './src/components/Footer';
import NavBar from './src/components/NavBar';
import AdminRoute from './src/util/AdminRoute';

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact component={Login} />
        <AdminRoute path='/settings'>
          <Fragment>
            <NavBar />
            <Settings />
          </Fragment>
        </AdminRoute>
        <AdminRoute path='/code_validations'>
          <Fragment>
            <NavBar />
            <CodeValidations />
          </Fragment>
        </AdminRoute>
        <AdminRoute path='/branding'>
          <Fragment>
            <NavBar />
            <AccountBranding />
          </Fragment>
        </AdminRoute>
        <AdminRoute path='/manage_members'>
          <Fragment>
            <NavBar />
            <ManageTeams />
          </Fragment>
        </AdminRoute>
      </Switch>
      <Switch>
          <Route exact path="/" component={Footer} />
          <Route component={() => <Footer branded={true} />}/>
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
