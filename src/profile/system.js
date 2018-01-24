import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import List, { ListItem } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';

import clearAPICache from '../common/utils';

const styles = theme => ({
  root: {
    padding: 16,
  },
  flex: {
    display: 'flex',
    flex: 1,
  },
  card: {
    display: "flex",
    flexDirection: 'column',
    margin: 24,
    padding: 16,
  },
});

class System extends Component {
  constructor(props){
    super(props);
    this.state = {
      value: 0,
    }
  }
  clearCacheHandler(){
    clearAPICache();
  }
  render(){
    const { classes } = this.props;
    const system = JSON.parse(localStorage.getItem('nuser')).plant;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <List>
              <ListItem>
                PV system name: {system}
              </ListItem>
              <ListItem>
                Time zone : UTC+5:30
              </ListItem>
              <ListItem>
                Installation Date : Sep 28th 2017
              </ListItem>
              <ListItem>
                Currency: INR
              </ListItem>
            </List>
            <Typography type="subheading">Address:</Typography>
          </Grid>
          <Grid item sm={12}>
            <Button onClick={this.clearCacheHandler}>
              Clear Cache
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }

}


System.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(System);
