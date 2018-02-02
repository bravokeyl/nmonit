import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import Switch from 'material-ui/Switch';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';


import moment from 'moment';

import offlineFetch from '../common/fetch-cache';
import config from '../aws';
import { getIdToken } from '../aws/cognito';
import { bkLog } from '../common/utils';

const API_KEY = config.LocalAPIKey;
const APIHEADERS = {
  headers: {
    'X-Api-Key': API_KEY,
  },
  method: 'GET',
  offline: {
    storage: 'localStorage',
    timeout: 5000,
    expires: 10000,
    debug: true,
    renew: false,
    retries: 3,
    retryDelay: 1000,
  },
};

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
    margin: 16,
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
  icon: {
    width: 48,
    height: 48,
    paddingLeft: 16,
    fill: '#f96f40',
  },
  info: {
    marginBottom: 12,
    paddingLeft: 16,
    color: theme.palette.text.secondary,
  },
  chart: {
    height: 300,
  },
  opacity: {
    opacity: 0.5,
  },
});

const util = (d) => {
  let o = 0;
  if (Array.isArray(d)) {
    o = d.reduce((sum, value) => Number(parseFloat(sum)) + Number(parseFloat(value)), 0);
    o = Number(parseFloat(o).toFixed(2));
  } else {
    o = Number(parseFloat(d).toFixed(2));
  }
  return o;
};

class NuevoDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progessL: true,
      idToken: (getIdToken() ? getIdToken().jwtToken : '') || '',
      intervalId: 0,
      liveTimestampId: 0,
      c1Voltage: 0,
      c5Voltage: 0,
      c6Voltage: 0,
      c1Current: 0,
      c5Current: 0,
      c6Current: 0,
      c1Power: 0,
      c5Power: 0,
      c6Power: 0,
      liveTimestamp: false,
      relativeTimestamp: 0,
      isLive: false,
    };
  }
  componentDidMount() {
    bkLog('Dashboard component did mount', this.props.apiPath);
    const self = this;
    const intervalId = setInterval(self.updateliveTimestamp, 10 * 1000);
    self.setState({ liveTimestampId: intervalId });
    this.getLiveData();
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    clearInterval(this.state.liveTimestampId);
  }

  getLive = () => {
    if (this.state.isLive) {
      this.getLiveData();
    } else {
      clearInterval(this.state.intervalId);
    }
  };

  getLiveData = () => {
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    APIHEADERS.headers.Authorization = this.state.idToken;
    for (let i = 1; i < 7; i += 1) {
      const url = `${baseApiURL}l?c=${i}`;
      const self = this;
      offlineFetch(url, APIHEADERS)
        .then(response => response.json())
        .then((response) => {
          const voltage = `c${i}Voltage`;
          self.setState({
            [voltage]: response.voltage,
            [`c${i}Current`]: response.current,
            [`c${i}Power`]: response.power,
          });
          if (i === 4) {
            self.setState({
              progessL: false,
              liveTimestamp: response.timestamp,
              relativeTimestamp: moment(response.timestamp).fromNow(),
            });
          }
          return response;
        });
    }
  };
  handleChange = () => (event, checked) => {
    this.setState({ isLive: checked });
    const self = this;
    self.getLiveData();
    const intervalId = setInterval(self.getLive, 10 * 1000);
    self.setState({ intervalId });
  };
  updateliveTimestamp = () => {
    this.setState({
      relativeTimestamp: moment(this.state.liveTimestamp).fromNow(),
    });
  }
  transformData = (d) => {
    d.map((mdata) => {
      const data = mdata;
      data.c2 = util(data.c2);
      data.c3 = util(data.c3);
      data.c4 = util(data.c4);
      if (data.c2 < 0) data.c2 = 0;
      if (data.c3 < 0) data.c3 = 0;
      if (data.c4 < 0) data.c4 = 0;
      let mdhr = data.dhr;
      if (mdhr) {
        mdhr = mdhr.split('/').reverse();
        [mdhr] = mdhr;
        data.day = `Hour ${Number(mdhr)} - ${(Number(mdhr) + 1)}`;
      }
      let mddt = data.ddt;
      if (mddt) {
        data.month = moment(mddt).format('MMM Do');
        mddt = mddt.split('/').reverse();
        [mddt] = mddt;
      }
      return d;
    });
    return d;
  }
  render() {
    const { classes, selectedPVSystem } = this.props;
    return (
      <div className={classes.root}>
        <Typography type="title" style={{ margin: 16 }}>
          PVSystem: {selectedPVSystem.name}
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 1: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ? <CircularProgress size={24} /> : this.state.c1Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 1: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {
                      this.state.progessL ?
                        <CircularProgress size={24} /> : this.state.c1Current
                    } Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 1: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ? <CircularProgress size={24} /> : this.state.c1Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            {}
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 2: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ? <CircularProgress size={24} /> : this.state.c5Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 2: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ?
                      <CircularProgress size={24} /> : this.state.c5Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 2: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ? <CircularProgress size={24} /> : this.state.c5Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            {}
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 3: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ? <CircularProgress size={24} /> : this.state.c6Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 3: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ?
                      <CircularProgress size={24} /> : this.state.c6Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon} />
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 3: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL ? <CircularProgress size={24} /> : this.state.c6Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            {}
          </Grid>
        </Grid>
        <div style={{
            position: 'fixed',
            bottom: 50,
            right: 50,
            zIndex: 101,
          }}
        >
          <Switch
            checked={this.state.isLive}
            onChange={this.handleChange('checkedA')}
            aria-label="checkedA"
          />
        </div>
      </div>
    );
  }
}

NuevoDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  apiPath: PropTypes.string.isRequired,
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

export default withStyles(styles)(NuevoDashboard);
