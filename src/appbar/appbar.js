import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
// import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Hidden from 'material-ui/Hidden';
import IconButton from 'material-ui/IconButton';
import { MenuItem, MenuList } from 'material-ui/Menu';
import MenuIcon from 'material-ui-icons/Menu';
import Grow from 'material-ui/transitions/Grow';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';

import menuObj from './menuConstants';
import logoW from './logow.png';
import mlogoW from './mlogow.png';

const styles = () => ({
  root: {
    width: '100%',
    position: 'fixed',
    top: 0,
    zIndex: 100,
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
  button: {
    paddingTop: 0,
    paddingBottom: 0,
  },
});

function ButtonAppBar(props) {
  const {
    classes, isMenuOpen, handleMenu, handleMenuClose, logOut,
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
          <div className={classes.flex}>
            <img src={logoW} height="64" alt="Nuevosol Company Logo" />
            <img src={mlogoW} style={{ display: 'none' }} height="64" alt="Nuevo Monit Product Logo" />
          </div>
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
            <ul className="header__right-menu">
              {
                menuObj.rightMenu.map(e => (
                  <li key={e.key} className={e.classes}>
                    <Button className={classes.button} dense onClick={handleMenu}>
                      <img width="30" height="30" src="https://s3.amazonaws.com/nuevo-data/avatars/bravokeyl.jpeg" alt="User Avatar" />
                    </Button>
                    {
                      e.hasChildren ?
                        <ClickAwayListener onClickAway={handleMenuClose}>
                          <Grow in={isMenuOpen} id="menu-list">
                            <MenuList
                              id="menu-appbar"
                              className="header__right-menu-dropdown"
                              open={isMenuOpen}
                              onClose={handleMenuClose}
                            >
                              {
                                e.children.map(c => (
                                  <MenuItem
                                    key={c.key}
                                    onClick={c.lo ? logOut : handleMenuClose}
                                    dense
                                  >
                                    {
                                      c.link ? (
                                        <NavLink to={c.link}>
                                          {c.name}
                                        </NavLink>
                                      ) : <span className="header__right-menu--logout">{c.name}</span>
                                    }
                                  </MenuItem>
                                ))
                              }
                            </MenuList>
                          </Grow>
                        </ClickAwayListener>
                        : null
                    }
                  </li>
                  ))
              }
            </ul>
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  isMenuOpen: PropTypes.bool,
  handleMenu: PropTypes.func.isRequired,
  handleMenuClose: PropTypes.func.isRequired,
  logOut: PropTypes.func.isRequired,
};

ButtonAppBar.defaultProps = {
  isMenuOpen: false,
};

export default withStyles(styles)(ButtonAppBar);
