import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { signin } from './auth';

const AdminRoute = ({component : Component, ...rest}) => {
    return (
    <Route {...rest} render={(props) => (
    signin.isAdmin === true ? 
    <Component {...props}/>
    : <Redirect to='/'/> )} />
    )
}

export default AdminRoute;