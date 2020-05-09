import React, { Fragment, useState } from 'react';
import NavBar from './NavBar';
import EventLog from '../screens/EventLog';
import ManageTeams from '../screens/ManageTeams';
import AccountBranding from '../screens/AccountBranding';
import Settings from '../screens/Settings';
import { withAuthorization } from './Session';
import * as ROLES from '../constants/roles';
import { compose } from 'recompose';


const AdminDashboard = () => {
  const [chosenPage, setChosenPage] = useState(1);

  const onNavigate = (page) => {
    setChosenPage(page);
  };
  
  return (
    <Fragment>
      <NavBar onNavigate={onNavigate} />
      {
        (chosenPage === 0) ? <EventLog /> :
        (chosenPage === 1) ? <ManageTeams /> :
        (chosenPage === 2) ? <AccountBranding /> :
        <Settings />
      }
    </Fragment>
  );
};

const condition = authUser => {
  var result = authUser && authUser.roles[ROLES.ADMIN];
  return result;
}

export default compose(
  withAuthorization(condition),
)(AdminDashboard);
