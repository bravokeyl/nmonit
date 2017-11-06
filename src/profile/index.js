import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Email from 'material-ui-icons/Email';
import Link from 'material-ui-icons/Link';
import Tabs, { Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

import { signOut } from '../aws/cognito';

import avatar from './avatar.jpg';
import Contacts from './contacts';
import System from './system';
import SystemImage from './image';
import Notifications from './notifications';

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
    margin: 24,
    padding: 16,
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
  media: {
    height: 200,
  },
  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: "50%"
  },
  uid: {
    fontSize: 12,
  },
  social: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    padding: '0 5px',
  }
});

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
      value: 0,
    }
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
  }
  handleSignOut = () => {
    signOut();
    this.props.authHandler(this.props.history);
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };
  handleChangeIndex = index => {
    this.setState({ value: index });
  };
  render(){
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <div className={classes.avatarWrap}>
                <img src={avatar} className={classes.avatar} />
              </div>
              <Typography type="title" gutterBottom align="center">
                bravokeyl <small className={classes.uid}>#007</small>
              </Typography>
              <Typography gutterBottom align="center">
                Product Engineer
              </Typography>
              <div className={classes.social}>
                <Email className={classes.icon} />
                <Link className={classes.icon} />
              </div>
              <Button color="primary" onClick={this.handleSignOut} style={{margin: "8px 16px"}}>
                signOut
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Card className={classes.card}>
              <Tabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
                fullWidth
              >
                <Tab label="System" />
                <Tab label="Image"/>
                <Tab label="Contacts"/>
                <Tab label="Notifications"/>
              </Tabs>
              <SwipeableViews
                axis='x'
                index={value}
                onChangeIndex={this.handleChangeIndex}>
                <System />
                <SystemImage />
                <Contacts />
                <Notifications />
              </SwipeableViews>
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
