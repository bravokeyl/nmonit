import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Table, {TableBody,TableCell,TableFooter,TableHead,TablePagination,TableRow,TableSortLabel} from 'material-ui/Table';
import Dialog, { DialogTitle, DialogContent,DialogActions } from 'material-ui/Dialog';
import { CircularProgress, LinearProgress } from 'material-ui/Progress';

import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController, isInclusivelyBeforeDay } from 'react-dates';
import moment from 'moment';
import _ from 'lodash';

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer} from  'recharts';

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
  chart: {
    height: 300
  }
});


const energyDay = [
    {
      "c2": 5086.37,
      "c3": 1425.29,
      "c4": 1041.84,
      "ddt": "2017/10/09",
      "c5": 176582.29,
      "c6": 753.66,
      "device": "esp8266_1ACD99",
      "c1": 701246.74
    },
    {
      "c2": 3766.9,
      "c3": 1253.58,
      "c4": 705.02,
      "ddt": "2017/10/08",
      "c5": 373816.58,
      "c6": 634.33,
      "device": "esp8266_1ACD99",
      "c1": 704013.75
    },
    {
      "c2": 6119.57,
      "c3": 1998.41,
      "c4": 1315.45,
      "ddt": "2017/10/07",
      "c5": 420243.18,
      "c6": 455.82,
      "device": "esp8266_1ACD99",
      "c1": 868658.31
    },
    {
      "c2": 3999.28,
      "c3": 1987.42,
      "c4": 1381.08,
      "ddt": "2017/10/06",
      "c5": 195597.87,
      "c6": 4851.68,
      "device": "esp8266_1ACD99",
      "c1": 595179.36
    },
    {
      "c2": 5188.28,
      "c3": 2526.95,
      "c4": 1539,
      "ddt": "2017/10/05",
      "c5": 218477.49,
      "c6": 4102.83,
      "device": "esp8266_1ACD99",
      "c1": 733123.21
    },
    {
      "c2": 4786.72,
      "c3": 1904.83,
      "c4": 1239.4,
      "ddt": "2017/10/04",
      "c5": 180598.04,
      "c6": 6988.22,
      "device": "esp8266_1ACD99",
      "c1": 784872.81
    },
    {
      "c2": 5350.45,
      "c3": 1908.98,
      "c4": 1351.26,
      "ddt": "2017/10/03",
      "c5": 596.23,
      "c6": 3215.91,
      "device": "esp8266_1ACD99",
      "c1": 669370.31
    },
    {
      "c2": 3914.65,
      "c3": 1803.1,
      "c4": 1132.52,
      "ddt": "2017/10/02",
      "c5": 213063.47,
      "c6": 4554.87,
      "device": "esp8266_1ACD99",
      "c1": 732596.01
    },
    {
      "c2": 3787.18,
      "c3": 1647,
      "c4": 862.3,
      "ddt": "2017/10/01",
      "c5": 389041.36,
      "c6": 13184.55,
      "device": "esp8266_1ACD99",
      "c1": 701246.73
    }
];

class Dashboard extends Component {
  constructor(props){
    super(props);
    let ds = [[],[],[]];
    let dx = [];
    this.state = {
      energyDay: [],
      energyMonth: [],
      date: moment().format('YYYY/MM/DD'),
      month: moment().format('YYYY/MM'),
      startDate: moment(),
      focused: false,
      progess: true,
      dialogOpen: false
    }
    this.changeEnergy = this.changeEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
  }

