import React from 'react';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import { makeStyles, useTheme } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
  tableStyle: {
    fontFamily: 'Montserrat',
  }
}))

const ManageTeams = () => {
  const classes = useStyles()
  const theme = useTheme()
  const [state, setState] = React.useState({
    columns: [
      {
        title: 'Name', field: 'name',
        cellStyle: {
          fontFamily: 'Montserrat',
        },
        headerStyle: {
          fontFamily: 'Montserrat',
          backgroundColor: "#E5E5E5"
        }
      },
      {
        title: 'Role',
        field: 'role',
        lookup: { 0: 'Account Administrator', 1: 'Contact Tracer' },
        cellStyle: {
          fontFamily: 'Montserrat',
        },
        headerStyle: {
          fontFamily: 'Montserrat',
          backgroundColor: "#E5E5E5"
        }


      },
      {
        title: 'Status',
        field: 'status',
        lookup: { 0: 'Deactivated', 1: 'Active' },
        cellStyle: {
          fontFamily: 'Montserrat',
        },
        headerStyle: {
          fontFamily: 'Montserrat',
          backgroundColor: "#E5E5E5"
        }

      },
      {
        title: 'Settings', field: 'Settings', cellStyle: {
          fontFamily: 'Montserrat',
        },
        headerStyle: {
          fontFamily: 'Montserrat',
          backgroundColor: "#E5E5E5"
        }

      },

    ],
    data: [
      { name: 'Smitherson, Dr.Rebecca', role: 0, status: 1 },
      { name: 'Jesse Colligan', role: 0, status: 1 },
      { name: 'Donald J Trump', role: 1, status: 0 },
    ],
  });

  return (
    <div className="manage-teams-container">
      <h1>Manage Teams</h1>
      <button className="mainBtn">Add Member</button>
      <Grid className={classes.tableStyle}
        container direction='row' justify='center'>
        <MaterialTable
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

      </Grid>
      <button className="mainBtn">Save Changes</button>
    </div>
  );
};

export default ManageTeams;