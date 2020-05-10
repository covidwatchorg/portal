import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

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

const NavBar = props => {
  const { onNavigate } = props;
  const classes = useStyles();

  const [redirect, setRedirect] = useState(false);
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
    onNavigate(num);
  };

  return (
    <div className='navbarContainer'>
      <img src='/client/assets/ucsf-health.svg' id='ucsfLogo' />
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
        <MenuItem onClick={() => onClickMenuItem(0)}>Positive Test Validations</MenuItem>
        <MenuItem onClick={() => onClickMenuItem(1)}>Manage Members</MenuItem>
        <MenuItem onClick={() => onClickMenuItem(2)}>Account Branding</MenuItem>
        <MenuItem onClick={() => onClickMenuItem(3)}>My Settings</MenuItem>
        <MenuItem onClick={() => setRedirect(true)}>Logout</MenuItem>
      </Menu>
      {
        redirect &&
        <Redirect to='/'/>
      }
    </div>
  );
};

export default NavBar;
