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
import Test from './src/screens/Test'
import * as ROUTES from './src/constants/routes'
import { createStore } from './src/store'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

const App = () => {
  return (
    <BrowserRouter>
      <Container className="main-content" fluid>
        <Row>
          <NavBar />
        </Row>
        <Row>
          <Switch>
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
            <Route path={ROUTES.TEST}>
              <Fragment>
                <Test />
              </Fragment>
            </Route>
            <Redirect to="/404" />
          </Switch>
        </Row>
        <Row className="mt-auto">
          <Footer />
        </Row>
      </Container>
    </BrowserRouter>
  )
}

export default createStore(App)
