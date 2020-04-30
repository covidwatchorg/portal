import React, { useState } from 'react';
import OrganizationSettings from './OrganizationSettings';
import PermissionValidation from './PermissionValidation';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  return (
    <div>
      <OrganizationSettings />
      <PermissionValidation />
      <UserManagement />
    </div>
  );
};
export default AdminDashboard;
