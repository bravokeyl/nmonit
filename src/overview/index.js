import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';


import offlineFetch from '../common/fetch-cache';

import moment from 'moment';
import _ from 'lodash';


import config from '../aws';
import { getIdToken } from '../aws/cognito';


const API_KEY = config.LocalAPIKey;
const APIHEADERS = {
  headers: {
    "X-Api-Key": API_KEY,
  },
  method: 'GET',
  offline: {
        storage: 'localStorage',    // use localStorage (defaults to sessionStorage)
        timeout: 5000,               // request timeout in milliseconds, defaults 730ms
        expires: 300000,              // expires in milliseconds, defaults 1000ms (set to -1 to check for updates with every request)
        debug: true,                // console log request info to help with debugging
        renew: false,               // if true, request is fetched regardless of expire state. Response is and added to cache

        // timeouts are not retried as they risk cause the browser to hang
        retries: 3,                 // number of times to retry the request before considering it failed, default 3 (timeouts are not retried)
        retryDelay: 1000,           // number of milliseconds to wait between each retry
  }
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

const getCurrentWeekString = () => {
  let weekStart = moment().weekday(0).format("Do MMM");
  let weekEnd = moment().format("Do MMM");
  return weekStart+" - "+weekEnd;
}
const util = (d) => {
  let o = 0;
  if(Array.isArray(d)) {
    o = d.reduce((sum, value) => Number(parseFloat(sum ))+ Number(parseFloat(value)), 0);
    o = Number(parseFloat(o).toFixed(2))
  } else{
    o = Number(parseFloat(d).toFixed(2));
  }
  return o;
}

class Overview extends Component {
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
      month: moment().format('YYYY/MM'),
      startDate: moment(),
      focused: false,
      progess: true,
      monthprogress: true,
      dialogOpen: false,
      selectedMonth: moment().format('MMMM'),
    }
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
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
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handleSelectMonth = name => event => {
    this.changeMonthEnergy(event.target.value);
  };

  componentDidMount(){
    let { date, month } = this.state;
    APIHEADERS.headers.Authorization = this.state.idToken;
    let url = "https://api.blufieldsenergy.com/v1/h?dhr="+date;
    let dayURL = "https://api.blufieldsenergy.com/v1/d?ddm="+month;
    let weekURL = "https://api.blufieldsenergy.com/v1/w";
    let self = this;

    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  response.energy;
      console.log("Today HR",de);
      let dayEnergy = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[],"c6":[]};
      de.map((e,i)=>{
        dayEnergy["c2"].push(_.sum(e.c2));
        dayEnergy["c3"].push(_.sum(e.c3));
        dayEnergy["c4"].push(_.sum(e.c4));
        return e;
      });
      console.log("TDHRDE",dayEnergy)
      let me = _.map(dayEnergy,(e,i)=>{
        return _.sum(e);
      });
      console.log("TDHRSUM",me)
      let daytotal = _.sum(me);
      console.log("TDHRTotal",daytotal)
      self.setState({
        todayEnergyL: parseFloat(daytotal).toFixed(3)
      });
      return response;
    });

    offlineFetch(dayURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de;
      if(response.energy){
        de =  self.transformData(response.energy);
      } else {
        de =  self.transformData([response]);
      }
      self.setState({
        energyMonth: de,
      });

      let monthgroup = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[],"c6":[]};

      de.map((e,i)=>{
        monthgroup["c2"].push(e.c2);
        monthgroup["c3"].push(e.c3);
        monthgroup["c4"].push(e.c4);
        return e;
      });
      let me = _.map(monthgroup,(e,i)=>{
        return _.sum(e);
      });

      let metotal = _.sum(me);
      self.setState({
        monthEnergyL: parseFloat(metotal).toFixed(2),
        progessL: false,
      });
      return response;
    }, function(error) {
      console.error("ERR",error);
    });

    offlineFetch(weekURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  response.energy;
      console.log("Week HR",de);
      let dayEnergy = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[],"c6":[]};
      de.map((e,i)=>{
        dayEnergy["c2"].push(e.c2);
        dayEnergy["c3"].push(e.c3);
        dayEnergy["c4"].push(e.c4);
        return e;
      });
      console.log("WKHRDE",dayEnergy)
      let me = _.map(dayEnergy,(e,i)=>{
        return _.sum(e);
      });
      console.log("WKHRSUM",me)
      let weektotal = _.sum(me);
      console.log("WKHRTotal",weektotal)
      self.setState({
        weekEnergyL: parseFloat(weektotal).toFixed(2),
        weekEnergyRL: parseFloat(me[1]).toFixed(2),
        weekEnergyYL: parseFloat(me[2]).toFixed(2),
        weekEnergyBL: parseFloat(me[3]).toFixed(2),
      });
      return response;
    })
    .catch((err)=>{
      console.error("Week Fetch Error:",err);
    });
  }
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Typography type="subheading" style={{margin:16, marginBottom: 0}}>
          Consumption
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Energy - Today
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.todayEnergyL} kWh
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.lastupdated}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Energy - This Week
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.weekEnergyL} kWh
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                {getCurrentWeekString()} - ({this.state.weekEnergyRL +"+"+this.state.weekEnergyYL+"+"+this.state.weekEnergyBL})
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Energy - This Month
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.monthEnergyL} kWh
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Units consumed
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Energy - Total
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.totalEnergyL} kWh
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Units consumed
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }

}

Overview.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Overview);
