import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
//import store from '../store'

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
}));

const linkStyles = {
  textDecoration: "none",
  fontFamily: "Montserrat",
  color: "#2c58b1",
  fontSize: 20
};

const NavBar = () => {
  const classes = useStyles();

  const [redirect, setRedirect] = useState(-1);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClickMenuItem = num => {
    setAnchorEl(null);
    if (num === 4) {
      store.signOut();
    }
    setRedirect(num);
  };

  const getUserName = () => {
    return "Dr. John Doe"; // TODO retrieve name from user data
  };

  const getUserTitle = () => {
    return "Account Admin" // TODO retrieve title from user data
  };

  return (
    <div className='navbarContainer'>
      <img src='/client/assets/ucsf-health.svg' id='ucsfLogo' />
      <div className="avatar_group avatar_text">
        <div className="name">
          {getUserName()}
        </div>
        <div className="title">
          {getUserTitle()}
        </div>
      </div>
      <div className="avatar_group avatar_image">
        <img src='client/assets/placeholder/profile.png'/>
      </div>
      <div className="avatar_group separator"/>
      <IconButton
        edge='start'
        className={classes.menuButton}
        color='inherit'
        aria-label='menu'
        onClick={handleMenu}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id='menu-appbar'
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
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(1)}>
          Manage Members
        </MenuItem>
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(2)}>
          Account Branding
        </MenuItem>
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(3)}>
          My Settings
        </MenuItem>
        <MenuItem style={linkStyles} onClick={() => onClickMenuItem(4)}>
          Logout
        </MenuItem>
      </Menu>
      {
        (redirect === 0) ? <Redirect to='/code_validations' /> :
        (redirect === 1) ? <Redirect to='/manage_members' /> :
        (redirect === 2) ? <Redirect to='/branding' /> :
        (redirect === 3) ? <Redirect to='/settings' /> :
        (redirect === 4) && <Redirect to='/'/>
      }
    </div>
  );
};

export default NavBar;
