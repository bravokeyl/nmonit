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
var configd = {
  xAxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  series: [{
    data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 295.6, 454.4]
  }]
};

const getCurrentWeekString = () => {
  let weekStart = moment().weekday(0).format("Do MMM");
  let weekEnd = moment().format("Do MMM");
  return weekStart+"-"+weekEnd;
}

class OverCon extends Component {
  constructor(props){
    super(props);
  }

  render(){
    const { classes, data } = this.props;
    return (
      <div className="nm-generation">
        <Grid container spacing={0}>
          <BKPanel color="#f96f40" data={data.todayEnergyL+" kWh"} title='Load - Today' footer="Last updated:"/>
          <BKPanel color="#f96f40" data={data.weekEnergyL+" kWh"} title='Load - This Week' footer={getCurrentWeekString()}/>
          <BKPanel color="#f96f40" data={data.monthEnergyL+" kWh"} title='Load - This Month' footer="Units consumed"/>
          <BKPanel color="#f96f40" data={data.totalEnergyL+" kWh"} title='Load - This Year' footer="Units consumed"/>
        </Grid>
        <ReactHighcharts config={configd} ref="chart"></ReactHighcharts>
      </div>
    );
  }

}

OverCon.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OverCon);
