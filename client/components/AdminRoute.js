import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AdminDashboard from './user/AdminDashboard';
import {signin} from './auth/';



const AdminRoute = ({component : Component, ...rest}) => {
    return (
    <Route {...rest} render={(props) => (
    signin.isAdmin === true ? 
    <Component {...props}/>
    : <Redirect to='/'/> )} />
    )
}
   
    

export default AdminRoute;