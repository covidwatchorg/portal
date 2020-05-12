import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './src/screens/Login';
import CodeValidations from './src/screens/CodeValidations';
import AdminDashboard from './src/components/AdminDashboard';
import Footer from './src/components/Footer';
import AdminRoute from './src/util/AdminRoute';
import theme from './ui/Theme';
import { ThemeProvider } from '@material-ui/styles';

const Routes = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route path='/' exact component={Login} />
          <Route path='/test' exact component={CodeValidations} />
          <AdminRoute path='/orgAdmin' component={AdminDashboard} />
        </Switch>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default Routes;
