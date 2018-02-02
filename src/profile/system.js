import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import List, { ListItem } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';

import clearAPICache from '../common/utils';

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

class NuevoSystem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'Sep 28th 2017',
    };
  }
  render() {
    const { classes, selectedPVSystem } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <List>
              <ListItem>
                PV system name: {selectedPVSystem.name}
              </ListItem>
              <ListItem>
                Time zone : UTC+5:30
              </ListItem>
              <ListItem>
                Installation Date : {this.state.value}
              </ListItem>
              <ListItem>
                Currency: INR
              </ListItem>
            </List>
            <Typography type="subheading">Address:</Typography>
          </Grid>
          <Grid item sm={12}>
            <Button onClick={clearAPICache}>
              Clear Cache
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}


NuevoSystem.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

export default withStyles(styles)(NuevoSystem);
