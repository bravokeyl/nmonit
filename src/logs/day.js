import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Dialog, { DialogTitle, DialogContent,DialogActions } from 'material-ui/Dialog';
import { LinearProgress } from 'material-ui/Progress';

import 'react-dates/initialize';
import { SingleDatePicker, isInclusivelyBeforeDay } from 'react-dates';

import moment from 'moment';
import _ from 'lodash';

import ReactHighcharts from 'react-highcharts';
import { Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend} from  'recharts';

import EnhancedTable from '../common/table';
import offlineFetch from '../common/fetch-cache';

import 'react-dates/lib/css/_datepicker.css';

import config from '../aws';
import { getIdToken } from '../aws/cognito';
import {channelMap,bkLog} from '../common/utils';

const API_KEY = config.LocalAPIKey;
const APIHEADERS = {
  headers: {
    "X-Api-Key": API_KEY,
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
  }
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

const linedata = [
      { apparentPower: null, timestamp: null},
];

const highLineconfig = {
  chart: {
    zoomType: 'x',
    type: 'spline'
  },
  title: {
      text: 'Power over time'
  },
  subtitle: {
      text: document.ontouchstart === undefined ?
              'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
  },
  legend: {
      enabled: false
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
      month: '%e. %b',
      year: '%b'
    },
  },
  series: [{
    data: [
    [Date.UTC(2018,1,1),0]
  ]
  }]
};

