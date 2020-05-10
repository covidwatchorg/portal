import React, { Fragment, useState } from 'react';
import NavBar from './NavBar';
import CodeValidations from '../screens/CodeValidations';
import ManageTeams from '../screens/ManageTeams';
import AccountBranding from '../screens/AccountBranding';
import Settings from '../screens/Settings';

const AdminDashboard = () => {
  const [chosenPage, setChosenPage] = useState(1);

  const onNavigate = (page) => {
    setChosenPage(page);
  };
  
  return (
    <Fragment>
      <NavBar onNavigate={onNavigate} />
      {
        (chosenPage === 0) ? <CodeValidations /> :
        (chosenPage === 1) ? <ManageTeams /> :
        (chosenPage === 2) ? <AccountBranding /> :
        <Settings />
      }
    </Fragment>
  );
};
export default AdminDashboard;