  transformData = (d) => {
    d.map((data, i) => {
      data["c2"] = Number(parseFloat(data["c2"]/100).toFixed(2));
      data["c3"] = Number(parseFloat(data["c3"]/100).toFixed(2));
      data["c4"] = Number(parseFloat(data["c4"]/100).toFixed(2));
      if(data["c2"] < 0) data["c2"] = 0;
      if(data["c3"] < 0) data["c3"] = 0;
      if(data["c4"] < 0) data["c4"] = 0;
      if(data['dhr'])
      data["dhr"] = data['dhr'].split('/').reverse()[0];
      if(data['ddt'])
      data["ddt"] = data['ddt'].split('/').reverse()[0];
    });
    console.log("ENNE",d);
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
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  componentDidMount(){
    console.log("Component did mount");
    let { date, month } = this.state;
    console.log(date,month)
    let url = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/h?dhr="+date;
    let dayURL = "https://pyz1xbouqb.execute-api.us-east-1.amazonaws.com/a/d?ddm="+month;
    let self = this;
    let res = fetch(url)
    .then(response => response.json())
    .then(function(response) {
      console.log("Response:",response);
      let de =  self.transformData(response.energy);
      self.setState({
        energyDay: de
      });
      console.log(self.state.energyDay,"STATTE")
      return response;
    });
    res = fetch(dayURL)
    .then(response => response.json())
    .then(function(response) {
      console.log("dayURL Response:",response,typeof response);
      let de =  self.transformData(response.energy);
      self.setState({
        energyMonth: de
      });
      console.log(self.state.energyDay,"STATTE")
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
              <Typography color="inherit" className={classes.flex}>
               Month Energy ( Day wise ) - {this.state.month}
              </Typography>
              <ResponsiveContainer height={350}>
                <BarChart data={_.sortBy(this.state.energyMonth,['ddt'])}
                      margin={{top: 20, right: 30, left: 20, bottom: 5}} barSize={30}>
                   <XAxis dataKey="ddt"/>
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
                    isOutsideRange = {day =>!isInclusivelyBeforeDay(day, moment())}
                    onFocusChange={({ focused }) => this.setState({ focused })}
                  />
                </div>
                { this.state.progress ? <LinearProgress />: ""}
                <ResponsiveContainer height={350}>
                  <BarChart data={_.sortBy(this.state.energyDay,['dhr'])}
                    margin={{top: 20, right: 30, left: 20, bottom: 5}} barSize={30}>
                 <XAxis dataKey="dhr"/>
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
            <Paper className={classes.paper} elevation={4}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Hour</TableCell>
                    <TableCell>Channel 1</TableCell>
                    <TableCell numeric>Channel 2</TableCell>
                    <TableCell numeric>Channel 3</TableCell>
                    <TableCell numeric>Channel 4</TableCell>
                    <TableCell numeric>Channel 5</TableCell>
                    <TableCell numeric>Channel 6</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.energyDay.map(n => {
                    return (
                      <TableRow key={n.dhr}>
                        <TableCell>{n.dhr}</TableCell>
                        <TableCell>{n.c1}</TableCell>
                        <TableCell numeric>{n.c2}</TableCell>
                        <TableCell numeric>{n.c3}</TableCell>
                        <TableCell numeric>{n.c4}</TableCell>
                        <TableCell numeric>{n.c5}</TableCell>
                        <TableCell numeric>{n.c6}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
            <EnhancedTable
              title="Day Wise Energy"
              tdata={this.state.energyMonth}
              thead={[
                {label:"Date",numeric:true,disablePadding:false,id:"ddt"},
                {label:"C1",numeric:true,disablePadding:false,id:"c1"},
                {label:"C2",numeric:true,disablePadding:false,id:"c2"},
                {label:"C3",numeric:true,disablePadding:false,id:"c3"},
                {label:"C4",numeric:true,disablePadding:false,id:"c4"},
                {label:"C5",numeric:true,disablePadding:false,id:"c5"},
                {label:"C6",numeric:true,disablePadding:false,id:"c6"}
              ]}/>
          </Grid>
        </Grid>
      </div>
    );
  }

}

function CustomTooltip(props) {
    const { active } = props;
    if (active) {
      const { payload, label } = props;
      console.log(props);
      return(<div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
        <p className="label">{`${label} : ${payload[1].value}`}</p>
        <p className="label">{`${label} : ${payload[2].value}`}</p>
      </div>);
    } else {
      return (<div>Inactive</div>)
    }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
