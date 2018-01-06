import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';

import moment from 'moment';
import _ from 'lodash';

import config from '../aws';
import { getIdToken,getCurrentUserName } from '../aws/cognito';
import offlineFetch from '../common/fetch-cache';
import BKPanel from '../common/panel';
import {channelMap} from '../common/utils';

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
  return weekStart+"-"+weekEnd;
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
      idToken: getIdToken() ? getIdToken().jwtToken : '',

      lastupdated: moment(Date.now()).fromNow(),
      todayEnergyL: 0,
      weekEnergyL: 0,
      weekEnergyRL: 0,
      weekEnergyYL: 0,
      weekEnergyBL: 0,
      monthEnergyL: 0,
      totalEnergyL: 0,
      todayEnergyGenL: 0,
      gen: {
        todayEnergyGenL: 0,
        weekEnergyGenL: 0,
        monthEnergyGenL: 0,
        totalEnergyGenL: 0,
      },
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
        // data["c2"] = util(data["c2"]);
        // data["c3"] = util(data["c3"]);
        // data["c4"] = util(data["c4"]);
        // if(data["c2"] < 0) data["c2"] = 0;
        // if(data["c3"] < 0) data["c3"] = 0;
        // if(data["c4"] < 0) data["c4"] = 0;
        data = channelMap(data);
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
    console.info("Overview did mount");
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    APIHEADERS.headers.Authorization = this.state.idToken;
    let url = baseApiURL+"h?dhr="+date;
    let dayURL = baseApiURL+"d?ddm="+month;
    let weekURL = baseApiURL+"we";
    let monthURL = baseApiURL+"m";
    let self = this;

    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  response.energy;
      if(!de){
        de = [];
      }
      let dayEnergyConsumption = {"R":[],"Y":[],"B":[]};
      let dayEnergyGeneration = {"i1":[],"i2":[],"i3":[]};
      de.map((e,i)=>{
        let ap = JSON.parse(window.localStorage.getItem('nuser')).p || "NA";
        if(ap === 'l'){
          dayEnergyConsumption["R"].push(_.sum(e.c2));
          dayEnergyConsumption["Y"].push(_.sum(e.c4));
          dayEnergyConsumption["B"].push(_.sum(e.c6));
          dayEnergyGeneration["i1"].push(_.sum(e.c1));
          dayEnergyGeneration["i2"].push(_.sum(e.c3));
          dayEnergyGeneration["i3"].push(_.sum(e.c5));
        } else {
          dayEnergyConsumption["R"].push(_.sum(e.c2));
          dayEnergyConsumption["Y"].push(_.sum(e.c4));
          dayEnergyConsumption["B"].push(_.sum(e.c6));
          dayEnergyGeneration["i1"].push(_.sum(e.c1));
          dayEnergyGeneration["i2"].push(_.sum(e.c3));
          dayEnergyGeneration["i3"].push(_.sum(e.c5));
        }
        return e;
      });
      let mec = _.map(dayEnergyConsumption,(e,i)=>{
        return _.sum(e);
      });
      let meg = _.map(dayEnergyGeneration,(e,i)=>{
        return _.sum(e);
      });
      let daytotalConsumption = _.sum(mec);
      let daytotalGeneration = _.sum(meg);
      self.setState(prevState => ({
        todayEnergyL: parseFloat(daytotalConsumption).toFixed(3),
        gen: {
          ...prevState.gen,
          todayEnergyGenL: parseFloat(daytotalGeneration).toFixed(3)
        }
      }));
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

      let monthgroup = {"R":[],"Y":[],"B":[]};
      let monthgroupGen = {"i1":[],"i2":[],"i3":[]};
      de.map((e,i) => {
        let ap = JSON.parse(window.localStorage.getItem('nuser')).p || "NA";
        if(ap === 'l'){
          monthgroup["R"].push(e.c2);
          monthgroup["Y"].push(e.c4);
          monthgroup["B"].push(e.c6);
          monthgroupGen["i1"].push(e.c1);
          monthgroupGen["i2"].push(e.c3);
          monthgroupGen["i3"].push(e.c5);
        } else {
          monthgroup["R"].push(e.c2);
          monthgroup["Y"].push(e.c4);
          monthgroup["B"].push(e.c6);
          monthgroupGen["i1"].push(e.c1);
          monthgroupGen["i2"].push(e.c3);
          monthgroupGen["i3"].push(e.c5);
        }
        return e;
      });
      let me = _.map(monthgroup,(e,i)=>{
        return _.sum(e);
      });
      let meg = _.map(monthgroupGen,(e,i)=>{
        return _.sum(e);
      });

      let metotal = _.sum(me);
      let metotalGen = _.sum(meg);
      self.setState(prevState => ({
        monthEnergyL: parseFloat(metotal).toFixed(2),
        progessL: false,
        gen: {
          ...prevState.gen,
          monthEnergyGenL: parseFloat(metotalGen).toFixed(3)
        }
      }));
      return response;
    }, function(error) {
      console.error("Day Fetch Error",error);
    });

    offlineFetch(weekURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  response.energy;
      let dayEnergy = {"R":[],"Y":[],"B":[]};
      let dayEnergyGen = {"i1":[],"i2":[],"i3":[]};
      de.map((e,i)=>{
        let ap = JSON.parse(window.localStorage.getItem('nuser')).p || "NA";
        if(ap === 'l'){
          dayEnergy["R"].push(e.c2);
          dayEnergy["Y"].push(e.c4);
          dayEnergy["B"].push(e.c6);
          dayEnergyGen["i1"].push(e.c1);
          dayEnergyGen["i2"].push(e.c3);
          dayEnergyGen["i3"].push(e.c5);
        } else {
          dayEnergy["R"].push(e.c2);
          dayEnergy["Y"].push(e.c4);
          dayEnergy["B"].push(e.c6);
          dayEnergyGen["i1"].push(e.c1);
          dayEnergyGen["i2"].push(e.c3);
          dayEnergyGen["i3"].push(e.c5);
        }
        return e;
      });
      // console.log("weekURL dayWise",de);
      // console.log("weekURL dayWise",dayEnergyGen);
      let me = _.map(dayEnergy,(e,i)=>{
        return _.sum(e);
      });
      let weektotal = _.sum(me);
      let meg = _.map(dayEnergyGen,(e,i)=>{
        return _.sum(e);
      });
      let weektotalGen = _.sum(meg);
      console.log(me,"MEMME")
      self.setState(prevState => ({
        weekEnergyL: parseFloat(weektotal).toFixed(2),
        weekEnergyRL: parseFloat(me[0]).toFixed(2),
        weekEnergyYL: parseFloat(me[1]).toFixed(2),
        weekEnergyBL: parseFloat(me[2]).toFixed(2),
        gen: {
          ...prevState.gen,
          weekEnergyGenL: parseFloat(weektotalGen).toFixed(2)
        }
      }));
      return response;
    })
    .catch((err)=>{
      console.error("Week Fetch Error:",err);
    });
    APIHEADERS.offline.expires = 60*60*1000;

    offlineFetch(monthURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  response;
      console.log(response,"MONTHURL")
      if(!Array.isArray(de)){
        de = [de]
        console.log("Not array",de)
      }
      let totalEnergy = {"R":[],"Y":[],"B":[]};
      let totalEnergyGen = {"i1":[],"i2":[],"i3":[]};
      de.map((e,i)=>{

        let ap = JSON.parse(window.localStorage.getItem('nuser')).p || "NA";
        if(ap === 'l'){
          totalEnergy["R"].push(e.c2);
          totalEnergy["Y"].push(e.c4);
          totalEnergy["B"].push(e.c6);
          totalEnergyGen["i1"].push(e.c1);
          totalEnergyGen["i2"].push(e.c3);
          totalEnergyGen["i3"].push(e.c5);
        } else {
          totalEnergy["R"].push(e.c2);
          totalEnergy["Y"].push(e.c4);
          totalEnergy["B"].push(e.c6);
          totalEnergyGen["i1"].push(e.c1);
          totalEnergyGen["i2"].push(e.c3);
          totalEnergyGen["i3"].push(e.c5);
        }
        return e;
      });
      let me = _.map(totalEnergy,(e,i)=>{
        return _.sum(e);
      });
      let meg = _.map(totalEnergyGen,(e,i)=>{
        return _.sum(e);
      });
      let yeartotal = _.sum(me);
      let yeartotalGen = _.sum(meg);
      console.log(meg,me,"MEG Total");
      self.setState(prevState => ({
        totalEnergyL: parseFloat(yeartotal).toFixed(2),
        gen: {
          ...prevState.gen,
          totalEnergyGenL: parseFloat(yeartotalGen).toFixed(3)
        }
      }));
      return response;
    })
    .catch((err)=>{
      console.error("Month Fetch Error:",err);
    });

  }

  render(){
    const { classes } = this.props;
    const pvsystem = (window.localStorage.nuser) ? JSON.parse(window.localStorage.nuser).plant : null;
    return (
      <div className={classes.root}>
        <Typography type="title" style={{margin:16, marginBottom: 0}}>
          PVSystem: {pvsystem}
        </Typography>
        <Typography type="subheading" style={{margin:16, marginBottom: 0}}>
          Generation
        </Typography>
        <Grid container spacing={0}>
          <BKPanel color="green" icon data={this.state.gen.todayEnergyGenL+" kWh"} title='Energy - Today' footer="Last updated:"/>
          <BKPanel color="green" icon data={this.state.gen.weekEnergyGenL+" kWh"} title='Energy - This Week' footer={getCurrentWeekString()}/>
          <BKPanel color="green" icon data={this.state.gen.monthEnergyGenL+" kWh"} title='Energy - This Month' footer="Units generated"/>
          <BKPanel color="green" icon data={this.state.gen.totalEnergyGenL+" kWh"} title='Energy - Year' footer="Units generated"/>
        </Grid>
        <Grid container spacing={0}>
          <BKPanel data={Number(parseFloat(this.state.gen.todayEnergyGenL*9.5).toFixed(3))} title='Revenue - Today'/>
          <BKPanel data={Number(parseFloat(this.state.gen.weekEnergyGenL*9.5).toFixed(3))} title='Revenue - This Week'/>
          <BKPanel data={Number(parseFloat(this.state.gen.monthEnergyGenL*9.5).toFixed(3))} title='Revenue - This Month'/>
          <BKPanel data={Number(parseFloat(this.state.gen.totalEnergyGenL*9.5).toFixed(3))} title='Revenue - Year'/>
        </Grid>
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
                    Load - Today
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
                    Load - This Week
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
                    Load - This Month
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
                    Load - Year
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
