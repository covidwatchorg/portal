import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import { compose } from 'recompose'
import { withRouter } from 'react-router-dom'
import AuthAwareMenuItem from '../components/AuthAwareComponents/AuthAwareMenuItem'
import store from '../store'
import ucsf_health from '../../assets/ucsf-health.svg'
import profile from '../../assets/placeholder/profile.png'
import * as ROLES from '../constants/roles'

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

const NavBarBase = () => {
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
      store.signOut()
    }
    setRedirect(num)
  }

  const getUserName = () => {
    if (store.user) {
      return store.user.firstName + ' ' + store.user.lastName
    } else {
      return null
    }
  }

  const getUserTitle = () => {
    if (store.user) {
      return store.user.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL
    } else {
      return null
    }
  }

  return (
    <div className="navbarContainer">
      <img src={ucsf_health} id="ucsfLogo" />
      <div className="avatar_group avatar_text">
        <div className="name">{getUserName()}</div>
        <div className="title">{getUserTitle()}</div>
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
        {
          <AuthAwareMenuItem style={linkStyles} roleguard="ADMIN" onClick={() => onClickMenuItem(1)}>
            Manage Members
          </AuthAwareMenuItem>
        }
        {
          <AuthAwareMenuItem style={linkStyles} roleguard="ADMIN" onClick={() => onClickMenuItem(2)}>
            Account Branding
          </AuthAwareMenuItem>
        }
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

const NavBar = compose(withRouter)(NavBarBase)

export default NavBar
