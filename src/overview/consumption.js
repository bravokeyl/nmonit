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
          <BKPanel color="#f96f40" data={data.todayEnergyL+" kWh"} title='Load - Today' footer="Last updated:"/>
          <BKPanel color="#f96f40" data={data.weekEnergyL+" kWh"} title='Load - This Week' footer={getCurrentWeekString()}/>
          <BKPanel color="#f96f40" data={data.monthEnergyL+" kWh"} title='Load - This Month' footer="Units consumed"/>
          <BKPanel color="#f96f40" data={data.totalEnergyL+" kWh"} title='Load - This Year' footer="Units consumed"/>
        </Grid>
      </div>
    );
  }

}

OverCon.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OverCon);
