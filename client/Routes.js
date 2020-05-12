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
import * as ROUTES from './src/constants/routes';
import { withAuthentication } from './src/components/Session';


const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path={ROUTES.LANDING} exact component={Login} />
        <Route path={ROUTES.ORG_ADMIN} exact component={AdminDashboard} />
        <Route path='/settings'>
          <Fragment>
            <NavBar />
            <Settings />
          </Fragment>
        </Route>
        <Route path='/code_validations'>
          <Fragment>
            <NavBar />
            <CodeValidations />
          </Fragment>
        </Route>
        <Route path='/branding'>
          <Fragment>
            <NavBar />
            <AccountBranding />
          </Fragment>
        </Route>
        <Route path='/manage_members'>
          <Fragment>
            <NavBar />
            <ManageTeams />
          </Fragment>
        </Route>
      </Switch>
      <Switch>
          <Route exact path="/" component={Footer} />
          <Route component={() => <Footer branded={true} />}/>
      </Switch>
    </BrowserRouter>
  );
};

export default withAuthentication(Routes);
