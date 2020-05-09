import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './src/screens/Login.v1';
import AdminDashboard from './src/components/AdminDashboard';
import Footer from './src/components/Footer'
import AdminRoute from './src/util/AdminRoute';
import * as ROUTES from './src/constants/routes';
import { withAuthentication } from './src/components/Session';


const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path={ROUTES.LANDING} exact component={Login} />
        <Route path={ROUTES.ORG_ADMIN} exact component={AdminDashboard} />
      </Switch>
      <Footer />
    </BrowserRouter>
  );
};

export default withAuthentication(Routes);
