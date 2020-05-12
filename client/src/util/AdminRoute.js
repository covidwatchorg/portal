import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { auth } from './auth'

const AdminRoute = ({component : Component, ...rest}) => {
    return (
    <Route {...rest} render={(props) => (
    /*signin.isAdmin === true ? 
    <Component {...props}/>
    : <Redirect to='/'/> )} /> */
    <Component {...props}/> )} /> 
    )
}

export default AdminRoute
