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
      selectedYear: moment().format('YYYY')
    }
    this.changeMonthEnergy = this.changeMonthEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  transformData = (d) => {
    if(d){
      d.map((data, i) => {
        data = channelMap(data);

        if(data['dhr']){
          data["dhr"] = data['dhr'].split('/').reverse()[0];
          data['day'] = "Hour "+Number(data['dhr']) +" - "+(Number(data['dhr'])+1);
        }
        if(data['ddt']){
          data['month'] = moment(data['ddt']).format("MMM Do YYYY");
          data['xm'] = moment(data['ddt']).format("MMM Do");
          data["ddt"] = data['ddt'].split('/').reverse()[0];
        }
        data['ltotal'] = Number(parseFloat(data["c1"]+data["c2"]+data["c3"]).toFixed(2));
        data['stotal'] = Number(parseFloat(data["c4"]+data["c5"]+data["c6"]).toFixed(2));
        return d;
      });
    } else {
      d = [];
    }
    return d;
  }
  changeMonthEnergy = (month,y) => {
    console.log("Month",month);
    if(moment(month,"MMMM").isValid()){
      // month =
    }
    let monthdiff = moment().diff(moment(month,'YYYY/MM'),'days');
    console.log("Month Diff",monthdiff)
    let monthApiHeaders = APIHEADERS;
    if(monthdiff >= 1) {
      monthApiHeaders.offline.expires = 1000*60*60*24*28;
    } else {
      monthApiHeaders.offline.expires = 1000*60*5;
    }
    let ddm = moment(month).format("YYYY/MM");
    if(y){
      let monthYear = this.state.selectedYear+"/"+month;
      month = this.state.selectedYear+"/"+month;
      ddm = moment(monthYear,'YYYY/MMMM').format("YYYY/MM");
    }
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    let url = baseApiURL+"d?ddm="+ddm;
    let self = this;
    let prevMonth = this.state.selectedMonth;
    self.setState({
      monthprogress: true,
      "selectedMonth": moment(ddm,'YYYY/MM').format('MMMM')
    })
    offlineFetch(url,monthApiHeaders)
    .then(response => response.json())
    .then(function(response) {
      if(response.energy) {
        let de =  self.transformData(response.energy);
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
    console.log(event.target.value,"EVENT")
    this.changeMonthEnergy(event.target.value,true);
  };
  handleChange = () => {

  }
  handleClick(data,e) {
    if(data){
      console.log("Month active label",data)
      this.props.indexV(e,0,moment(data.activeLabel,'MMM Do YYYY'));
    } else {
      console.log("Clicked outside of the bars");
    }
  };
  componentWillReceiveProps(n,o) {
    if(n.month){
      let nd = moment(n.month,'YYYY/MM').format("YYYY/MM");
      console.log("PROPS Month",n.month,nd);
      this.setState({
        selectedYear: moment(nd).format('YYYY')
      })
      this.changeMonthEnergy(nd,false);
    }
  }
  componentDidMount(){
    console.info("MonthGen component did mount",this.props.apiPath);
    let { month } = this.state;
    let apiPath =  JSON.parse(window.localStorage.getItem('nuser')).p;
    let baseApiURL = "https://api.blufieldsenergy.com/"+apiPath+"/";
    APIHEADERS.headers.Authorization = this.state.idToken;
    let dayURL = baseApiURL+"d?ddm="+month;
    let self = this;

    offlineFetch(dayURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de;
      if(response.energy){
        de =  self.transformData(response.energy,apiPath);
      } else {
        de =  self.transformData([response],apiPath);
      }

      self.setState({
        energyMonth: de,
        monthprogress: false,
      });
      console.log("TME:",self.state.energyMonth);
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
                      maxBarSize={30} unit="kWh"
                      margin={{top: 20, right: 30, left: 20, bottom: 40}}
                      onClick={this.handleClick}>
                   <XAxis dataKey="xm" angle={-45} textAnchor="end" interval={0}/>
                   <YAxis/>
                   <CartesianGrid strokeDasharray="2 3"/>
                   <Tooltip />
                   <Bar cursor="pointer" dataKey="R" stackId="a" fill="#f44336"/>
                   <Bar cursor="pointer" dataKey="Y" stackId="a" fill="#ffc658"/>
                   <Bar cursor="pointer" dataKey="B" stackId="a" fill="#3f51b5"/>

                   <Bar cursor="pointer" dataKey="i1" stackId="b" fill="#1b5e20"/>
                   <Bar cursor="pointer" dataKey="i2" stackId="b" fill="#4c8c4a"/>
                   <Bar cursor="pointer" dataKey="i3" stackId="b" fill="#387002"/>
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
                {label:"Load",numeric:true,disablePadding:false,id:"ltotal"},
                {label:"Solar",numeric:true,disablePadding:false,id:"stotal"},
                {label:"R-Load",numeric:true,disablePadding:false,id:"R"},
                {label:"Y-Load",numeric:true,disablePadding:false,id:"Y"},
                {label:"B-Load",numeric:true,disablePadding:false,id:"B"},
                {label:"Inv 1",numeric:true,disablePadding:false,id:"i1"},
                {label:"Inv 2",numeric:true,disablePadding:false,id:"i2"},
                {label:"Inv 3",numeric:true,disablePadding:false,id:"i3"},
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
