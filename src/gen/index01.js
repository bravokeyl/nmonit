import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


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

function Generation(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
    Generation
    
    </div>
  );
}

Generation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Generation);