import React, { Fragment } from 'react'
import { Redirect, BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './src/screens/Login'
import CodeValidations from './src/screens/CodeValidations'
import Settings from './src/screens/Settings'
import AccountBranding from './src/screens/AccountBranding'
import ManageTeams from './src/screens/ManageTeams'
import Footer from './src/components/Footer'
import NavBar from './src/components/NavBar'
import NotFound from './src/screens/404'
import * as ROUTES from './src/constants/routes'
import { createStore } from './src/store'

const App = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Switch>
        <Route path={ROUTES.LANDING} exact component={Login} />
        <Route path={ROUTES.NOT_FOUND}>
          <Fragment>
            <NotFound />
            <Footer />
          </Fragment>
        </Route>
        <Route path={ROUTES.SETTINGS}>
          <Fragment>
            <Settings />
            <Footer />
          </Fragment>
        </Route>
        <Route path={ROUTES.CODE_VALIDATIONS}>
          <Fragment>
            <CodeValidations />
            <Footer />
          </Fragment>
        </Route>
        <Route path={ROUTES.BRANDING}>
          <Fragment>
            <AccountBranding />
            <Footer />
          </Fragment>
        </Route>
        <Route path={ROUTES.MANAGE_MEMBERS}>
          <Fragment>
            <ManageTeams />
            <Footer />
          </Fragment>
        </Route>
        <Redirect to="/404" />
      </Switch>
    </BrowserRouter>
  )
}

export default createStore(App)
