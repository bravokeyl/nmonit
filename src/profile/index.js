import React, { Component } from 'react';
import PropTypes from 'prop-types';


import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Card from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';


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
    this.props.authHandler(this.props.history);
  }
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <Button color="primary" onClick={this.handleSignOut}>signOut</Button>
            </Card>
          </Grid>
        </Grid>

      </div>
    );
  }

}


Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);
