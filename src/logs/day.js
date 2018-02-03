/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Dialog, { DialogTitle, DialogContent, DialogActions } from 'material-ui/Dialog';
import { LinearProgress } from 'material-ui/Progress';

import 'react-dates/initialize';
import { SingleDatePicker, isInclusivelyBeforeDay } from 'react-dates';

import moment from 'moment';
import _ from 'lodash';

import ReactHighcharts from 'react-highcharts';
import HighchartsMore from 'highcharts-more';
import HighchartsExporting from 'highcharts-exporting';
import { Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import 'react-dates/lib/css/_datepicker.css';

import EnhancedTable from '../common/table';
import offlineFetch from '../common/fetch-cache';
import { Colors } from '../common/constants';
import config from '../aws';
import { getIdToken } from '../aws/cognito';
import { channelMap, bkLog } from '../common/utils';

HighchartsMore(ReactHighcharts.Highcharts);
HighchartsExporting(ReactHighcharts.Highcharts);

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
  panelHeader: {
    display: 'flex',
    flex: 1,
    borderBottom: '1px solid #eee',
    paddingBottom: 10,
  },
  panelTitle: {
    flex: 1,
    alignSelf: 'center',
  },
});

const highLineconfig = {
  chart: {
    zoomType: 'x',
    type: 'area',
  },
  title: {
    text: 'Power over time',
  },
  subtitle: {
    text: document.ontouchstart === undefined ?
      'Click and drag in the plot to zoom in' : 'Pinch the chart to zoom in',
  },
  legend: {
    enabled: true,
  },
  yAxis: {
    title: {
      text: 'Power in Watts',
    },
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
      month: '%e. %b',
      year: '%b',
    },
    crosshair: true,
  },
  tooltip: {
    shared: true,
    /* eslint-disable object-shorthand */
    formatter: function pformatter() {
      let out = '';
      const { points } = this;
      if (points) {
        let sum = 0;
        points.forEach((e, i) => {
          sum += Number(e.y);
          if (i === 0) {
            out += `<span style="font-size:10px;"><b>${moment(e.x).format('MMMM Do YYYY, HH:mm')}</b></span><br/>`;
          }
          out += `<span style="color:${e.color}">\u25CF</span> ${e.series.name}: <b>${e.y} W</b><br/>`;
        });
        out += `<b>Total Power: ${Number(parseFloat(sum).toFixed(2))} W</b>`;
      }
      return out;
    },
    /* eslint-disable object-shorthand */
  },
  series: [
    {
      name: 'Inverter 1',
      color: Colors.I1Color,
      data: [

      ],
    },
    {
      name: 'Inverter 2',
      color: Colors.I2Color,
      data: [

      ],
    },
    {
      name: 'Inverter 3',
      color: Colors.I3Color,
      data: [

      ],
    },
    {
      name: 'R-Phase',
      color: Colors.RPhaseColor,
      visible: false,
      data: [

      ],
    },
    {
      name: 'Y-Phase',
      color: Colors.YPhaseColor,
      visible: false,
      data: [

      ],
    },
    {
      name: 'B-Phase',
      visible: false,
      color: Colors.BPhaseColor,
      data: [

      ],
    },
  ],
};

