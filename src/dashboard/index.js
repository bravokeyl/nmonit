import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import Dialog, { DialogTitle, DialogContent,DialogActions } from 'material-ui/Dialog';
import { LinearProgress, CircularProgress } from 'material-ui/Progress';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Switch from 'material-ui/Switch';
import Select from 'material-ui/Select';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';

import 'react-dates/initialize';
import { SingleDatePicker, isInclusivelyBeforeDay } from 'react-dates';

import moment from 'moment';
import _ from 'lodash';

import {PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from  'recharts';

import EnhancedTable from '../common/table';

import 'react-dates/lib/css/_datepicker.css';
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

const months = moment.months();
const getCurrentWeekArray = () => {
  let days = [];
  for(let i=0;i<7;i++){
    days.push(moment().weekday(i).format("DD"))
  }
  return days;
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
class Dashboard extends Component {
  constructor(props){
    super(props);
    this.state = {
      progessL: true,
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
      c2Voltage: 0,
      c3Voltage: 0,
      c4Voltage: 0,
      c2Current: 0,
      c3Current: 0,
      c4Current: 0,
      c2Power: 0,
      c3Power: 0,
      c4Power: 0,
      liveTimestamp: false,

      isLive: false,
    }
    this.changeEnergy = this.changeEnergy.bind(this);
    this.changeMonthEnergy = this.changeMonthEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
    this.getLive = this.getLive.bind(this);
    this.getLiveData = this.getLiveData.bind(this);
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
  changeEnergy = (date) => {
    let dhr = moment(date).format('YYYY/MM/DD');
    let url = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/h?dhr="+dhr;
    let self = this;
    self.setState({
      progress: true
    })
    fetch(url)
    .then(response => response.json())
    .then(function(response) {
      console.log("Date Changed Energy:",response,typeof response);
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
      console.log(self.state.energyDay,"SD")
      return response;
    });

  }
  changeMonthEnergy = (month) => {
    let ddm = moment().month(month).format("YYYY/MM");
    let url = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/d?ddm="+ddm;
    let self = this;
    let prevMonth = this.state.selectedMonth;
    self.setState({
      monthprogress: true,
      ["selectedMonth"]: month,
    })
    fetch(url)
    .then(response => response.json())
    .then(function(response) {
      console.log("Month Changed Energy:",response,typeof response);
      if(response.energy) {
        let de =  self.transformData(response.energy);
        console.log("Month transformData:",de)
        self.setState({
          energyMonth: de,
          monthprogress: false,
        });
      } else {
        self.setState({
          ["selectedMonth"]: prevMonth,
          monthprogress: false,
          dialogOpen: true
        })
      }
      return response;
    });

  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handleSelectMonth = name => event => {
    this.changeMonthEnergy(event.target.value);
  };
  handleChange = name => (event, checked) => {
   this.setState({ isLive: checked });
   let self = this;
   let intervalId = setInterval(self.getLive, 10*1000);
   self.setState({intervalId: intervalId});
  };
  getLiveData = () => {
    for(let i=2;i<5;i++){
      let url = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/l?c="+i;
      let self = this;
      fetch(url)
      .then(response => response.json())
      .then(function(response) {
        console.log("Channel:",i," Data:", response);
        let voltage = "c"+i+"Voltage";
        self.setState({
          [voltage]: response.voltage,
          ["c"+i+"Current"]: response.current,
          ["c"+i+"Power"]: response.power,
        });
        if(i==4){
          self.setState({
            progessL: false,
            liveTimestamp: moment(response.timestamp).fromNow(),
          });
        }
        return response;
      });
    }
  };
  getLive = () => {
    console.log("After 10 secs", new Date());
    if(this.state.isLive){
      this.getLiveData();
    } else {
      clearInterval(this.state.intervalId);
    }
  };
  componentDidMount(){
    console.log("Component did mount");
    let self = this;
    this.getLiveData();
  }
  componentWillUnmount() {
   clearInterval(this.state.intervalId);
  }
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    R-Phase: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c2Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.liveTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    R-Phase: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c2Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.lastupdated}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    R-Phase: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c2Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Energy - Total
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c3Voltage} kWh
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>


          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Y-Phase: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c3Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.liveTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Y-Phase: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c3Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.liveTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    Y-Phase: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c3Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
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
                Energy - Total
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    B-Phase: Voltage
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c4Voltage} V
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.liveTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    B-Phase: Current
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />: this.state.c4Current} Amps
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Last updated: {this.state.liveTimestamp}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card className={classes.card}>
              <div className={classes.details}>
                <ChromeReaderModeIcon className={classes.icon}/>
                <CardContent className={classes.content}>
                  <Typography type="body1" className={classes.title}>
                    B-Phase: Power
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.c4Power} W
                  </Typography>
                </CardContent>
              </div>
              <Typography type="body1" className={classes.info}>
                Energy - Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
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
                Energy - Total
              </Typography>
            </Card>
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
