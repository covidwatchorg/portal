import React from 'react';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';


const ManageTeams = () => {
  const [state, setState] = React.useState({
    columns: [
      { title: 'Name', field: 'name' },
      { title: 'Role', field: 'role' },
      {
        title: 'Role',
        field: 'Role',
        lookup: { 0: 'Account Administrator', 1: 'Contact Tracer' },
      },
      {
        title: 'Status',
        field: 'Status',
        lookup: { 0: 'Deactivated', 1: 'Active' },
      },
      { title: 'Role', field: 'role' },
    ],
    data: [
      { name: 'Smitherson, Dr.Rebecca', role: 0, status: 1 },
      { name: 'Jesse Colligan', role: 0, status: 1 },
      { name: 'Donald J Trump', role: 1, status: 0 },

    ],
  });

  const table = () => (
    <MaterialTable
      title="Editable Example"
      columns={state.columns}
      data={state.data}
      editable={{
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              setState((prevState) => {
                const data = [...prevState.data];
                data.push(newData);
                return { ...prevState, data };
              });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              if (oldData) {
                setState((prevState) => {
                  const data = [...prevState.data];
                  data[data.indexOf(oldData)] = newData;
                  return { ...prevState, data };
                });
              }
            }, 600);
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              setState((prevState) => {
                const data = [...prevState.data];
                data.splice(data.indexOf(oldData), 1);
                return { ...prevState, data };
              });
            }, 600);
          }),
      }}
    />
  )


  return (
    <div className="manage-teams-container">
      <h1>Manage Teams</h1>
      <button className="mainBtn">Add Member</button>
      <Grid container direction='row' justify='center'>
        {table()}
      </Grid>
      <button className="mainBtn">Save Changes</button>
    </div>
  );
};

export default ManageTeams;