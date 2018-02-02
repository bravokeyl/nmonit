import React, { Fragment } from 'react';
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
import List, { ListItem, ListItemText } from 'material-ui/List';
import Grow from 'material-ui/transitions/Grow';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';

import menuObj from './menuConstants';
import Plants from '../common/plants';
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
  pvchooser: {
    width: '100%',
    maxWidth: 250,
    borderLeft: '1px solid rgba(238,238,238,0.3)',
    borderRight: '1px solid rgba(238,238,238,0.3)',
    background: 'rgba(187, 187, 187, 0.04)',
  },
});

function ButtonAppBar(props) {
  const {
    classes, isMenuOpen, handleMenu, handleMenuClose, logOut,
    handleDialogClose, isDialogOpen, handleDialogClick, selectedPVSystem,
  } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.header}>
        <Toolbar>
          <Hidden mdUp>
            <IconButton className={classes.menuButton} color="default" aria-label="Menu">
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
          </Hidden>
          <Hidden xsDown>
            <List component="nav" disablePadding className={classes.pvchooser}>
              <ListItem
                button
                aria-haspopup="true"
                aria-controls="pv-chooser"
                aria-label={selectedPVSystem.name}
                onClick={e => handleDialogClick(e)}
              >
                <ListItemText
                  disableTypography
                  secondary={<Typography noWrap style={{ color: '#fff' }}>{selectedPVSystem.location}</Typography>}
                  primary={<Typography type="title" style={{ color: '#fff' }}>{selectedPVSystem.name}</Typography>}
                />
              </ListItem>
            </List>
            <Dialog fullWidth onClose={handleDialogClose} aria-labelledby="simple-dialog-title" open={isDialogOpen}>
              <DialogTitle id="simple-dialog-title">Select PV System</DialogTitle>
              <Divider />
              <div>
                <List>
                  {Plants.map(pvs => (
                    <Fragment key={pvs.key}>
                      <ListItem button onClick={() => handleDialogClose(pvs)} >
                        <ListItemText primary={pvs.name} secondary={pvs.location} />
                      </ListItem>
                      <Divider />
                    </Fragment>
                  ))}
                </List>
              </div>
            </Dialog>
          </Hidden>
          <ul className="header__right-menu">
            {
              menuObj.rightMenu.map(e => (
                <li key={e.key} className={e.classes}>
                  <Button className={classes.button} dense onClick={handleMenu}>
                    <img width="30" height="30" src="https://s3.amazonaws.com/nuevo-data/avatars/bravokeyl.jpeg" alt="User Avatar" />
                  </Button>
                  {
                    e.hasChildren && isMenuOpen ?
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
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  isMenuOpen: PropTypes.bool,
  isDialogOpen: PropTypes.bool.isRequired,
  handleMenu: PropTypes.func.isRequired,
  handleMenuClose: PropTypes.func.isRequired,
  logOut: PropTypes.func.isRequired,
  handleDialogClose: PropTypes.func.isRequired,
  handleDialogClick: PropTypes.func.isRequired,
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

ButtonAppBar.defaultProps = {
  isMenuOpen: false,
};

export default withStyles(styles)(ButtonAppBar);
