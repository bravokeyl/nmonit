import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import compose from 'recompose/compose';
import withWidth from 'material-ui/utils/withWidth';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Dialog, { DialogTitle, DialogContent,DialogActions } from 'material-ui/Dialog';
import { LinearProgress } from 'material-ui/Progress';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import Select from 'material-ui/Select';
// import Hidden from 'material-ui/Hidden';

import moment from 'moment';
import _ from 'lodash';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from  'recharts';

import EnhancedTable from '../common/table';
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
    o = Number(parseFloat(o).toFixed(3))
  } else{
    o = Number(parseFloat(d).toFixed(3));
  }
  return o;
}
class MonthGen extends Component {
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
      month: moment().format('YYYY/MM'),
      startDate: moment(),
      focused: false,
      progess: true,
      monthprogress: true,
      dialogOpen: false,
      selectedMonth: moment().format('MMMM'),
    }
    this.changeMonthEnergy = this.changeMonthEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
    this.handleClick = this.handleClick.bind(this);
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
  changeMonthEnergy = (month) => {
    let monthdiff = moment().diff(moment().month(month),'days');
    console.log("Changed Month:",monthdiff);
    let monthApiHeaders = APIHEADERS;
    if(monthdiff >= 1) {
      monthApiHeaders.offline.expires = 1000*60*60*24*28;
    } else {
      monthApiHeaders.offline.expires = 1000*60*5;
    }
    console.log("HeadersMonth:",monthApiHeaders);
    let ddm = moment().month(month).format("YYYY/MM");
    let url = "https://api.blufieldsenergy.com/v1/d?ddm="+ddm;
    let self = this;
    let prevMonth = this.state.selectedMonth;
    self.setState({
      monthprogress: true,
      "selectedMonth": month,
    })
    offlineFetch(url,monthApiHeaders)
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
          monthprogress: false,
          dialogOpen: true,
          selectedMonth: prevMonth,
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
  handleClick(data,e) {
    if(data){
      this.props.indexV(e,0);
      // this.props.history.push('/l/'+moment(data.activeLabel,'MMM Do').format('DDMMYYYY'));
    } else {
      console.log("Clicked outside of the bars");
    }
  };
  componentDidMount(){
    console.info("MonthGen component did mount");
    let { month } = this.state;
    APIHEADERS.headers.Authorization = this.state.idToken;
    let dayURL = "https://api.blufieldsenergy.com/v1/d?ddm="+month;
    let self = this;

    offlineFetch(dayURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      console.log("Res",response);
      let de;
      if(response.energy){
        de =  self.transformData(response.energy);
      } else {
        de =  self.transformData([response]);
      }

      console.log("DE",de,dayURL,response)

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
        weekEnergyRL: parseFloat(ge[1]).toFixed(3),
        weekEnergyYL: parseFloat(ge[2]).toFixed(3),
        weekEnergyBL: parseFloat(ge[3]).toFixed(3),
        weekEnergyL:  parseFloat(getotal).toFixed(3),
        monthEnergyL: parseFloat(metotal).toFixed(3),
        progessL: false,
      });
      return response;
    });

  }
  render(){
    const { classes, width } = this.props;
    const { activeIndex } = this.state;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <Paper className={classes.paper} elevation={4}>
              <div className={classes.flex}>
                <Typography color="inherit" className={classes.flex}>
                 Month Energy ( Day wise ){width} - {this.state.selectedMonth}
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
                      maxBarSize={30} unit="kWh"
                      margin={{top: 20, right: 30, left: 20, bottom: 40}}
                      onClick={this.handleClick}>
                   <XAxis dataKey="month" angle={-45} textAnchor="end" interval={0}/>
                   <YAxis/>
                   <CartesianGrid strokeDasharray="2 3"/>
                   <Tooltip />
                   <Bar cursor="pointer" dataKey="c2" stackId="a" fill="#f44336"/>
                   <Bar cursor="pointer" dataKey="c3" stackId="a" fill="#ffc658"/>
                   <Bar cursor="pointer" dataKey="c4" stackId="a" fill="#3f51b5"/>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12}>
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
        </Grid>
      </div>
    );
  }

}

MonthGen.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
};

export default compose(withStyles(styles), withWidth())(withRouter(MonthGen));
