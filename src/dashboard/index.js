import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';

import NuevoDashboardComp from './dashboard';
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
    const intervalId = setInterval(self.updateliveTimestamp, 60 * 1000);
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
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).key;
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
    bkLog('%c Updating timestamp', 'color: #fff;background: black;');
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
    return (
      <NuevoDashboardComp
        {...this.props}
        handleChange={this.handleChange}
        state={{ ...this.state }}
      />
    );
  }
}

NuevoDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

export default withStyles(styles)(NuevoDashboard);
