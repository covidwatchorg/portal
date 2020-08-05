import React, { useState } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import cwLogo from '../../assets/covid-watch-logo-blue.svg'
import profile from '../../assets/user.png' // user.png icon made by www.flaticon.com
import * as ROLES from '../constants/roles'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import menu from '../../assets/menu.svg'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(11),
  },
  title: {
    flexGrow: 1,
  },
  link: {
    marginTop: 14,
    paddingLeft: 30,
    paddingRight: 30,
    fontFamily: 'Montserrat',
    fontSize: 18,
    fontWeight: 500,
    color: '#2c58b1',
  },
}))

const NavBarBase = observer((props) => {
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

  const LoggedInIcons = (
    <div id="logged-in-icons-container">
      <div className="avatar_group avatar_text">
        <div className="small-text name">{props.store.data.user.firstName + ' ' + props.store.data.user.lastName}</div>
        <div className="xs-text">{props.store.data.user.isAdmin ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL}</div>
      </div>
      <div className="avatar_group avatar_image">
        <Link to="/settings">
          <img
            src={props.store.data.user.imageBlob ? props.store.data.user.imageBlob : profile}
            className="profile_photo"
            alt=""
          ></img>
        </Link>
      </div>
      <div className="avatar_group separator" />

      <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={handleMenu}>
        <img src={menu} alt="Menu" />
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
        <MenuItem className={classes.link} style={{ marginTop: 22 }} onClick={() => onClickMenuItem(0)}>
          Diagnosis Verification Codes
        </MenuItem>
        {props.store.data.user.isAdmin && (
          <MenuItem className={classes.link} onClick={() => onClickMenuItem(1)}>
            Manage Members
          </MenuItem>
        )}
        {props.store.data.user.isAdmin && (
          <MenuItem className={classes.link} onClick={() => onClickMenuItem(2)}>
            Mobile App Settings
          </MenuItem>
        )}
        <MenuItem className={classes.link} onClick={() => onClickMenuItem(3)}>
          My Settings
        </MenuItem>
        <MenuItem className={classes.link} style={{ marginBottom: 22 }} onClick={() => onClickMenuItem(4)}>
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

  return (
    // Reference - will adjust more after login
    // <div className="navbarContainer">
    //   <Link to="/code_validations" className="logo-link">
    //     <img
    //       src={props.store.data.organization.logoBlob ? props.store.data.organization.logoBlob : cwLogo}
    //       id="orgLogo"
    //       alt={props.store.data.organization.name}
    //     />
    //   </Link>
    //   {props.store.data.user.firstName ? LoggedInIcons : <div id="logged-in-icons-container" />}
    // </div>
    <Col md={12} className="navbar d-flex pl-0 pl-md-5 py-3 justify-content-center justify-content-md-start">
      <Link to="/code_validations">
        <Image
          src={props.store.data.organization.logoBlob ? props.store.data.organization.logoBlob : cwLogo}
          height={40}
        />
      </Link>
      {props.store.data.user.firstName ? LoggedInIcons : <div id="logged-in-icons-container" />}
    </Col>
  )
})

const NavBar = withStore(NavBarBase)

export default NavBar
