import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import { compose } from 'recompose'
import ucsf_health from '../../assets/ucsf-health.svg'
import profile from '../../assets/placeholder/profile.png'
import * as ROLES from '../constants/roles'
import { withStore } from '../state'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}))

const linkStyles = {
  textDecoration: 'none',
  fontFamily: 'Montserrat',
  color: '#2c58b1',
  fontSize: 20,
}

const NavBarBase = (props) => {
  const classes = useStyles()

  const [redirect, setRedirect] = useState(-1)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const onClickMenuItem = (num) => {
    setAnchorEl(null)
    if (num === 4) {
      props.store.signOut()
    }
    setRedirect(num)
  }

  return (
    <div className="navbarContainer">
      <img src={ucsf_health} id="ucsfLogo" />
      <div className="avatar_group avatar_text">
        <div className="name">{props.store.user.firstName + ' ' + props.store.user.lastName}</div>
        <div className="title">{props.store.user.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL}</div>
      </div>
      <div className="avatar_group avatar_image">
        <img src={profile} />
      </div>
      <div className="avatar_group separator" />
      <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={handleMenu}>
        <MenuIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(0)}>
          Positive Test Validations
        </MenuItem>
        {props.store.user.isAdmin && (
          <MenuItem style={linkStyles} onClick={() => onClickMenuItem(1)}>
            Manage Members
          </MenuItem>
        )}
        {props.store.user.isAdmin && (
          <MenuItem style={linkStyles} onClick={() => onClickMenuItem(2)}>
            Account Branding
          </MenuItem>
        )}
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(3)}>
          My Settings
        </MenuItem>
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(4)}>
          Logout
        </MenuItem>
      </Menu>
      {redirect === 0 ? (
        <Redirect to="/code_validations" />
      ) : redirect === 1 ? (
        <Redirect to="/manage_members" />
      ) : redirect === 2 ? (
        <Redirect to="/branding" />
      ) : redirect === 3 ? (
        <Redirect to="/settings" />
      ) : (
        redirect === 4 && <Redirect to="/" />
      )}
    </div>
  )
}

const NavBar = compose(withStore)(NavBarBase)

export default NavBar
