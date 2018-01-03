import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import Switch from 'material-ui/Switch';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';


import moment from 'moment';

import offlineFetch from '../common/fetch-cache';
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
        expires: 10000,
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
class Dashboard extends Component {
  constructor(props){
    super(props);
    this.state = {
      progessL: true,
      idToken: (getIdToken() ? getIdToken().jwtToken: '') || '',

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

      intervalId: 0,
      liveTimestampId: 0,
      c2Voltage: 0,
      c3Voltage: 0,
      c4Voltage: 0,
      c1Voltage: 0,
      c5Voltage: 0,
      c6Voltage: 0,
      c2Current: 0,
      c3Current: 0,
      c4Current: 0,
      c1Current: 0,
      c5Current: 0,
      c6Current: 0,
      c2Power: 0,
      c3Power: 0,
      c4Power: 0,
      c1Power: 0,
      c5Power: 0,
      c6Power: 0,
      liveTimestamp: false,
      relativeTimestamp: 0,
      isLive: false,
    }
    this.transformData = this.transformData.bind(this);
    this.getLive = this.getLive.bind(this);
    this.getLiveData = this.getLiveData.bind(this);
    this.updateliveTimestamp = this.updateliveTimestamp.bind(this);
  }

  transformData = (d) => {
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
    return d
  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handleChange = name => (event, checked) => {
   this.setState({ isLive: checked });
   let self = this;
   self.getLiveData();
   let intervalId = setInterval(self.getLive, 10*1000);
   self.setState({intervalId: intervalId});
  };
  getLiveData = () => {
    APIHEADERS.headers.Authorization = this.state.idToken;
    for(let i=1;i<7;i++){
      let url = "https://api.blufieldsenergy.com/v1/l?c="+i;
      let self = this;
      offlineFetch(url,APIHEADERS)
      .then(response => response.json())
      .then(function(response) {
        let voltage = "c"+i+"Voltage";
        self.setState({
          [voltage]: response.voltage,
          ["c"+i+"Current"]: response.current,
          ["c"+i+"Power"]: response.power,
        });
        if(i===4){
          self.setState({
            progessL: false,
            liveTimestamp: response.timestamp,
            relativeTimestamp: moment(response.timestamp).fromNow()
          });
        }
        return response;
      });
    }
  };
  updateliveTimestamp = () => {
    this.setState({
      relativeTimestamp: moment(this.state.liveTimestamp).fromNow(),
    });
  }
  getLive = () => {
    if(this.state.isLive){
      this.getLiveData();
    } else {
      clearInterval(this.state.intervalId);
    }
  };
  componentDidMount(){
    console.log("Dashboard component did mount");

    let self = this;
    let intervalId = setInterval(self.updateliveTimestamp, 10*1000);
    self.setState({liveTimestampId: intervalId});
    this.getLiveData();
  }
  componentWillUnmount() {
   clearInterval(this.state.intervalId);
   clearInterval(this.state.liveTimestampId);
  }
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Typography type="title" style={{margin:16, marginBottom: 0}}>
          PVSystem: Shyamala Hospital, Khammam
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 1: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c1Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 1: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c1Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 1: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c1Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 2: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c5Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 2: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c5Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 2: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c5Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 3: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c6Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 3: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c6Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.relativeTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Inv 3: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c6Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
          </Grid>
        </Grid>
        <div style={{position: 'fixed', bottom:50, right: 50, zIndex: 101}}>
          <Switch
            checked={this.state.isLive}
            onChange={this.handleChange('checkedA')}
            aria-label="checkedA"
          />
        </div>
      </div>
    );
  }

}


Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
