import React from 'react';
import { withAuthorization } from '../components/Session';
import * as ROLES from '../constants/roles';
import { compose } from 'recompose';

const ManageTeamsBase = () => {
  return (
    <h1>Manage Teams</h1>
  );
};

const condition = authUser => {
  var result = authUser && authUser.roles[ROLES.ADMIN];
  return result;
}

const ManageTeams =  compose(
  withAuthorization(condition),
)(ManageTeamsBase);

export default ManageTeams;
