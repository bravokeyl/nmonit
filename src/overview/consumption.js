import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import moment from 'moment';
import Grid from 'material-ui/Grid';

import BKPanel from '../common/panel';

const styles = () => ({
  root: {
    padding: 16,
  },
});

const getCurrentWeekString = () => {
  const weekStart = moment().weekday(0).format('Do MMM');
  const weekEnd = moment().format('Do MMM');
  return `${weekStart}-${weekEnd}`;
};

const NuevoOverCon = (props) => {
  const { data } = props;
  return (
    <div className="nm-generation">
      <Grid container spacing={0}>
        <BKPanel
          color="#f96f40"
          data={`${data.todayEnergyL || 'NA'} kWh`}
          title="Load - Today"
          footer="Last updated:"
        />
        <BKPanel
          color="#f96f40"
          data={`${data.weekEnergyL || 'NA'} kWh`}
          title="Load - This Week"
          footer={getCurrentWeekString()}
        />
        <BKPanel
          color="#f96f40"
          data={`${data.monthEnergyL || 'NA'} kWh`}
          title="Load - This Month"
          footer="Units consumed"
        />
        <BKPanel
          color="#f96f40"
          data={`${data.totalEnergyL || 'NA'} kWh`}
          title="Load - This Year"
          footer="Units consumed"
        />
      </Grid>
    </div>
  );
};

NuevoOverCon.propTypes = {
  data: PropTypes.object.isRequired,
};

export default withStyles(styles)(NuevoOverCon);
