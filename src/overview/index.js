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
import { getIdToken } from '../aws/cognito';
import offlineFetch from '../common/fetch-cache';
import NuevoOverGen from './generation';
import NuevoOverCon from './consumption';
import { channelMap, bkLog } from '../common/utils';

const API_KEY = config.LocalAPIKey;
const APIHEADERS = {
  headers: {
    'X-Api-Key': API_KEY,
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
  },
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
    display: 'flex',
    flexDirection: 'column',
    margin: 16,
  },
  details: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: '16px !important',
  },
  icon: {
    width: 48,
    height: 48,
    paddingLeft: 16,
    fill: '#f96f40',
  },
  info: {
    marginBottom: 12,
    paddingLeft: 16,
    color: theme.palette.text.secondary,
  },
  chart: {
    height: 300,
  },
  opacity: {
    opacity: 0.5,
  },
  tabsheader: {
    [theme.breakpoints.up('sm')]: {
      marginLeft: 16,
      marginRight: 16,
    },
    border: '1px solid #eee',
  },
});

const RP = Number(parseFloat((34.75 * 100) / (134.19 + 12.88)).toFixed(2));
const YP = Number(parseFloat((73.98 * 100) / (134.19 + 12.88)).toFixed(2));
const BP = Number(parseFloat((25.46 * 100) / (134.19 + 12.88)).toFixed(2));

const I1 = Number(parseFloat((4.76 * 100) / (134.19 + 12.88)).toFixed(2));
const I2 = Number(parseFloat((3.82 * 100) / (134.19 + 12.88)).toFixed(2));
const I3 = Number(parseFloat((4.3 * 100) / (134.19 + 12.88)).toFixed(2));

const LP = RP + YP + BP;
const SP = I1 + I2 + I3;

const categories = ['Load', 'Solar'];
const data = [
  {
    color: 'rgb(43,144,143)',
    y: LP,
    drilldown: {
      name: 'Phases',
      categories: ['R-Phase', 'Y-Phase', 'B-Phase'],
      data: [RP, YP, BP],
      color: ['#f44336', '#ffc658', '#3f51b5'],
    },
  },
  {
    color: 'rgb(27, 94, 32)',
    y: SP,
    drilldown: {
      name: 'Inverters',
      categories: ['Inv 1', 'Inv 2', 'Inv 3'],
      data: [I1, I2, I3],
      color: ['#1b5e20', '#4c8c4a', '#387002'],
    },
  },
];
const pieEnergyData = [];
const pieChannelData = [];
let i;
let j;
const dataLen = data.length;
let drillDataLen;

for (i = 0; i < dataLen; i += 1) {
  pieEnergyData.push({
    name: categories[i],
    y: data[i].y,
    color: data[i].color,
  });
  drillDataLen = data[i].drilldown.data.length;
  for (j = 0; j < drillDataLen; j += 1) {
    pieChannelData.push({
      name: data[i].drilldown.categories[j],
      y: data[i].drilldown.data[j],
      color: data[i].drilldown.color[j],
    });
  }
}

const pieDrill = {
  chart: {
    type: 'pie',
  },
  title: {
    text: '<b>Generation vs Load</b>',
  },
  subtitle: {
    text: null,
  },
  yAxis: {
    title: {
      text: 'Energy',
    },
  },
  plotOptions: {
    pie: {
      shadow: false,
      center: ['50%', '50%'],
    },
  },
  tooltip: {
    valueSuffix: '%',
  },
  series: [{
    name: 'Energy',
    data: pieEnergyData,
    size: '60%',
    dataLabels: {
      formatter: () => (this.y > 5 ? this.point.name : null),
      color: '#ffffff',
      distance: -30,
    },
  }, {
    name: 'Energy',
    data: pieChannelData,
    size: '80%',
    innerSize: '60%',
    dataLabels: {
      formatter: () => (this.y > 1 ? `<b>${this.point.name} : </b> ${this.y} %` : null),
    },
    id: 'versions',
  }],
  responsive: {
    rules: [{
      condition: {
        maxWidth: 400,
      },
      chartOptions: {
        series: [{
          id: 'versions',
          dataLabels: {
            enabled: false,
          },
        }],
      },
    }],
  },
};

class NuevoOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: getIdToken() ? getIdToken().jwtToken : '',
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
      date: moment().format('YYYY/MM/DD'),
      month: moment().format('YYYY/MM'),
      value: 0,
    };
  }
  componentDidMount() {
    const { date, month } = this.state;
    bkLog('Overview did mount.');
    const apiPath = JSON.parse(window.localStorage.getItem('nuser')).key;
    APIHEADERS.headers.Authorization = this.state.idToken;
    this.getHourData(date, apiPath);
    this.getDayData(month, apiPath);
    this.getWeekData(apiPath);
    this.getMonthData(apiPath);
  }
  componentWillReceiveProps(np) {
    bkLog('Overview container receiving props', np, this.props);
    try {
      if (np.selectedPVSystem && np.selectedPVSystem.key) {
        const { date, month } = this.state;
        const apiPath = np.selectedPVSystem.key;
        APIHEADERS.headers.Authorization = this.state.idToken;
        this.getHourData(date, apiPath);
        this.getDayData(month, apiPath);
        this.getWeekData(apiPath);
        this.getMonthData(apiPath);
      }
    } catch (error) {
      bkLog('Overview Props Error:', error);
    }
  }
  /* HourWise Data */
  getHourData = (date, apiPath) => {
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const url = `${baseApiURL}h?dhr=${date}`;
    const self = this;
    offlineFetch(url, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let de = response.energy;
        if (!de) {
          de = [];
        }
        const dayEnergyConsumption = { R: [], Y: [], B: [] };
        const dayEnergyGeneration = { i1: [], i2: [], i3: [] };
        de.map((e) => {
          dayEnergyConsumption.R.push(e.R);
          dayEnergyConsumption.Y.push(e.Y);
          dayEnergyConsumption.B.push(e.B);
          dayEnergyGeneration.i1.push(e.i1);
          dayEnergyGeneration.i2.push(e.i2);
          dayEnergyGeneration.i3.push(e.i3);
          return e;
        });
        const mec = _.map(dayEnergyConsumption, e => _.sum(e));
        const meg = _.map(dayEnergyGeneration, e => _.sum(e));
        const daytotalConsumption = _.sum(mec);
        const daytotalGeneration = _.sum(meg);
        self.setState(prevState => ({
          gen: {
            ...prevState.gen,
            todayEnergyGenL: Number(parseFloat(daytotalGeneration).toFixed(3)),
          },
          load: {
            ...prevState.load,
            todayEnergyL: Number(parseFloat(daytotalConsumption).toFixed(3)),
          },
        }));
        return response;
      });
  }
  /* Daywise Data */
  getDayData = (month, apiPath) => {
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const dayURL = `${baseApiURL}d?ddm=${month}`;
    const self = this;
    offlineFetch(dayURL, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let de;
        if (response.energy) {
          de = self.transformData(response.energy);
        } else {
          de = self.transformData([response]);
        }
        self.setState({
          energyMonth: de,
        });

        const monthgroup = { R: [], Y: [], B: [] };
        const monthgroupGen = { i1: [], i2: [], i3: [] };
        de.map((e) => {
          monthgroup.R.push(e.R);
          monthgroup.Y.push(e.Y);
          monthgroup.B.push(e.B);
          monthgroupGen.i1.push(e.i1);
          monthgroupGen.i2.push(e.i2);
          monthgroupGen.i3.push(e.i3);
          return e;
        });

        const me = _.map(monthgroup, e => _.sum(e));
        const meg = _.map(monthgroupGen, e => _.sum(e));

        const metotal = _.sum(me);
        const metotalGen = _.sum(meg);
        self.setState(prevState => ({
          progessL: false,
          gen: {
            ...prevState.gen,
            monthEnergyGenL: Number(parseFloat(metotalGen).toFixed(3)),
          },
          load: {
            ...prevState.load,
            monthEnergyL: Number(parseFloat(metotal).toFixed(3)),
          },
        }));
        return response;
      }, (error) => {
        bkLog('Day Fetch Error', error);
      });
  }
  /* Week Data */
  getWeekData = (apiPath) => {
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;
    const weekURL = `${baseApiURL}we`;
    const self = this;
    offlineFetch(weekURL, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let de = response.energy;
        const dayEnergy = { R: [], Y: [], B: [] };
        const dayEnergyGen = { i1: [], i2: [], i3: [] };
        if (!de) {
          bkLog('No Data: weekURL');
          de = [];
        }
        de.map((e) => {
          dayEnergy.R.push(e.R);
          dayEnergy.Y.push(e.Y);
          dayEnergy.B.push(e.B);
          dayEnergyGen.i1.push(e.i1);
          dayEnergyGen.i2.push(e.i2);
          dayEnergyGen.i3.push(e.i3);
          return e;
        });
        const me = _.map(dayEnergy, e => _.sum(e));
        const weektotal = _.sum(me);
        const meg = _.map(dayEnergyGen, e => _.sum(e));
        const weektotalGen = _.sum(meg);
        self.setState(prevState => ({
          gen: {
            ...prevState.gen,
            weekEnergyGenL: Number(parseFloat(weektotalGen).toFixed(3)),
          },
          load: {
            ...prevState.load,
            weekEnergyL: Number(parseFloat(weektotal).toFixed(3)),
            weekEnergyRL: Number(parseFloat(me[0]).toFixed(3)),
            weekEnergyYL: Number(parseFloat(me[1]).toFixed(3)),
            weekEnergyBL: Number(parseFloat(me[2]).toFixed(3)),
          },
        }));
        return response;
      })
      .catch((err) => {
        bkLog('Week Fetch Error:', err);
      });
  }
  /* Month Data */
  getMonthData = (apiPath) => {
    const baseApiURL = `https://api.blufieldsenergy.com/${apiPath}/`;

    APIHEADERS.offline.expires = 60 * 60 * 1000;
    const monthURL = `${baseApiURL}m`;
    const self = this;
    offlineFetch(monthURL, APIHEADERS)
      .then(response => response.json())
      .then((response) => {
        let de = response;
        bkLog('MONTHURL', response);
        if (!Array.isArray(de)) {
          de = [de];
          bkLog('Not array', de);
        }
        const totalEnergy = { R: [], Y: [], B: [] };
        const totalEnergyGen = { i1: [], i2: [], i3: [] };
        de.map((e) => {
          totalEnergy.R.push(e.R);
          totalEnergy.Y.push(e.Y);
          totalEnergy.B.push(e.B);
          totalEnergyGen.i1.push(e.i1);
          totalEnergyGen.i2.push(e.i2);
          totalEnergyGen.i3.push(e.i3);
          return e;
        });
        const me = _.map(totalEnergy, e => _.sum(e));
        const meg = _.map(totalEnergyGen, e => _.sum(e));
        const yeartotal = _.sum(me);
        const yeartotalGen = _.sum(meg);
        bkLog(meg, me, 'MEG Total');
        self.setState(prevState => ({
          gen: {
            ...prevState.gen,
            totalEnergyGenL: Number(parseFloat(yeartotalGen).toFixed(3)),
          },
          load: {
            ...prevState.load,
            totalEnergyL: Number(parseFloat(yeartotal).toFixed(3)),
          },
        }));
        return response;
      })
      .catch((err) => {
        bkLog('Month Fetch Error:', err);
      });
  }

  handleChange = (event, value) => {
    this.setState({
      value,
    });
  };
  handleChangeIndex = (index) => {
    this.setState({ value: index });
  };
  transformData = (tfd) => {
    let d = tfd;
    if (d) {
      d.map((tod) => {
        let tdata = tod;
        tdata = channelMap(tdata);
        let dtdhr = tdata.dhr;
        if (dtdhr) {
          dtdhr = dtdhr.split('/').reverse();
          [dtdhr] = dtdhr;
          tdata.day = `Hour ${Number(dtdhr)} - ${(Number(dtdhr) + 1)}`;
        }
        let dtddt = tdata.ddt;
        if (dtddt) {
          tdata.month = moment(dtddt).format('MMM Do');
          dtddt = dtddt.split('/').reverse();
          [dtddt] = dtddt;
        }
        return d;
      });
    } else {
      d = [];
    }
    return d;
  }
  render() {
    const { classes, selectedPVSystem } = this.props;

    return (
      <div className={classes.root}>
        <Typography type="title" style={{ margin: 16 }}>
          PVSystem: {selectedPVSystem.name}
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
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
              axis="x"
              index={this.state.value}
              onChangeIndex={this.handleChangeIndex}
            >
              <NuevoOverGen data={this.state.gen} />
              <NuevoOverCon data={this.state.load} />
            </SwipeableViews>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={0}>
              <ReactHighcharts config={pieDrill} ref={(chrt) => { this.piechart = chrt; }} />
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

NuevoOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

export default withStyles(styles)(NuevoOverview);
