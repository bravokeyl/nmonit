import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

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
    classes, open, handleMenu, handleMenuClose, logOut,
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
            <ul className="header__right-menu">
              {
                menuObj.rightMenu.map(e => (
                  <li key={e.key} className={e.classes}>
                    <NavLink to={e.link} exact activeClassName="nm-active" onClick={handleMenu}>
                      <img width="30" height="30" src="https://s3.amazonaws.com/assets.materialup.com/users/pictures/000/117/222/thumb/?1507709155" alt="" />
                    </NavLink>
                    {
                      e.hasChildren ?
                        <ClickAwayListener onClickAway={handleMenuClose}>
                          <Grow in={open} id="menu-list">
                            <MenuList
                              id="menu-appbar"
                              className="header__right-menu-click"
                              open={open}
                              onClose={handleMenuClose}
                            >
                              {
                                e.children.map(c => (
                                  <MenuItem key={c.key} onClick={handleMenuClose}>
                                    <NavLink to={c.link}>
                                      {c.name}
                                    </NavLink>
                                  </MenuItem>
                                ))
                              }
                              <Button onClick={logOut}>
                                logOut
                              </Button>
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
  open: PropTypes.bool,
  handleMenu: PropTypes.func.isRequired,
  handleMenuClose: PropTypes.func.isRequired,
  logOut: PropTypes.func.isRequired,
};

ButtonAppBar.defaultProps = {
  open: false,
};

export default withStyles(styles)(ButtonAppBar);
