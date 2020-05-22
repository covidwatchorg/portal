import React, { Fragment, useEffect } from 'react'
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
import { withAuthentication } from './src/components/Session'
import { ThemeProvider } from '@material-ui/styles'
import theme from './ui/Theme'
import store from './src/store'

const Routes = () => {
  useEffect(() => {
    if (!store.user) {
      storeInit()
    }
  }, [])

  const storeInit = async () => {
    await store.initialize()
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Switch>
          <Route path={ROUTES.LANDING} exact component={Login} />
          <Route path={ROUTES.NOT_FOUND}>
            <Fragment>
              <NavBar />
              <NotFound />
            </Fragment>
          </Route>
          <Route path={ROUTES.SETTINGS}>
            <Fragment>
              <NavBar />
              <Settings />
            </Fragment>
          </Route>
          <Route path={ROUTES.CODE_VALIDATIONS}>
            <Fragment>
              <NavBar />
              <CodeValidations />
            </Fragment>
          </Route>
          <Route path={ROUTES.BRANDING}>
            <Fragment>
              <NavBar />
              <AccountBranding />
            </Fragment>
          </Route>
          <Route path={ROUTES.MANAGE_MEMBERS}>
            <Fragment>
              <NavBar />
              <ManageTeams />
            </Fragment>
          </Route>
          <Redirect to="/404" />
        </Switch>

        <Switch>
          <Route exact path="/" component={Footer} />
          <Route exact component={() => <Footer branded={true} />} />
        </Switch>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default withAuthentication(Routes)
