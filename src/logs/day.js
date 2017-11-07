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

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from  'recharts';

import EnhancedTable from '../common/table';
import offlineFetch from '../common/fetch-cache';

import 'react-dates/lib/css/_datepicker.css';

import config from '../aws';
import { getIdToken } from '../aws/cognito';

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

const util = (d) => {
  let o = 0;
  if(Array.isArray(d)) {
    o = d.reduce((sum, value) => Number(parseFloat(sum ))+ Number(parseFloat(value)), 0);
    o = Number(parseFloat(o).toFixed(3))
  } else{
    o = Number(parseFloat(d).toFixed(3));
  }
  return o;
}
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
    }
    this.changeEnergy = this.changeEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
  }

  transformData = (d) => {
    if(d){
      d.map((data, i) => {
        data["c2"] = util(data["c2"]);
        data["c3"] = util(data["c3"]);
        data["c4"] = util(data["c4"]);
        if(data["c2"] < 0) data["c2"] = 0;
        if(data["c3"] < 0) data["c3"] = 0;
        if(data["c4"] < 0) data["c4"] = 0;
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
    let url = "https://api.blufieldsenergy.com/v1/h?dhr="+dhr;
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

  handleChange = () => {
  }
  componentWillReceiveProps(n,o) {
    if(n.date){
      let nd = moment(n.date,'YYYY/MM/DD');
      console.log("Will rec props");
      this.changeEnergy(nd);
    }
  }
  componentDidMount(){
    console.log("DayGen component did mount");
    let { date } = this.state;
    APIHEADERS.headers.Authorization = this.state.idToken;
    let url = "https://api.blufieldsenergy.com/v1/h?dhr="+date;
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
                    onDateChange={date => {console.log("Date Changed"); this.changeEnergy(date);}}
                    focused={this.state.focused}
                    numberOfMonths={1}
                    horizontalMargin={64}
                    hideKeyboardShortcutsPanel
                    isOutsideRange = {day =>!isInclusivelyBeforeDay(day, moment())}
                    onFocusChange={({ focused }) => this.setState({ focused })}
                  />
                </div>
                { this.state.progress ? <LinearProgress />: ""}
                <ResponsiveContainer height={350} className={ this.state.progress?classes.opacity:"bk-default"}>
                  <BarChart data={_.sortBy(this.state.energyDay,['dhr'])}
                    maxBarSize={30}
                    margin={{top: 20, right: 30, left: 20, bottom: 5}} barSize={30}>
                 <XAxis dataKey="dhr" angle={-45} textAnchor="end"/>
                 <YAxis/>
                 <CartesianGrid strokeDasharray="2 3"/>
                 <Tooltip />
                 <Bar dataKey="c2" stackId="a" fill="#f44336" />
                 <Bar dataKey="c3" stackId="a" fill="#ffc658" />
                 <Bar dataKey="c4" stackId="a" fill="#3f51b5" />
              </BarChart>
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
                {label:"Channel 1",numeric:true,disablePadding:false,id:"c1"},
                {label:"Channel 2",numeric:true,disablePadding:false,id:"c2"},
                {label:"Channel 3",numeric:true,disablePadding:false,id:"c3"},
                {label:"Channel 4",numeric:true,disablePadding:false,id:"c4"},
                {label:"Channel 5",numeric:true,disablePadding:false,id:"c5"},
                {label:"Channel 6",numeric:true,disablePadding:false,id:"c6"}
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
