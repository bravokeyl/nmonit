import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Tabs, { Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import ReactHighcharts from 'react-highcharts';

import moment from 'moment';
import _ from 'lodash';

import config from '../aws';
import {getIdToken} from '../aws/cognito';
import offlineFetch from '../common/fetch-cache';
import OverGen from './generation';
import OverCon from './consumption';
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
  },
  tabsheader: {
    [theme.breakpoints.up('sm')]: {
      marginLeft: 16,
      marginRight: 16,
    },
    border: '1px solid #eee',
  }
});

var RP = Number(parseFloat((34.75*100)/(134.19+12.88)).toFixed(2));
var YP = Number(parseFloat((73.98*100)/(134.19+12.88)).toFixed(2));
var BP = Number(parseFloat((25.46*100)/(134.19+12.88)).toFixed(2));

var I1 = Number(parseFloat((4.76*100)/(134.19+12.88)).toFixed(2));
var I2 = Number(parseFloat((3.82*100)/(134.19+12.88)).toFixed(2));
var I3 = Number(parseFloat((4.3*100)/(134.19+12.88)).toFixed(2));

var LP = RP+YP+BP;
var SP = I1+I2+I3;

var categories = ['Load', 'Solar'],
    data = [{
        color: "rgb(43,144,143)",
        y: LP,
        drilldown: {
            name: 'Phases',
            categories: ['R-Phase', 'Y-Phase', 'B-Phase'],
            data: [RP,YP,BP],
            color: ["#f44336","#ffc658","#3f51b5"]
        }
    }, {
        color: "rgb(27, 94, 32)",
        y: SP,
        drilldown: {
            name: 'Inverters',
            categories: ['Inv 1', 'Inv 2', 'Inv 3'],
            data: [I1,I2,I3],
            color: ["#1b5e20","#4c8c4a","#387002"]
        }
    }],
    pieEnergyData = [],
    pieChannelData = [],
    i,
    j,
    dataLen = data.length,
    drillDataLen,
    brightness;

for (i = 0; i < dataLen; i += 1) {
    pieEnergyData.push({
        name: categories[i],
        y: data[i].y,
        color: data[i].color
    });
    drillDataLen = data[i].drilldown.data.length;
    for (j = 0; j < drillDataLen; j += 1) {
        brightness = 0.2 - (j / drillDataLen) / 5;
        pieChannelData.push({
            name: data[i].drilldown.categories[j],
            y: data[i].drilldown.data[j],
            color: data[i].drilldown.color[j]
        });
    }
}

const barconfig = {
  chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: ''
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Energy',
        colorByPoint: true,
        data: [{
            name: 'Load',
            y: 56.33
        }, {
            name: 'Solar',
            y: 24.03,
            sliced: true,
            selected: true
        }]
    }]
}

const pieDrill = {
    chart: {
        type: 'pie'
    },
    title: {
        text: "<b>Generation vs Load</b>"
    },
    subtitle: {
        text: null
    },
    yAxis: {
        title: {
            text: 'Energy'
        }
    },
    plotOptions: {
        pie: {
            shadow: false,
            center: ['50%', '50%']
        }
    },
    tooltip: {
        valueSuffix: '%'
    },
    series: [{
        name: 'Energy',
        data: pieEnergyData,
        size: '60%',
        dataLabels: {
            formatter: function () {
                return this.y > 5 ? this.point.name : null;
            },
            color: '#ffffff',
            distance: -30
        }
    }, {
        name: 'Energy',
        data: pieChannelData,
        size: '80%',
        innerSize: '60%',
        dataLabels: {
            formatter: function () {
                // display only if larger than 1
                return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
                    this.y + '%' : null;
            }
        },
        id: 'versions'
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 400
            },
            chartOptions: {
                series: [{
                    id: 'versions',
                    dataLabels: {
                        enabled: false
                    }
                }]
            }
        }]
    }
};
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
      load: {
        todayEnergyL: 0,
        weekEnergyL: 0,
        monthEnergyL: 0,
        totalEnergyL: 0,
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

      value: 0,
    }
    this.transformData = this.transformData.bind(this);
    this.handleSelectMonth = this.handleSelectMonth.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
  }
  handleChange = (event, value) => {
    this.setState({
      value: value
    });
  };
  handleChangeIndex = index => {
    this.setState({ value: index });
  };
  transformData = (d) => {
    if(d){
      d.map((data, i) => {
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
        gen: {
          ...prevState.gen,
          todayEnergyGenL: parseFloat(daytotalGeneration).toFixed(3)
        },
        load: {
          ...prevState.load,
          todayEnergyL: parseFloat(daytotalConsumption).toFixed(3),
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
        progessL: false,
        gen: {
          ...prevState.gen,
          monthEnergyGenL: parseFloat(metotalGen).toFixed(3)
        },
        load: {
          ...prevState.load,
          monthEnergyL: parseFloat(metotal).toFixed(3),
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
      if(!de) {
        console.log("No Data");
        de = [];
      }
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
        gen: {
          ...prevState.gen,
          weekEnergyGenL: parseFloat(weektotalGen).toFixed(3)
        },
        load: {
          ...prevState.load,
          weekEnergyL: parseFloat(weektotal).toFixed(3),
          weekEnergyRL: parseFloat(me[0]).toFixed(3),
          weekEnergyYL: parseFloat(me[1]).toFixed(3),
          weekEnergyBL: parseFloat(me[2]).toFixed(3),
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
        gen: {
          ...prevState.gen,
          totalEnergyGenL: parseFloat(yeartotalGen).toFixed(3)
        },
        load: {
          ...prevState.load,
          totalEnergyL: parseFloat(yeartotal).toFixed(3)
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
        <Typography type="title" style={{margin:16}}>
          PVSystem: {pvsystem}
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={6}>
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
              fullWidth
              className={classes.tabsheader}
            >
              <Tab label="Generation" />
              <Tab label="Consumption" />
            </Tabs>
            <SwipeableViews
              axis='x'
              index={this.state.value}
              onChangeIndex={this.handleChangeIndex}>
              <OverGen data={this.state.gen} />
              <OverCon data={this.state.load}/>
            </SwipeableViews>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={0}>
              <ReactHighcharts config={pieDrill} ref="chart"></ReactHighcharts>
            </Grid>
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
