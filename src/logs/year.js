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
        retries: 1,
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

const years = ["2015","2016","2017"];
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
class YearGen extends Component {
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
      energyYear: [],
      year: moment().format('YYYY/'),
      startDate: moment(),
      focused: false,
      progess: true,
      yearprogress: true,
      dialogOpen: false,
      selectedYear: moment().format('YYYY'),
    }
    this.changeYearEnergy = this.changeYearEnergy.bind(this);
    this.transformData = this.transformData.bind(this);
    this.handleSelectYear = this.handleSelectYear.bind(this);
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
        data['month'] = moment(data['ddm']).format("MMMM");
        data["ddm"] = moment(data['ddm']).format("MMM");
        return d;
      });
    } else {
      d = [];
    }
    return d;
  }
  changeYearEnergy = (year) => {
    let yearApiHeaders = APIHEADERS;
    yearApiHeaders.offline.expires = 1000*60*60;
    let url = "https://api.blufieldsenergy.com/v1/m?ddm="+year;
    let self = this;
    let prevYear = this.state.selectedYear;
    self.setState({
      yearprogress: true,
      "selectedYear": year,
    });
    offlineFetch(url,yearApiHeaders)
    .then(response => response.json())
    .then(function(response) {
      console.log("Year Changed Energy:",response,typeof response);
      if(response.energy) {
        let de =  self.transformData(response.energy);
        console.log("Year transformData:",de)
        self.setState({
          energyYear: de,
          yearprogress: false,
        });
      } else {
        self.setState({
          yearprogress: false,
          dialogOpen: true,
          selectedYear: prevYear,
        });
      }
      return response;
    })
    // .catch((err)=>{
    //   console.error("FETCH Failed:",err);
    //   self.setState({
    //     yearprogress: false,
    //     selectedYear: prevYear
    //   });
    // });

  }
  handleRequestClose = () => {
    this.setState({ dialogOpen: false });
  }
  handleSelectYear = name => event => {
    this.changeYearEnergy(event.target.value);
  };
  handleChange = () => {

  }
  handleClick(data,e) {
    if(data){
      this.props.indexV(e,0,moment(data.activeLabel,'MMM Do'));
      // this.props.history.push('/l/'+moment(data.activeLabel,'MMM Do').format('DDMMYYYY'));
    } else {
      console.log("Clicked outside of the bars");
    }
  };
  componentDidMount(){
    console.info("YearGen component did mount");
    let { year } = this.state;
    APIHEADERS.headers.Authorization = this.state.idToken;
    let yearURL = "https://api.blufieldsenergy.com/v1/m?ddm="+year;
    let self = this;

    offlineFetch(yearURL,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      let de;
      if(response.energy){
        de =  self.transformData(response.energy);
      } else {
        de =  self.transformData([response]);
      }
      self.setState({
        energyYear: de,
        yearprogress: false,
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
              <div className={classes.flex}>
                <Typography color="inherit" className={classes.flex}>
                 Year Energy ( Month wise ) - {this.state.selectedYear}
                </Typography>
                <form className={classes.container}>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="en-year">Year</InputLabel>
                    <Select
                      value={this.state.selectedYear}
                      autoWidth
                      onChange={this.handleSelectYear('selectedYear')}
                      input={<Input id="en-year" />}
                    >
                      {
                        years.map((e,i)=>{
                          return (<MenuItem key={e} value={e}>{e}</MenuItem>)
                        })
                      }
                    </Select>
                  </FormControl>
                </form>
              </div>
              { this.state.yearprogress ? <LinearProgress />: ""}
              <ResponsiveContainer height={350} className={ this.state.yearprogress?classes.opacity:"bk-default"}>
                <BarChart data={_.sortBy(this.state.energyYear,['ddm'])}
                      maxBarSize={30} unit="kWh"
                      margin={{top: 20, right: 30, left: 20, bottom: 40}}
                      onClick={this.handleClick}>
                   <XAxis dataKey="ddm" angle={-45} textAnchor="end" interval={0}/>
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
              title="Month Wise Energy"
              tdata={this.state.energyYear}
              thead={[
                {label:"Month",numeric:false,disablePadding:false,id:"month"},
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

YearGen.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
};

export default compose(withStyles(styles), withWidth())(withRouter(YearGen));
