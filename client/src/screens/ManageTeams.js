import React from 'react'
import Grid from '@material-ui/core/Grid'
import MaterialTable from 'material-table'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import { makeStyles, useTheme } from '@material-ui/styles'

//enabling button icons in material table
import { forwardRef } from 'react'

import AddBox from '@material-ui/icons/AddBox'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import Check from '@material-ui/icons/Check'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Clear from '@material-ui/icons/Clear'
import DeleteOutline from '@material-ui/icons/DeleteOutline'
import Edit from '@material-ui/icons/Edit'
import FilterList from '@material-ui/icons/FilterList'
import FirstPage from '@material-ui/icons/FirstPage'
import LastPage from '@material-ui/icons/LastPage'
import Remove from '@material-ui/icons/Remove'
import SaveAlt from '@material-ui/icons/SaveAlt'
import Search from '@material-ui/icons/Search'
import ViewColumn from '@material-ui/icons/ViewColumn'

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
}
//enabling button icons in material table

const useStyles = makeStyles((theme) => ({
  addMember: {
    ...theme.typography.button,
  },
  saveChanges: {
    ...theme.typography.button,
    backgroundColor: '#2C58B1',
    color: 'white',
    '&:hover': {
      backgroundColor: '#4168b8',
    },
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

const ManageTeams = () => {
  const classes = useStyles()
  const theme = useTheme()
  //Modal
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  //Modal

  const [state, setState] = React.useState({
    columns: [
      {
        title: 'Name',
        field: 'name',
        cellStyle: {
          fontFamily: 'Montserrat',
          alignContent: 'left',
          paddingLeft: 5,
        },
      },
      {
        title: 'Role',
        field: 'role',
        lookup: { 0: 'Account Administrator', 1: 'Contact Tracer' },
        cellStyle: {
          fontFamily: 'Montserrat',
          alignContent: 'left',
          paddingLeft: 5,
        },
      },
      {
        title: 'Status',
        field: 'status',
        lookup: { 0: 'Deactivated', 1: 'Active' },
        cellStyle: {
          fontFamily: 'Montserrat',
          alignContent: 'left',
          paddingLeft: 5,
        },
      },
    ],
    data: [
      { name: 'Smitherson, Dr.Rebecca', role: 0, status: 1 },
      { name: 'Jesse Colligan', role: 0, status: 1 },
      { name: 'Donald J Trump', role: 1, status: 0 },
    ],
  })

  return (
    <Grid container direction="column" style={{ padding: '3em' }}>
      <h1>Manage Teams</h1>

      <Grid item style={{ paddingBottom: '1.5em' }}>
        <Button className={classes.addMember} onClick={handleOpen}>
          Add Member
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <div className={classes.paper}>
                <h2 id="transition-modal-title">Add a member</h2>
                <p id="transition-modal-description">Add a member</p>
              </div>
            </Fade>
          </Modal>
        </Button>
      </Grid>

      <MaterialTable
        icons={tableIcons}
        title=""
        columns={state.columns}
        data={state.data}
        actions={[
          {
            icon: tableIcons.ThirdStateCheck,
            tooltip: 'Edit Password',
            onClick: (event, rowData) => alert('You are going to change ' + rowData.name + 'password'),
          },
        ]}
        options={{
          headerStyle: {
            backgroundColor: '#E5E5E5',
            fontFamily: 'Montserrat',
            height: 10,
            fontWeight: 'bold',
            paddingLeft: 5,
            alignContent: 'left',
          },
          actionsColumnIndex: -1,
        }}
        editable={{
          onRowAdd: (newData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve()
                setState((prevState) => {
                  const data = [...prevState.data]
                  data.push(newData)
                  return { ...prevState, data }
                })
              }, 600)
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve()
                if (oldData) {
                  setState((prevState) => {
                    const data = [...prevState.data]
                    data[data.indexOf(oldData)] = newData
                    return { ...prevState, data }
                  })
                }
              }, 600)
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve()
                setState((prevState) => {
                  const data = [...prevState.data]
                  data.splice(data.indexOf(oldData), 1)
                  return { ...prevState, data }
                })
              }, 600)
            }),
        }}
      />
      <Grid item>
        <Button className={classes.saveChanges}>Save Changes</Button>
      </Grid>
    </Grid>
  )
}

// const condition = (authUser) => {
//   var result = authUser && authUser.roles[ROLES.ADMIN]
//   return result
// }

// const ManageTeams = compose(withAuthorization(condition))(ManageTeamsBase)

export default ManageTeams
