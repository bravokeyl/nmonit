import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Email from 'material-ui-icons/Email';
import Link from 'material-ui-icons/Link';
import Tabs, { Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import Card from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

import config from '../aws';
import { getCurrentUserName } from '../aws/cognito';
import offlineFetch from '../common/fetch-cache';
import { bkLog } from '../common/utils';

import avatar from './avatar200.png';
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
    display: 'flex',
    flexDirection: 'column',
    margin: 24,
    padding: 16,
  },
  tabcard: {
    display: 'flex',
    flexDirection: 'column',
    margin: 24,
  },
  details: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
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
    borderRadius: '50%',
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
  },
});

const API_KEY = config.LocalAPIKey;
const APIHEADERS = {
  headers: {
    'X-Api-Key': API_KEY,
  },
  method: 'GET',
  offline: {
    storage: 'localStorage',
    timeout: 5000,
    expires: 300000,
    debug: true,
    renew: false,
    retries: 3,
    retryDelay: 1000,
  },
};

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      user: {
        name: 'Unknown',
        uname: 'Unknown',
        uid: '000',
        designation: 'Unknown',
        role: 'Unknown',
        avatar,
      },
    };
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
  }

  componentDidMount() {
    const user = getCurrentUserName();
    if (user) {
      APIHEADERS.offline.expires = 30 * 24 * 60 * 60 * 1000;
      // APIHEADERS.headers.Authorization = this.state.idToken;
      const purl = `https://api.blufieldsenergy.com/v1/me?un=${user}`;
      const self = this;
      offlineFetch(purl, APIHEADERS)
        .then(response => response.json())
        .then((response) => {
          bkLog(response);
          if (response) {
            self.setState({
              user: response.user[0],
            });
          } else {
            self.handleSignOut();
          }
          return response;
        })
        .catch((err) => {
          console.error('Profile Fetch Error:', err);
        });
    } else {
      this.handleSignOut();
    }
  }

  handleSignOut = () => {
    this.props.authHandler(this.props.history);
  };

  handleChange = (event, value) => this.setState({ value });

  handleChangeIndex = index => this.setState({ value: index });

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <div className={classes.avatarWrap}>
                <img src={this.state.user.avatar} className={classes.avatar} alt="Profile Avatar" title={this.state.user.name} />
              </div>
              <Typography type="title" gutterBottom align="center">
                {this.state.user.name} <small className={classes.uid}>#{this.state.user.uid}</small>
              </Typography>
              <Typography gutterBottom align="center">
                {this.state.user.designation}
              </Typography>
              <div className={classes.social}>
                <Email className={classes.icon} />
                <Link href="/" className={classes.icon} />
              </div>
              <Button color="primary" onClick={this.handleSignOut} style={{ margin: '8px 16px' }}>
                signOut
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Card className={classes.tabcard}>
              <Tabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
                fullWidth
                style={{ borderBottom: '1px solid #eee' }}
              >
                <Tab label="System" />
                <Tab label="Image" />
                <Tab label="Contacts" />
                <Tab label="Notifications" />
              </Tabs>
              <SwipeableViews
                axis="x"
                index={value}
                onChangeIndex={this.handleChangeIndex}
              >
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
  authHandler: PropTypes.func.isRequired,
};

export default withStyles(styles)(Profile);
