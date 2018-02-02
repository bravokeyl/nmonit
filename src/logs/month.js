/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import compose from 'recompose/compose';
import withWidth from 'material-ui/utils/withWidth';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Dialog, { DialogTitle, DialogContent, DialogActions } from 'material-ui/Dialog';
import { LinearProgress } from 'material-ui/Progress';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
// import Hidden from 'material-ui/Hidden';

import moment from 'moment';
import _ from 'lodash';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import EnhancedTable from '../common/table';
import offlineFetch from '../common/fetch-cache';
import { Colors } from '../common/constants';

import config from '../aws';
import { getIdToken } from '../aws/cognito';
import { channelMap, bkLog } from '../common/utils';

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

const styles = theme => ({
  root: {
    padding: 0,
  },
  flex: {
    display: 'flex',
    flex: 1,
  },
  paper: {
    margin: 1,
    padding: 8,
    minHeight: 200,
    [theme.breakpoints.up('sm')]: {
      margin: 16,
      padding: 16,
      minHeight: 350,
    },
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

const months = moment.months();

class NuevoMonth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: getIdToken().jwtToken || '',
      energyMonth: [],
      month: moment().format('YYYY/MM'),
      monthprogress: true,
      dialogOpen: false,
      selectedMonth: moment().format('MMMM'),
      selectedYear: moment().format('YYYY'),
    };
    this.changeMonthEnergy = this.changeMonthEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    bkLog('NuevoMonth component did mount', this.props.apiPath);
    const { month } = this.state;
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    APIHEADERS.headers.Authorization = this.state.idToken;
    const dayURL = `${baseApiURL}d?ddm=${month}`;
    const self = this;

    offlineFetch(dayURL, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let de;
        if (response.energy) {
          de = self.transformData(response.energy, apiPath);
        } else {
          de = self.transformData([response], apiPath);
        }
        self.setState({
          energyMonth: de,
          monthprogress: false,
        });
        bkLog('TME:', self.state.energyMonth);
        return response;
      });
  }
  componentWillReceiveProps(n) {
    bkLog('NuevoMonth receiving new props:', n, this.props);
    if (n.month) {
      const nd = moment(n.month, 'YYYY/MM').format('YYYY/MM');
      bkLog('PROPS Month', n.month, nd);
      this.setState({
        selectedYear: moment(nd).format('YYYY'),
      });
      this.changeMonthEnergy(nd, false);
    }
  }

  transformData = (tdd) => {
    let d = tdd;
    if (d) {
      d.map((dmdata) => {
        let data = dmdata;
        data = channelMap(data);
        let dtdhr = data.dhr;
        if (dtdhr) {
          dtdhr = dtdhr.split('/').reverse();
          [dtdhr] = dtdhr;
          data.day = `Hour ${Number(dtdhr)} - ${(Number(dtdhr) + 1)}`;
        }
        let dtddt = data.ddt;
        if (dtddt) {
          data.month = moment(dtddt).format('MMM Do YYYY');
          data.xm = moment(dtddt).format('MMM Do');
          dtddt = dtddt.split('/').reverse();
          [dtddt] = dtddt;
        }
        data.ltotal = Number(parseFloat(data.c1 + data.c2 + data.c3).toFixed(2));
        data.stotal = Number(parseFloat(data.c4 + data.c5 + data.c6).toFixed(2));
        return d;
      });
    } else {
      d = [];
    }
    return d;
  }
  changeMonthEnergy = (mnth, y) => {
    let month = mnth;
    bkLog('Month', month);
    const monthdiff = moment().diff(moment(month, 'YYYY/MM'), 'days');
    bkLog('Month Diff', monthdiff);
    const monthApiHeaders = APIHEADERS;
    if (monthdiff >= 1) {
      monthApiHeaders.offline.expires = 1000 * 60 * 60 * 24 * 28;
    } else {
      monthApiHeaders.offline.expires = 1000 * 60 * 5;
    }
    let ddm = moment(month).format('YYYY/MM');
    if (y) {
      const monthYear = `${this.state.selectedYear}/${month}`;
      month = `${this.state.selectedYear}/${month}`;
      ddm = moment(monthYear, 'YYYY/MMMM').format('YYYY/MM');
    }
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const url = `${baseApiURL}d?ddm=${ddm}`;
    const self = this;
    const prevMonth = this.state.selectedMonth;
    self.setState({
      monthprogress: true,
      selectedMonth: moment(ddm, 'YYYY/MM').format('MMMM'),
    });
    offlineFetch(url, monthApiHeaders)
      .then(response => response.json())
      .then((response) => {
        if (response.energy) {
          const de = self.transformData(response.energy);
          self.setState({
            energyMonth: de,
            monthprogress: false,
          });
        } else {
          self.setState({
            monthprogress: false,
            dialogOpen: true,
            selectedMonth: prevMonth,
          });
        }
        return response;
      });
  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handleSelectMonth = () => (event) => {
    bkLog('EVENT', event.target.value);
    this.changeMonthEnergy(event.target.value, true);
  };

  handleClick(data, e) {
    if (data) {
      bkLog('Month active label', data);
      this.props.indexV(e, 0, moment(data.activeLabel, 'MMM Do YYYY'));
    } else {
      bkLog('Clicked outside of the bars');
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} elevation={4}>
              <div className={classes.flex}>
                <Typography color="inherit" className={classes.flex}>
                 Month Energy ( Day wise ) - {this.state.selectedMonth}
                </Typography>
                <form className={classes.container}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="en-month">Month</InputLabel>
                    <Select
                      value={this.state.selectedMonth}
                      autoWidth
                      onChange={this.handleSelectMonth('selectedMonth')}
                      input={<Input id="en-month" />}
                    >
                      {
                        months.map(e => (
                          <MenuItem key={e} value={e}>{e}</MenuItem>))
                      }
                    </Select>
                  </FormControl>
                </form>
              </div>
              { this.state.monthprogress ? <LinearProgress /> : ''}
              <ResponsiveContainer height={350} className={this.state.monthprogress ? classes.opacity : 'bk-default'}>
                <BarChart
                  data={_.sortBy(this.state.energyMonth, ['ddt'])}
                  maxBarSize={30}
                  unit="kWh"
                  margin={
                    {
                      top: 20, right: 30, left: 20, bottom: 40,
                    }
                  }
                  onClick={this.handleClick}
                >
                  <XAxis dataKey="xm" angle={-45} textAnchor="end" interval={0} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="2 3" />
                  <Tooltip />
                  <Bar cursor="pointer" dataKey="R" stackId="a" fill={Colors.RPhaseColor} />
                  <Bar cursor="pointer" dataKey="Y" stackId="a" fill={Colors.YPhaseColor} />
                  <Bar cursor="pointer" dataKey="B" stackId="a" fill={Colors.BPhaseColor} />

                  <Bar cursor="pointer" dataKey="i1" stackId="b" fill={Colors.I1Color} />
                  <Bar cursor="pointer" dataKey="i2" stackId="b" fill={Colors.I2Color} />
                  <Bar cursor="pointer" dataKey="i3" stackId="b" fill={Colors.I3Color} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
            <EnhancedTable
              title="Day Wise Energy"
              tdata={this.state.energyMonth}
              thead={[
                {
                  label: 'Date', numeric: false, disablePadding: false, id: 'ddt',
                },
                {
                  label: 'Load', numeric: true, disablePadding: false, id: 'ltotal',
                },
                {
                  label: 'Solar', numeric: true, disablePadding: false, id: 'stotal',
                },
                {
                  label: 'R-Load', numeric: true, disablePadding: false, id: 'R',
                },
                {
                  label: 'Y-Load', numeric: true, disablePadding: false, id: 'Y',
                },
                {
                  label: 'B-Load', numeric: true, disablePadding: false, id: 'B',
                },
                {
                  label: 'Inv 1', numeric: true, disablePadding: false, id: 'i1',
                },
                {
                  label: 'Inv 2', numeric: true, disablePadding: false, id: 'i2',
                },
                {
                  label: 'Inv 3', numeric: true, disablePadding: false, id: 'i3',
                },
              ]}
            />
            <Dialog onClose={this.handleRequestClose} open={this.state.dialogOpen}>
              <DialogTitle>No data available</DialogTitle>
              <DialogContent>
              If you think this is an issue, please contact NuevoMonit support engineer.
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleRequestClose} color="primary">
                  Okay
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </div>
    );
  }
}

NuevoMonth.propTypes = {
  classes: PropTypes.object.isRequired,
  indexV: PropTypes.func.isRequired,
  apiPath: PropTypes.string.isRequired,
};

export default compose(withStyles(styles), withWidth())(withRouter(NuevoMonth));
