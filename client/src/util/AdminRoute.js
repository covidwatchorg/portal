import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { signin } from './auth';

const AdminRoute = props => {
    return (
    <Route path={props.path}>
        {
            signin.isAdmin === true ? 
            props.children :
            <Redirect to='/'/>
        }
    </Route>
    )
}

export default AdminRoute;