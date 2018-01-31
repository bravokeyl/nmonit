import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';

const styles = () => ({
  root: {
    padding: 16,
  },
  flex: {
    display: 'flex',
    flex: 1,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    margin: 24,
    padding: 16,
  },
});

class NuevoSystemImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            SystemImage {this.state.value}
          </Grid>
        </Grid>
      </div>
    );
  }
}

NuevoSystemImage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NuevoSystemImage);
