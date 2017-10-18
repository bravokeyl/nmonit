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
});

function ButtonAppBar(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            Nuevo Monit
          </Typography>
            <ul>
              <Link to="/">
                <Button color="contrast">
                  Dashboard
                </Button>
              </Link>
              <Link to="/gen">
                <Button color="contrast">Generation</Button>
              </Link>
              <Link to="/logs">
                <Button color="contrast">
                  Logs
                </Button>
              </Link>
              <Link to="/profile">
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