class DayGen extends Component {
  constructor(props){
    super(props);
    this.state = {
      progessL: true,
      idToken: getIdToken().jwtToken || '',

      lastupdated: moment(Date.now()).fromNow(),
      todayEnergyL: 0,
      weekEnergyL: 0,
      weekEnergyRL: 0,
      weekEnergyYL: 0,
      weekEnergyBL: 0,
      monthEnergyL: 0,
      totalEnergyL: 0,
      energyDay: [],
      energyMonth: [],
      date: moment().format('YYYY/MM/DD'),
      startDate: moment(),
      focused: false,
      progess: true,
      monthprogress: true,
      dialogOpen: false,
      selectedMonth: moment().format('MMMM'),
      powerLine: linedata,
      highPowerLine: highLineconfig
    }
    this.changeEnergy = this.changeEnergy.bind(this);
    this.handlePower = this.handlePower.bind(this);
    this.transformData = this.transformData.bind(this);
    this.tranformPower = this.tranformPower.bind(this);
    ReactHighcharts.Highcharts.setOptions({
        global : {
            useUTC : false
        }
    });
  }
  tranformPower = (d) => {
    let pow = [];
    let min;
    d.map((e,i)=>{
      if(!isNaN(Number(e.apparentPower))){
        if(i===0){
          min = moment(e.timestamp).format('HHmm');
          pow.push([
            Number(moment(e.timestamp).format('x')),
            e.apparentPower
          ]);
        } else {
          // min = moment(e.timestamp).format('HHmm');
          if(min !== moment(e.timestamp).format('HHmm')){
            // bkLog("NEQ:",min,moment(e.timestamp).format('HHmm'));
            min = moment(e.timestamp).format('HHmm');
            pow.push([
              Number(moment(e.timestamp).format('x')),
              e.apparentPower
            ]);
          } else {
            // bkLog("EQ:",min,moment(e.timestamp).format('HHmm'));
          }
        }
      }

      return d;
    });

    let dummy = [[Date.UTC(2017,5,2),0.7695],
    [Date.UTC(2017,5,3),0.7648],
    [Date.UTC(2017,6,4),0.7645],
    [Date.UTC(2017,6,10),0.3272]];
    bkLog("Pow Trans:",pow,dummy);
    return pow;
  }
  transformData = (d) => {
    if(d){
      d.map((data, i) => {
        data = channelMap(data);
        data['load'] = parseFloat(Number(data["R"] + data["Y"] + data["B"])).toFixed(2);
        data['solar'] = parseFloat(Number(data["i1"] + data["i2"] + data["i3"])).toFixed(2);
        if(data['dhr']){
          data["dhr"] = data['dhr'].split('/').reverse()[0];
          data['day'] = "Hour "+Number(data['dhr']) +" - "+(Number(data['dhr'])+1);
        }
        if(data['ddt']){
          data['month'] = moment(data['ddt']).format("MMM Do");
          data["ddt"] = data['ddt'].split('/').reverse()[0];
        }
        return d;
      });
    } else {
      d = [];
    }
    return d;
  }
  changeEnergy = (date) => {
    let datediff = moment().diff(date,'days');
    let dateApiHeaders = APIHEADERS;
    if(datediff >= 1) {
      dateApiHeaders.offline.expires = 1000*60*60*24;
    } else {
      dateApiHeaders.offline.expires = 1000*60*5;
    }
    let dhr = moment(date).format('YYYY/MM/DD');
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    let url = baseApiURL+"h?dhr="+dhr;
    let self = this;
    self.setState({
      progress: true
    });

    offlineFetch(url,dateApiHeaders)
    .then(response => response.json())
    .then(function(response) {
      if(response.energy) {
        let de =  self.transformData(response.energy);
        self.setState({
          startDate: date,
          date: moment(date).format("YYYY/MM/DD"),
          energyDay: de,
          progress: false
        });
      } else {
        self.setState({
          progress: false,
          dialogOpen: true
        })
      }
      return response;
    });

  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handlePower = (date) => {
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    let url = baseApiURL+"h?dhr="+date;
    url = baseApiURL+"power";
    let self = this;
    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let pow = [];
      if(response.power){
        pow = self.tranformPower(response.power)
        self.setState({
          powerLine: pow
        });
      }
      return response;
    });
  }
  handleChange = () => {
  }
  componentWillReceiveProps(n,o) {
    if(n.date){
      let nd = moment(n.date,'YYYY/MM/DD');
      bkLog("Day PROPS",nd.format('YYYY/MM/DD'))
      this.changeEnergy(nd);
      this.handlePower(nd);
    }
  }
  componentDidMount(){
    bkLog("DayGen component did mount",this.props.apiPath);
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    let { date } = this.state;
    APIHEADERS.headers.Authorization = this.state.idToken;
    let url = baseApiURL+"h?dhr="+date;
    let self = this;

    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  self.transformData(response.energy);
      self.setState({
        energyDay: de
      });
      return response;
    });
    url = baseApiURL+"power";
    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let pow = [];
      if(response.power){
        pow = self.tranformPower(response.power);
        let chart = self.refs.lchart.getChart();
        console.log("POWW DATA:",pow);

        chart.series[0].update({
            data: pow
        }, true);

        self.setState({
          powerLine: pow
        });
      }
      bkLog("Power:",response.power.length);
      return response;
    });

  }
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} elevation={4}>
              <div>
                <div className={classes.flex}>
                  <Typography color="inherit" className={classes.flex}>
                    Day Energy ( Hour wise ) - {moment(this.state.date).format('Do MMM YYYY')}
                  </Typography>

                  <SingleDatePicker
                    date={this.state.startDate}
                    displayFormat="DD/MM/YYYY"
                    onDateChange={date => {bkLog("Date Changed"); this.changeEnergy(date);}}
                    focused={this.state.focused}
                    numberOfMonths={1}
                    horizontalMargin={64}
                    hideKeyboardShortcutsPanel
                    isOutsideRange = {day =>!isInclusivelyBeforeDay(day, moment())}
                    onFocusChange={({ focused }) => this.setState({ focused })}
                  />
                </div>
                { this.state.progress ? <LinearProgress />: ""}

                <ReactHighcharts config={this.state.highPowerLine} ref="lchart"></ReactHighcharts>

                <ResponsiveContainer height={350} className={ this.state.progress?classes.opacity:"bk-default"}>
                  <ComposedChart data={_.sortBy(this.state.energyDay,['dhr'])}
                    maxBarSize={30}
                    margin={{top: 20, right: 30, left: 20, bottom: 5}} barSize={30}>
                 <XAxis dataKey="dhr" angle={-45} textAnchor="end"/>
                 <YAxis/>
                 <CartesianGrid strokeDasharray="2 3"/>
                 <Tooltip />
                 <Bar dataKey="R" stackId="a" fill="#f44336" />
                 <Bar dataKey="Y" stackId="a" fill="#ffc658" />
                 <Bar dataKey="B" stackId="a" fill="#3f51b5" />

                 <Bar dataKey="i1" stackId="b" fill="#1b5e20" />
                 <Bar dataKey="i2" stackId="b" fill="#4c8c4a" />
                 <Bar dataKey="i3" stackId="b" fill="#003300" />
                 <Line type='monotone' dataKey='total' dots={true}
                   strokeDasharray="5 5" stroke='#ff7300'/>
                 <Legend />
                 </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Paper>
            <Dialog onRequestClose={this.handleRequestClose} open={this.state.dialogOpen}>
              <DialogTitle>No data available</DialogTitle>
              <DialogContent>If you think this is an issue, please contact NuevoMonit support engineer.</DialogContent>
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
                {label:"Hour",numeric:false,disablePadding:false,id:"ddt"},
                {label:"Load",numeric:true,disablePadding:false,id:"dtotal"},
                {label:"Solar",numeric:true,disablePadding:false,id:"stotal"},
                {label:"R-Load",numeric:true,disablePadding:false,id:"R"},
                {label:"Y-Load",numeric:true,disablePadding:false,id:"Y"},
                {label:"B-Load",numeric:true,disablePadding:false,id:"B"},
                {label:"Inv 1",numeric:true,disablePadding:false,id:"i1"},
                {label:"Inv 2",numeric:true,disablePadding:false,id:"i2"},
                {label:"Inv 3",numeric:true,disablePadding:false,id:"i3"},
              ]}/>
          </Grid>
        </Grid>
      </div>
    );
  }

}

DayGen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DayGen);
