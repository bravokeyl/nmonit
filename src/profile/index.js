import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

import moment from 'moment';
import _ from 'lodash';

import { signOut } from '../aws/cognito';

const styles = theme => ({
  root: {
    padding: 16,
  },
  flex: {
    display: 'flex',
    flex: 1,
  },
  paper: {
    padding: 16,
    margin: 16,
    minHeight: 350,
    color: theme.palette.text.secondary,
  },
  card: {
    display: "flex",
    flexDirection: 'column',
    margin: 16,
  },
  details: {
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },
  content: {
    flex: 1,
    paddingBottom: '16px !important',
  },
  icon: {
    width: 48,
    height: 48,
    paddingLeft: 16,
    fill: "#f96f40",
  },
  info: {
    marginBottom: 12,
    paddingLeft: 16,
    color: theme.palette.text.secondary,
  },
  chart: {
    height: 300
  },
  opacity: {
    opacity: 0.5
  }
});

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
      progessL: true
    }
    this.handleSignOut = this.handleSignOut.bind(this);
  }
  handleSignOut = () => {
    signOut();
    console.log(this.props);
    this.props.authHandler(false);
  }
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.state.progressL}
        <Button color="primary" onClick={this.handleSignOut}>signOut</Button>
      </div>
    );
  }

}


Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);
