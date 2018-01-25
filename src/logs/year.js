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
    retries: 1,
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

const years = ['2016', '2017', '2018'];
class YearGen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: getIdToken().jwtToken || '',
      energyYear: [],
      year: moment().format('YYYY/'),
      yearprogress: true,
      dialogOpen: false,
      selectedYear: moment().format('YYYY'),
    };
    this.changeYearEnergy = this.changeYearEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectYear = this.handleSelectYear.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    bkLog('YearGen component did mount', this.props.apiPath);
    const { year } = this.state;
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    APIHEADERS.headers.Authorization = this.state.idToken;
    const yearURL = `${baseApiURL}m?ddm=${year}`;
    const self = this;

    offlineFetch(yearURL, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let de;
        if (response.energy) {
          de = self.transformData(response.energy);
        } else {
          de = self.transformData([response]);
        }
        self.setState({
          energyYear: de[0],
          yearprogress: false,
          chartData: de[1],
        });
        return response;
      });
  }

  transformData = (d) => {
    let cdarr = [];
    const chartData = [
      { month: 'Jan', solar: 0, load: 0 },
      { month: 'Feb', solar: 0, load: 0 },
      { month: 'Mar', solar: 0, load: 0 },
      { month: 'Apr', solar: 0, load: 0 },
      { month: 'May', solar: 0, load: 0 },
      { month: 'Jun', solar: 0, load: 0 },
      { month: 'Jul', solar: 0, load: 0 },
      { month: 'Aug', solar: 0, load: 0 },
      { month: 'Sep', solar: 0, load: 0 },
      { month: 'Oct', solar: 0, load: 0 },
      { month: 'Nov', solar: 0, load: 0 },
      { month: 'Dec', solar: 0, load: 0 },
    ];
    if (d) {
      cdarr = _.sortBy(d, ['ddm']);
      cdarr.map((dta) => {
        let data = dta;
        data = channelMap(data);
        data.month = moment(data.ddm).format('MMM');
        chartData.map((mcd) => {
          const m = mcd;
          const dm = data.month.toLowerCase();
          const cdm = m.month.toLowerCase();
          if (dm === cdm) {
            m.solar = data.solar;
            m.load = data.load;
            m.R = data.R;
            m.Y = data.Y;
            m.B = data.B;
            m.i1 = data.i1;
            m.i2 = data.i2;
            m.i3 = data.i3;
            m.date = data.ddm;
          }
          return chartData;
        });
        data.md = data.ddm;
        data.ddm = moment(data.ddm).format('MMM YYYY');
        return cdarr;
      });
    } else {
      cdarr = [];
    }
    bkLog('CDD::::', chartData);
    return [cdarr, chartData];
  }
  changeYearEnergy = (year) => {
    const yearApiHeaders = APIHEADERS;
    yearApiHeaders.offline.expires = 1000 * 60 * 60;
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const url = `${baseApiURL}m?ddm=${year}`;
    const self = this;
    const prevYear = this.state.selectedYear;
    self.setState({
      yearprogress: true,
      selectedYear: year,
    });
    offlineFetch(url, yearApiHeaders)
      .then(response => response.json())
      .then((response) => {
        bkLog('Year Res:', response);
        if (response && !response.energy) {
          response.energy = [response];
        }
        if (response.energy) {
          const de = self.transformData(response.energy);
          bkLog('YEAR ENERGY:', de);
          self.setState({
            energyYear: de[0],
            yearprogress: false,
            chartData: de[1],
          });
        } else {
          self.setState({
            yearprogress: false,
            dialogOpen: true,
            selectedYear: prevYear,
          });
        }
        return response;
      });
  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handleSelectYear = () => (event) => {
    this.changeYearEnergy(event.target.value);
  };
  handleClick(data, e) {
    bkLog(data, e.target);
    if (data) {
      const cm = moment();
      const sm = moment(`${this.state.selectedYear} ${data.activeLabel}`, 'YYYY MMM');
      const mdiff = cm.diff(sm, 'days');
      if (mdiff >= 0) {
        this.props.indexV(e, 1, moment(data.activeLabel, 'MMM YYYY'));
      }
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
                 Year Energy ( Month wise ) - {this.state.selectedYear}
                </Typography>
                <form className={classes.container}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="en-year">Year</InputLabel>
                    <Select
                      value={this.state.selectedYear}
                      autoWidth
                      onChange={this.handleSelectYear('selectedYear')}
                      input={<Input id="en-year" />}
                    >
                      {
                        years.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)
                      }
                    </Select>
                  </FormControl>
                </form>
              </div>
              { this.state.yearprogress ? <LinearProgress /> : ''}
              <ResponsiveContainer
                height={350}
                className={this.state.yearprogress ? classes.opacity : 'bk-default'}
              >
                <BarChart
                  data={this.state.chartData}
                  maxBarSize={30}
                  unit="kWh"
                  margin={
                    {
                      top: 20, right: 30, left: 20, bottom: 40,
                    }
                  }
                  onClick={this.handleClick}
                >
                  <XAxis dataKey="month" angle={-45} textAnchor="end" interval={0} />
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
              title="Month Wise Energy"
              tdata={this.state.energyYear}
              thead={[
                {
                  label: 'Month', numeric: false, disablePadding: false, id: 'month',
                },
                {
                  label: 'Load', numeric: true, disablePadding: false, id: 'ytotal',
                },
                {
                  label: 'Solar', numeric: true, disablePadding: false, id: 'stotal',
                },
                {
                  label: 'R-Load', numeric: true, disablePadding: false, id: 'c2',
                },
                {
                  label: 'Y-Load', numeric: true, disablePadding: false, id: 'c3',
                },
                {
                  label: 'B-Load', numeric: true, disablePadding: false, id: 'c4',
                },
                {
                  label: 'Inv 1', numeric: true, disablePadding: false, id: 'c1',
                },
                {
                  label: 'Inv 2', numeric: true, disablePadding: false, id: 'c5',
                },
                {
                  label: 'Inv 3', numeric: true, disablePadding: false, id: 'c6',
                },
              ]}
            />
            <Dialog onRequestClose={this.handleRequestClose} open={this.state.dialogOpen}>
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

YearGen.propTypes = {
  classes: PropTypes.object.isRequired,
  apiPath: PropTypes.string.isRequired,
  indexV: PropTypes.func.isRequired,
};

export default compose(withStyles(styles), withWidth())(withRouter(YearGen));
