import React, { Fragment } from 'react'
import { Redirect, BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './src/screens/Login'
import BuildInfo from './src/screens/BuildInfo'
import CodeValidations from './src/screens/CodeValidations'
import Settings from './src/screens/Settings'
import AccountBranding from './src/screens/AccountBranding'
import ManageTeams from './src/screens/ManageTeams'
import Footer from './src/components/Footer'
import NavBar from './src/components/NavBar'
import NotFound from './src/screens/404'
import * as ROUTES from './src/constants/routes'
import { ThemeProvider } from '@material-ui/styles'
import theme from './ui/Theme'
import { createStore } from './src/store'

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <NavBar />
        <Switch>
          <Route path={ROUTES.BUILD_INFO} exact component={BuildInfo} />
          <Route path={ROUTES.LANDING} exact component={Login} />
          <Route path={ROUTES.NOT_FOUND}>
            <Fragment>
              <NotFound />
            </Fragment>
          </Route>
          <Route path={ROUTES.SETTINGS}>
            <Fragment>
              <Settings />
            </Fragment>
          </Route>
          <Route path={ROUTES.CODE_VALIDATIONS}>
            <Fragment>
              <CodeValidations />
            </Fragment>
          </Route>
          <Route path={ROUTES.BRANDING}>
            <Fragment>
              <AccountBranding />
            </Fragment>
          </Route>
          <Route path={ROUTES.MANAGE_MEMBERS}>
            <Fragment>
              <ManageTeams />
            </Fragment>
          </Route>
          <Redirect to="/404" />
        </Switch>
        <Footer />
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default createStore(App)
