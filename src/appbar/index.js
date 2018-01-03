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
import MenuIcon from 'material-ui-icons/Menu';

const styles = theme => ({
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
    background: "linear-gradient(to right, #fd651a 0%,#fb6529 24%,#f3635c 76%,#f1636c 100%)"
  }
});

function ButtonAppBar(props) {
  const { classes } = props;
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
            <ul className={classes.flex}>
              <NavLink to="/" exact activeClassName="nm-active">
                <Button color="contrast">
                  Overview
                </Button>
              </NavLink>
              <NavLink to="/d" activeClassName="nm-active">
                <Button color="contrast">Dashboard</Button>
              </NavLink>
              <NavLink to="/l" activeClassName="nm-active">
                <Button color="contrast">
                  Logs
                </Button>
              </NavLink>
              {
              // <Link to="/g">
              //   <Button color="contrast">
              //     Generation
              //   </Button>
              // </Link>

              <NavLink to="/e" activeClassName="nm-active">
                <Button color="contrast">
                  Events
                </Button>
              </NavLink>
              }
              <NavLink to="/p" activeClassName="nm-active">
                <Button  color="contrast">
                  Profile
                </Button>
              </NavLink>
            </ul>
          </Hidden>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  // linkButton: PropTypes.boolean
};

export default withStyles(styles)(ButtonAppBar);
