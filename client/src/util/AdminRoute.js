import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { auth } from './auth'

const AdminRoute = (props) => {
  return <Route path={props.path}>{auth.isAdmin ? props.children : <Redirect to="/" />}</Route>
}

export default AdminRoute
