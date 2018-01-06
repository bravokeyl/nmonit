import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import moment from 'moment';
import Grid from 'material-ui/Grid';

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
          <BKPanel color="green" icon data={data.todayEnergyGenL+" kWh"} title='Energy - Today' footer="Last updated:"/>
          <BKPanel color="green" icon data={data.weekEnergyGenL+" kWh"} title='Energy - This Week' footer={getCurrentWeekString()}/>
          <BKPanel color="green" icon data={data.monthEnergyGenL+" kWh"} title='Energy - This Month' footer="Units generated"/>
          <BKPanel color="green" icon data={data.totalEnergyGenL+" kWh"} title='Energy - Year' footer="Units generated"/>
        </Grid>
        <Grid container spacing={0}>
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
