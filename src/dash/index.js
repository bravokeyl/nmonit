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
    fill: "#3f51b5",
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

const piedata = [
  {name: 'Group A', value: 400},
  {name: 'Group B', value: 300},
  {name: 'Group C', value: 300}
]

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
    }
    this.changeEnergy = this.changeEnergy.bind(this);
    this.changeMonthEnergy = this.changeMonthEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
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
  handleChange = () => {

  }
  componentDidMount(){
    console.log("Component did mount",moment().weekday(0).format("Do MM"));
    let { date, month } = this.state;
    console.log(date,month)
    let url = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/h?dhr="+date;
    let dayURL = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/d?ddm="+month;
    let self = this;
    fetch(url)
    .then(response => response.json())
    .then(function(response) {
      let de =  self.transformData(response.energy);
      self.setState({
        energyDay: de
      });
      return response;
    });

    fetch(dayURL)
    .then(response => response.json())
    .then(function(response) {
      let de =  self.transformData(response.energy);
      console.log("DE",de,dayURL)
      self.setState({
        energyMonth: de,
        monthprogress: false,
      });
      let weekDays = getCurrentWeekArray();
      let weekEnergy = de.filter((e)=>{
        return weekDays.indexOf(e.ddt) !== -1
      });
      let group = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[],"c6":[]}
      let monthgroup = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[],"c6":[]}

      weekEnergy.map((e,i)=>{
        group["c2"].push(e.c2);
        group["c3"].push(e.c3);
        group["c4"].push(e.c4);
        return e;
      });

      let ge = _.map(group,(e,i)=>{
        return _.sum(e);
      });
      de.map((e,i)=>{
        monthgroup["c2"].push(e.c2);
        monthgroup["c3"].push(e.c3);
        monthgroup["c4"].push(e.c4);
        return e;
      });
      let me = _.map(monthgroup,(e,i)=>{
        return _.sum(e);
      });
      console.log("weekEnergy",ge[1],ge,me)
      let getotal = _.sum(ge);
      let metotal = _.sum(me);
      self.setState({
        weekEnergyRL: parseFloat(ge[1]).toFixed(2),
        weekEnergyYL: parseFloat(ge[2]).toFixed(2),
        weekEnergyBL: parseFloat(ge[3]).toFixed(2),
        weekEnergyL:  parseFloat(getotal).toFixed(2),
        monthEnergyL: parseFloat(metotal).toFixed(2),
        progessL: false,
      });
      return response;
    });

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
          <Grid item xs={6} sm={3}>
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
                    Energy - This Month
                  </Typography>
                  <Typography type="headline" component="h2">
                    {this.state.progessL?<CircularProgress size={24} />:this.state.monthEnergyL} kWh
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
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} elevation={4}>
              <div className={classes.flex}>
                <Typography color="inherit" className={classes.flex}>
                 Month Energy ( Day wise ) - {this.state.selectedMonth}
                </Typography>
                <form className={classes.container}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="en-month">Month</InputLabel>
                    <Select
                      value={this.state.selectedMonth}
                      autoWidth
                      onChange={this.handleSelectMonth('selectedMonth')}
                      input={<Input id="en-month" />}
                    >
                      {
                        months.map((e,i)=>{
                          return (<MenuItem key={e} value={e}>{e}</MenuItem>)
                        })
                      }
                    </Select>
                  </FormControl>
                </form>
              </div>
              { this.state.monthprogress ? <LinearProgress />: ""}
              <ResponsiveContainer height={350} className={ this.state.monthprogress?classes.opacity:"bk-default"}>
                <BarChart data={_.sortBy(this.state.energyMonth,['ddt'])}
                      margin={{top: 20, right: 30, left: 20, bottom: 40}}>
                   <XAxis dataKey="month" angle={-45} textAnchor="end" interval={0}/>
                   <YAxis/>
                   <CartesianGrid strokeDasharray="2 3"/>
                   <Tooltip />
                   <Bar dataKey="c2" stackId="a" fill="#f44336" />
                   <Bar dataKey="c3" stackId="a" fill="#ffc658" />
                   <Bar dataKey="c4" stackId="a" fill="#3f51b5" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} elevation={4}>
              <div>
                <div className={classes.flex}>
                  <Typography color="inherit" className={classes.flex}>
                    Day Energy ( Hour wise ) - {moment(this.state.date).format('Do MMM YYYY')}
                  </Typography>

                  <SingleDatePicker
                    date={this.state.startDate}
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
              <DialogContent>This can be because of the internet or power disconnection.</DialogContent>
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
            <EnhancedTable
              title="Day Wise Energy"
              tdata={this.state.energyMonth}
              thead={[
                {label:"Date",numeric:false,disablePadding:false,id:"ddt"},
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

// function CustomTooltip(props) {
//     const { active } = props;
//     if (active) {
//       const { payload, label } = props;
//       console.log(props);
//       return(<div className="custom-tooltip">
//         <p className="label">{`${label} : ${payload[0].value}`}</p>
//         <p className="label">{`${label} : ${payload[1].value}`}</p>
//         <p className="label">{`${label} : ${payload[2].value}`}</p>
//       </div>);
//     } else {
//       return (<div>Inactive</div>)
//     }
// }

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