class NuevoDay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: getIdToken().jwtToken || '',
      energyDay: [],
      date: moment().format('YYYY/MM/DD'),
      startDate: moment(),
      focused: false,
      dialogOpen: false,
      highPowerLine: highLineconfig,
      solarPowerTotal: 0,
    };
    ReactHighcharts.Highcharts.setOptions({
      global: {
        useUTC: false,
      },
    });
  }

  componentDidMount() {
    bkLog('NuevoDay component did mount', this.props.apiPath);
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const { date } = this.state;
    APIHEADERS.headers.Authorization = this.state.idToken;
    let url = `${baseApiURL}h?dhr=${date}`;
    const self = this;
    offlineFetch(url, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        const de = self.transformData(response.energy);
        self.setState({
          energyDay: de,
        });
        return response;
      });

    url = `${baseApiURL}power?date=${date}`;

    offlineFetch(url, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let pow = [];
        if (response.power) {
          pow = self.tranformPower(response.power);
          self.updatePowerCharts(pow);
          bkLog('Power:', response.power.length);
        }
        return response;
      });
  }

  componentWillReceiveProps(n) {
    bkLog('NuevoDay receiving new props:', n, this.props);
    if (n.date) {
      const nd = moment(n.date, 'YYYY/MM/DD');
      bkLog('Day PROPS', nd.format('YYYY/MM/DD'));
      this.changeEnergy(nd);
      this.handlePower(nd);
    }
  }

  changeChartType = type => () => {
    const chart = this.chart.getChart();
    chart.update({
      chart: {
        type,
      },
    });
  }

  changeChartGroup = group => () => {
    const chart = this.chart.getChart();
    switch (group) {
      case 'grid':
        chart.series[0].update({
          visible: false,
        });
        chart.series[1].update({
          visible: false,
        });
        chart.series[2].update({
          visible: false,
        });
        chart.series[3].update({
          visible: true,
        });
        chart.series[4].update({
          visible: true,
        });
        chart.series[5].update({
          visible: true,
        });

        break;
      case 'solar':
        chart.series[0].update({
          visible: true,
        });
        chart.series[1].update({
          visible: true,
        });
        chart.series[2].update({
          visible: true,
        });
        chart.series[3].update({
          visible: false,
        });
        chart.series[4].update({
          visible: false,
        });
        chart.series[5].update({
          visible: false,
        });
        break;
      default:
        chart.series[0].update({
          visible: true,
        });
        chart.series[1].update({
          visible: true,
        });
        chart.series[2].update({
          visible: true,
        });
        chart.series[3].update({
          visible: true,
        });
        chart.series[4].update({
          visible: true,
        });
        chart.series[5].update({
          visible: true,
        });
    }
  };

  tranformPower = (d) => {
    const pow = {
      i1: [], i2: [], i3: [], R: [], Y: [], B: [],
    };
    const carr = ['i1', 'i2', 'i3', 'R', 'Y', 'B'];
    try {
      d.map((e) => {
        for (let c = 1; c < 7; c += 1) {
          let chan = `i${c}`;
          chan = carr[c - 1];
          const obj = e[chan];
          if (obj) {
            const keys = Object.keys(obj);
            let k = 0;
            const len = keys.length;
            const dq = e.q;
            for (; k < len; k += 1) {
              const dmh = moment(`${dq}'/'${keys[k]}`, 'YYYY/MM/DD/HH-mm');
              const dm = dmh.format('x');
              const chr = dmh.format('HH');
              if (chan === 'i1' || chan === 'i2' || chan === 'i3') {
                if (chr >= 6 && chr <= 18) {
                  pow[chan].push([Number(dm), obj[keys[k]].appPower]);
                } else {
                  pow[chan].push([Number(dm), 0]);
                }
              } else {
                pow[chan].push([Number(dm), obj[keys[k]].appPower]);
              }
            }
          } else {
            console.warn('Power transform error: No obj', e, chan, obj);
          }
        }
        return pow;
      });
    } catch (e) {
      console.error('Power transform error', e);
    }

    bkLog('Pow Trans:', pow);
    return pow;
  }
  transformData = (ddata) => {
    let d = ddata;
    if (d) {
      d.map((dt) => {
        let data = dt;
        data = channelMap(data);
        data.load = parseFloat(Number(data.R + data.Y + data.B)).toFixed(2);
        data.solar = parseFloat(Number(data.i1 + data.i2 + data.i3)).toFixed(2);
        let dtdhr = data.dhr;
        if (dtdhr) {
          dtdhr = dtdhr.split('/').reverse();
          [dtdhr] = dtdhr;
          data.day =
          `Hour ${Number(dtdhr)} - ${(Number(dtdhr) + 1)}`;
        }
        let dtddt = data.ddt;
        if (dtddt) {
          data.month = moment(dtddt).format('MMM Do');
          [dtddt] = dtddt.split('/').reverse();
          [dtddt] = dtddt;
        }
        return d;
      });
    } else {
      d = [];
    }
    return d;
  }
  changeEnergy = (date) => {
    const datediff = moment().diff(date, 'days');
    const dateApiHeaders = APIHEADERS;
    if (datediff >= 1) {
      dateApiHeaders.offline.expires = 1000 * 60 * 60 * 24;
    } else {
      dateApiHeaders.offline.expires = 1000 * 60 * 5;
    }
    const dhr = moment(date).format('YYYY/MM/DD');
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const url = `${baseApiURL}h?dhr=${dhr}`;
    const self = this;
    self.setState({
      progress: true,
    });

    offlineFetch(url, dateApiHeaders)
      .then(response => response.json())
      .then((response) => {
        if (response.energy) {
          const de = self.transformData(response.energy);
          self.setState({
            startDate: date,
            date: moment(date).format('YYYY/MM/DD'),
            energyDay: de,
            progress: false,
          });
        } else {
          self.setState({
            progress: false,
            dialogOpen: true,
          });
        }
        return response;
      });
  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handlePower = (date) => {
    const cdate = moment(date).format('YYYY/MM/DD');
    bkLog('Change Power:', cdate);
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).p;
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const url = `${baseApiURL}power?date=${cdate}`;
    const self = this;
    offlineFetch(url, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let pow = [];
        if (response.power) {
          pow = self.tranformPower(response.power);
          self.updatePowerCharts(pow);
        }
        return response;
      });
  }
  updatePowerCharts = (pow) => {
    const self = this;
    const chart = self.chart.getChart();
    chart.series[0].update({
      data: _.sortBy(pow.i1, [o => o[0]]),
    }, true);
    chart.series[1].update({
      data: _.sortBy(pow.i2, [o => o[0]]),
    }, true);
    chart.series[2].update({
      data: _.sortBy(pow.i3, [o => o[0]]),
    }, true);
    chart.series[3].update({
      data: _.sortBy(pow.R, [o => o[0]]),
    }, true);
    chart.series[4].update({
      data: _.sortBy(pow.Y, [o => o[0]]),
    }, true);
    chart.series[5].update({
      data: _.sortBy(pow.B, [o => o[0]]),
    }, true);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} elevation={4}>
              <div>
                <div className={classes.panelHeader}>
                  <Typography color="inherit" className={classes.panelTitle}>
                    Day Energy ( Hour wise ) - {moment(this.state.date).format('Do MMM YYYY')}
                    : {this.state.solarPowerTotal}
                  </Typography>
                  <Button dense onClick={this.changeChartType('spline')}>
                  Spline
                  </Button>
                  <Button dense onClick={this.changeChartType('bar')}>
                  Bar
                  </Button>
                  <Button dense onClick={this.changeChartGroup('solar')}>
                  Solar
                  </Button>
                  <Button dense onClick={this.changeChartGroup('grid')}>
                  Grid
                  </Button>
                  <Button dense onClick={this.changeChartGroup('both')}>
                  Both
                  </Button>
                  <SingleDatePicker
                    date={this.state.startDate}
                    displayFormat="DD/MM/YYYY"
                    onDateChange={(date) => {
                    const prevDate = this.state.date;
                    const nextDate = moment(date).format('YYYY/MM/DD');
                    bkLog('Date Selected', nextDate, prevDate);
                    if (prevDate !== nextDate) {
                      this.changeEnergy(date);
                      this.handlePower(date);
                    } else {
                      bkLog('Date not changed, so no calls to data');
                    }
                    }}
                    focused={this.state.focused}
                    numberOfMonths={1}
                    horizontalMargin={64}
                    hideKeyboardShortcutsPanel
                    isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
                    onFocusChange={({ focused }) => this.setState({ focused })}
                  />
                </div>
                { this.state.progress ? <LinearProgress /> : ''}

                <ReactHighcharts
                  config={this.state.highPowerLine}
                  ref={(chart) => { this.chart = chart; }}
                />

                <ResponsiveContainer height={350} className={this.state.progress ? classes.opacity : 'bk-default'}>
                  <ComposedChart
                    data={
                      _.sortBy(this.state.energyDay, ['dhr'])
                    }
                    maxBarSize={30}
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                    barSize={30}
                  >
                    <XAxis dataKey="dhr" angle={-45} textAnchor="end" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="2 3" />
                    <Tooltip />
                    <Bar dataKey="R" stackId="a" fill={Colors.RPhaseColor} />
                    <Bar dataKey="Y" stackId="a" fill={Colors.YPhaseColor} />
                    <Bar dataKey="B" stackId="a" fill={Colors.BPhaseColor} />

                    <Bar dataKey="i1" stackId="b" fill={Colors.I1Color} />
                    <Bar dataKey="i2" stackId="b" fill={Colors.I2Color} />
                    <Bar dataKey="i3" stackId="b" fill={Colors.I3Color} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      dots
                      strokeDasharray="5 5"
                      stroke="#ff7300"
                    />
                    <Legend />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Paper>
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
          <Grid item xs={12} sm={12}>
            <EnhancedTable
              title="Hour Wise Energy"
              tdata={this.state.energyDay}
              thead={[
                {
                  label: 'Hour',
                  numeric: false,
                  disablePadding: false,
                  id: 'ddt',
                },
                {
                  label: 'Load', numeric: true, disablePadding: false, id: 'dtotal',
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
          </Grid>
        </Grid>
      </div>
    );
  }
}

NuevoDay.propTypes = {
  classes: PropTypes.object.isRequired,
  apiPath: PropTypes.string.isRequired,
};

export default withStyles(styles)(NuevoDay);
