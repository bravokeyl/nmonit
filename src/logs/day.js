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
import { Colors } from '../common/constants';

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
  },
  panelHeader: {
    display: 'flex',
    flex: 1,
    borderBottom: "1px solid #eee",
    paddingBottom: 10
  },
  panelTitle: {
    flex: 1,
    alignSelf: "center"
  },
});

const highLineconfig = {
  chart: {
    zoomType: 'x',
    type: 'area'
  },
  title: {
      text: 'Power over time'
  },
  subtitle: {
      text: document.ontouchstart === undefined ?
              'Click and drag in the plot to zoom in' : 'Pinch the chart to zoom in'
  },
  legend: {
      enabled: true
  },
  yAxis: {
      title: {
          text: 'Power in Watts'
      }
  },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
      month: '%e. %b',
      year: '%b'
    },
    crosshair: true,
  },
  tooltip: {
    shared: true,
    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y} W</b><br/>',
  },
  series: [
    {
      name: "Inverter 1",
      color: Colors.I1Color,
      data: [

      ]
    },
    {
      name: "Inverter 2",
      color: Colors.I2Color,
      data: [

      ]
    },
    {
      name: "Inverter 3",
      color: Colors.I3Color,
      data: [

      ]
    },
    {
      name: "R-Phase",
      color: Colors.RPhaseColor,
      visible: false,
      data: [

      ]
    },
    {
      name: "Y-Phase",
      color: Colors.YPhaseColor,
      visible: false,
      data: [

      ]
    },
    {
      name: "B-Phase",
      visible: false,
      color: Colors.BPhaseColor,
      data: [

      ]
    }
  ]
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
      highPowerLine: highLineconfig,

      showGridPower: false,
      showSolarPower: true
    }

    this.changeEnergy = this.changeEnergy.bind(this);
    this.handlePower = this.handlePower.bind(this);
    this.transformData = this.transformData.bind(this);
    this.tranformPower = this.tranformPower.bind(this);
    this.changeChartType = this.changeChartType.bind(this);
    this.changeChartGroup = this.changeChartGroup.bind(this);
    this.updatePowerCharts = this.updatePowerCharts.bind(this);

    ReactHighcharts.Highcharts.setOptions({
      global : {
          useUTC : false
      }
    });
  }
  changeChartType = (type) => {
    let chart = this.refs.lchart.getChart();
    chart.update({
      chart: {
        type
      },
    });
  }
  changeChartGroup = (group) => {
    let chart = this.refs.lchart.getChart();
    switch (group) {
      case 'grid':
        chart.series[0].update({
          visible: false
        });
        chart.series[1].update({
          visible: false
        });
        chart.series[2].update({
          visible: false
        });
        chart.series[3].update({
          visible: true
        });
        chart.series[4].update({
          visible: true
        });
        chart.series[5].update({
          visible: true
        });

        break;
      case 'solar':
        chart.series[0].update({
          visible: true
        });
        chart.series[1].update({
          visible: true
        });
        chart.series[2].update({
          visible: true
        });
        chart.series[3].update({
          visible: false
        });
        chart.series[4].update({
          visible: false
        });
        chart.series[5].update({
          visible: false
        });
        break;
      default:
        chart.series[0].update({
          visible: true
        });
        chart.series[1].update({
          visible: true
        });
        chart.series[2].update({
          visible: true
        });
        chart.series[3].update({
          visible: true
        });
        chart.series[4].update({
          visible: true
        });
        chart.series[5].update({
          visible: true
        });
    }

  }
  tranformPower = (d) => {
    let pow = {"i1":[],"i2":[],"i3":[],"R":[],"Y":[],"B":[]};
    let carr = ["i1","i2","i3","R","Y","B"];
    try {
      d.map((e,i)=>{
        for(let c = 1; c<7;c++){
          let chan = "i"+c;
          chan = carr[c-1];
          let obj = e[chan];
          if(obj){
            let keys = Object.keys(obj)
              , k = 0
              , len = keys.length;
            let dq = e.q;
            for (; k < len; k += 1) {
              let dmh = moment(dq+"/"+keys[k],"YYYY/MM/DD/HH-mm");
              let dm  = dmh.format('x');
              let chr = dmh.format('HH');
              if(chan === "i1" || chan === "i2" || chan === "i3"){
                if( chr >= 6 && chr <=18) {
                  pow[chan].push( [Number(dm),obj[keys[k]].appPower] );
                } else {
                  pow[chan].push( [Number(dm),0] );
                }
              } else {
                pow[chan].push( [Number(dm),obj[keys[k]].appPower] );
              }
            }
          } else {
            console.warn("Power transform error: No obj",e,chan,obj);
          }
        }
        return pow;
      });
    } catch(e){
      console.error("Power transform error",e);
    }

    bkLog("Pow Trans:",pow);
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
    let cdate = moment(date).format("YYYY/MM/DD");
    bkLog("Change Power:",cdate)
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    let url = baseApiURL+"power?date="+cdate;
    let self = this;
    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let pow = [];
      if(response.power){
        pow = self.tranformPower(response.power);
        self.updatePowerCharts(pow);
      }
      return response;
    });
  }
  handleChange = () => {
  }
  componentWillReceiveProps(n,o) {
    if(n.date){
      let nd = moment(n.date,'YYYY/MM/DD');
      bkLog("Day PROPS",nd.format('YYYY/MM/DD'));
      this.changeEnergy(nd);
      this.handlePower(nd);
    }
  }
  updatePowerCharts = (pow) => {
    let self = this;
    let chart = self.refs.lchart.getChart();
    chart.series[0].update({
        data: _.sortBy(pow["i1"],[function(o) { return o[0]; }])
    }, true);
    chart.series[1].update({
        data: _.sortBy(pow["i2"],[function(o) { return o[0]; }])
    }, true);
    chart.series[2].update({
        data: _.sortBy(pow["i3"],[function(o) { return o[0]; }])
    }, true);
    chart.series[3].update({
        data: _.sortBy(pow["R"],[function(o) { return o[0]; }])
    }, true);
    chart.series[4].update({
        data: _.sortBy(pow["Y"],[function(o) { return o[0]; }])
    }, true);
    chart.series[5].update({
        data: _.sortBy(pow["B"],[function(o) { return o[0]; }])
    }, true);
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

    url = baseApiURL+"power?date="+date;
    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let pow = [];
      if(response.power){
        pow = self.tranformPower(response.power);
        self.updatePowerCharts(pow);
        bkLog("Power:",response.power.length);
      }

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
                <div className={classes.panelHeader}>
                  <Typography color="inherit" className={classes.panelTitle}>
                    Day Energy ( Hour wise ) - {moment(this.state.date).format('Do MMM YYYY')}
                  </Typography>
                  <Button dense onClick={()=>{ this.changeChartType("spline");}}>
                  Spline
                  </Button>
                  <Button dense onClick={()=>{ this.changeChartType("bar");}}>
                  Bar
                  </Button>
                  <Button dense onClick={()=>{ this.changeChartGroup("solar");}}>
                  Solar
                  </Button>
                  <Button dense onClick={()=>{ this.changeChartGroup("grid");}}>
                  Grid
                  </Button>
                  <Button dense onClick={()=>{ this.changeChartGroup("both");}}>
                  Both
                  </Button>
                  <SingleDatePicker
                    date={this.state.startDate}
                    displayFormat="DD/MM/YYYY"
                    onDateChange={date => {bkLog("Date Changed"); this.changeEnergy(date);
                    this.handlePower(date);}}
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
                 <Bar dataKey="R" stackId="a" fill={Colors.RPhaseColor} />
                 <Bar dataKey="Y" stackId="a" fill={Colors.YPhaseColor} />
                 <Bar dataKey="B" stackId="a" fill={Colors.BPhaseColor} />

                 <Bar dataKey="i1" stackId="b" fill={Colors.I1Color} />
                 <Bar dataKey="i2" stackId="b" fill={Colors.I2Color} />
                 <Bar dataKey="i3" stackId="b" fill={Colors.I3Color} />
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
