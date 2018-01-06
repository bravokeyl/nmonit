import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import moment from 'moment';
import Grid from 'material-ui/Grid';
import ReactHighcharts from 'react-highcharts';

import BKPanel from '../common/panel';

const styles = theme => ({
  root: {
    padding: 16,
  },
});

const configd = {
  title: null,
  xAxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  series: [{
    data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 295.6, 454.4]
  }]
};
const barconfig = {
  chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Browser market shares January, 2015 to May, 2015'
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
        name: 'Brands',
        colorByPoint: true,
        data: [{
            name: 'Microsoft Internet Explorer',
            y: 56.33
        }, {
            name: 'Chrome',
            y: 24.03,
            sliced: true,
            selected: true
        }, {
            name: 'Firefox',
            y: 10.38
        }, {
            name: 'Safari',
            y: 4.77
        }, {
            name: 'Opera',
            y: 0.91
        }, {
            name: 'Proprietary or Undetectable',
            y: 0.2
        }]
    }]
}
const getCurrentWeekString = () => {
  let weekStart = moment().weekday(0).format("Do MMM");
  let weekEnd = moment().format("Do MMM");
  return weekStart+"-"+weekEnd;
}

class OverCon extends Component {
  render(){
    const { data } = this.props;
    return (
      <div className="nm-generation">
        <Grid container spacing={0}>
          <BKPanel color="green" icon data={data.todayEnergyGenL+" kWh"} title='Energy - Today' footer="Last updated:"/>
          <BKPanel color="green" icon data={data.weekEnergyGenL+" kWh"} title='Energy - This Week' footer={getCurrentWeekString()}/>
          <BKPanel color="green" icon data={data.monthEnergyGenL+" kWh"} title='Energy - This Month' footer="Units generated"/>
          <BKPanel color="green" icon data={data.totalEnergyGenL+" kWh"} title='Energy - Year' footer="Units generated"/>

          <BKPanel data={Number(parseFloat(data.todayEnergyGenL*9.5).toFixed(3))} title='Revenue - Today'/>
          <BKPanel data={Number(parseFloat(data.weekEnergyGenL*9.5).toFixed(3))} title='Revenue - This Week'/>
          <BKPanel data={Number(parseFloat(data.monthEnergyGenL*9.5).toFixed(3))} title='Revenue - This Month'/>
          <BKPanel data={Number(parseFloat(data.totalEnergyGenL*9.5).toFixed(3))} title='Revenue - This Year'/>
        </Grid>
      </div>
    );
  }

}

OverCon.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OverCon);
