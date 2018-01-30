import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

import classNames from 'classnames';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Hidden from 'material-ui/Hidden';
import IconButton from 'material-ui/IconButton';
import { MenuItem, MenuList } from 'material-ui/Menu';
import MenuIcon from 'material-ui-icons/Menu';
import Grow from 'material-ui/transitions/Grow';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';
// import AccountCircle from 'material-ui-icons/AccountCircle';
import { Manager, Target, Popper } from 'react-popper';

import menuObj from './menuConstants';

const styles = () => ({
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  header: {
    background: 'linear-gradient(to right, #fd651a 0%,#fb6529 24%,#f3635c 76%,#f1636c 100%)',
  },
});

function ButtonAppBar(props) {
  const {
    classes, open, handleMenu, handleMenuClose,
  } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.header}>
        <Toolbar>
          <Hidden mdUp>
            <IconButton className={classes.menuButton} color="contrast" aria-label="Menu">
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Typography type="title" color="inherit" className={classes.flex}>
            Nuevo Monit
          </Typography>
          <Hidden smDown>
            <ul className="header__menu-items">
              {
                menuObj.primaryMenu.map(e => (
                  <li key={e.key} className={e.classes}>
                    <NavLink to={e.link} exact activeClassName="nm-active">
                      <Button color="default">
                        {e.name}
                      </Button>
                    </NavLink>
                  </li>
                  ))
              }
            </ul>
            {
            // <ul className="header__right-menu">
            //   {
            //     menuObj.rightMenu.map(e => (
            //       <li key={e.key} className={e.classes}>
            //         <NavLink to={e.link} exact activeClassName="nm-active" onClick={handleMenu}>
            //           <img width="30" height="30" src="https://s3.amazonaws.com/assets.materialup.com/users/pictures/000/117/222/thumb/?1507709155" alt="" />
            //         </NavLink>
            //       </li>
            //       ))
            //   }
            // </ul>
            }
            <Manager>
              <Target>
                <Button
                  aria-owns={open ? 'menu-list' : null}
                  aria-haspopup="true"
                  onClick={handleMenu}
                >
                  <img width="30" height="30" style={{ 'border-radius': '50%' }} src="https://s3.amazonaws.com/assets.materialup.com/users/pictures/000/117/222/thumb/?1507709155" alt="" />
                </Button>
              </Target>
              <Popper
                placement="bottom-start"
                eventsEnabled={open}
                className={classNames({ [classes.popperClose]: !open })}
              >
                <ClickAwayListener onClickAway={handleMenuClose}>
                  <Grow in={open} id="menu-list" style={{ transformOrigin: '0 0 0' }}>
                    <MenuList
                      id="menu-appbar"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={open}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
                    </MenuList>
                  </Grow>
                </ClickAwayListener>
              </Popper>
            </Manager>
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool,
  handleMenu: PropTypes.func.isRequired,
  handleMenuClose: PropTypes.func.isRequired,
};

ButtonAppBar.defaultProps = {
  open: false,
};

export default withStyles(styles)(ButtonAppBar);
