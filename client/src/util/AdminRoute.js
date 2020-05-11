import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import store from "../store"

const AdminRoute = (props) => {
  return <Route path={props.path}>{store.user.isAdmin ? props.children : <Redirect to="/" />}</Route>
}

export default AdminRoute
