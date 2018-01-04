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
    console.info("Overview did mount:",this.props,getCurrentUserName());
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    APIHEADERS.headers.Authorization = this.state.idToken;
    let url = baseApiURL+"h?dhr="+date;
    let dayURL = baseApiURL+"d?ddm="+month;
    let weekURL = baseApiURL+"w";
    let monthURL = baseApiURL+"m";
    let self = this;

    offlineFetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de =  response.energy;
      if(!de){
        de = [];
      }
      let dayEnergyConsumption = {"c2":[],"c3":[],"c4":[]};
      let dayEnergyGeneration = {"c1":[],"c5":[],"c6":[]};
      console.log("URL HourWise",de);
      console.log("URL HourWise",dayEnergyGeneration);
      de.map((e,i)=>{
        dayEnergyConsumption["c2"].push(_.sum(e.c2));
        dayEnergyConsumption["c3"].push(_.sum(e.c3));
        dayEnergyConsumption["c4"].push(_.sum(e.c4));
        dayEnergyGeneration["c1"].push(_.sum(e.c1));
        dayEnergyGeneration["c5"].push(_.sum(e.c5));
        dayEnergyGeneration["c6"].push(_.sum(e.c6));
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

      let monthgroup = {"c2":[],"c3":[],"c4":[]};
      let monthgroupGen = {"c1":[],"c5":[],"c6":[]};
      console.log("dayURL dayWise",de);
      console.log("dayURL dayWise",monthgroupGen);
      de.map((e,i)=>{
        monthgroup["c2"].push(e.c2);
        monthgroup["c3"].push(e.c3);
        monthgroup["c4"].push(e.c4);
        monthgroupGen["c1"].push(e.c1);
        monthgroupGen["c5"].push(e.c5);
        monthgroupGen["c6"].push(e.c6);
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
      let dayEnergy = {"c2":[],"c3":[],"c4":[]};
      let dayEnergyGen = {"c1":[],"c5":[],"c6":[]};
      de.map((e,i)=>{
        dayEnergy["c2"].push(e.c2);
        dayEnergy["c3"].push(e.c3);
        dayEnergy["c4"].push(e.c4);
        dayEnergyGen["c1"].push(e.c1);
        dayEnergyGen["c5"].push(e.c5);
        dayEnergyGen["c6"].push(e.c6);
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
      let dayEnergy = {"c2":[],"c3":[],"c4":[]};
      let dayEnergyGen = {"c1":[],"c5":[],"c6":[]};
      de.map((e,i)=>{
        dayEnergy["c2"].push(e.c2);
        dayEnergy["c3"].push(e.c3);
        dayEnergy["c4"].push(e.c4);
        dayEnergyGen["c1"].push(e.c1);
        dayEnergyGen["c5"].push(e.c5);
        dayEnergyGen["c6"].push(e.c6);
        return e;
      });
      let me = _.map(dayEnergy,(e,i)=>{
        return _.sum(e);
      });
      let meg = _.map(dayEnergyGen,(e,i)=>{
        return _.sum(e);
      });
      let yeartotal = _.sum(me);
      let yeartotalGen = _.sum(meg);
      console.log(meg,"MEG Total")
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
    return (
      <div className={classes.root}>
        <Typography type="title" style={{margin:16, marginBottom: 0}}>
          PVSystem: Shyamala Hospital, Khammam
        </Typography>
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
        <Typography type="subheading" style={{margin:16, marginBottom: 0}}>
          Generation
        </Typography>
        <Grid container spacing={0}>
          <BKPanel data={{energy: this.state.gen.todayEnergyGenL}} title='Energy - Today'/>
          <BKPanel data={{energy: this.state.gen.weekEnergyGenL}} title='Energy - This Week'/>
          <BKPanel data={{energy: this.state.gen.monthEnergyGenL}} title='Energy - This Month'/>
          <BKPanel data={{energy: this.state.gen.totalEnergyGenL}} title='Energy - Total'/>
        </Grid>
      </div>
    );
  }

}

Overview.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Overview);
