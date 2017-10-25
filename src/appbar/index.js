import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

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
          <Typography type="title" color="inherit" className={classes.flex}>
            Nuevo Monit
          </Typography>
          <ul className={classes.flex}>
              <Link to="/o">
                <Button color="contrast">
                  Overview
                </Button>
              </Link>
              <Link to="/d">
                <Button color="contrast">Dashboard</Button>
              </Link>
              <Link to="/l">
                <Button color="contrast">
                  Logs
                </Button>
              </Link>
              <Link to="/e">
                <Button color="contrast">
                  Events
                </Button>
              </Link>
              <Link to="/p">
                <Button  color="contrast">
                  Profile
                </Button>
              </Link>
            </ul>
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
