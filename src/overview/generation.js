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

const OverCon = (props) => {
  const { data } = props;
  return (
    <div className="nm-generation">
      <Grid container spacing={0}>
        <BKPanel
          color="green"
          icon
          info
          data={`${data.todayEnergyGenL} kWh`}
          title="Energy - Today"
          footer="Last updated:"
        />
        <BKPanel
          color="green"
          icon
          data={`${data.weekEnergyGenL} kWh`}
          title="Energy - This Week"
          footer={getCurrentWeekString()}
        />
        <BKPanel
          color="green"
          icon
          data={`${data.monthEnergyGenL} kWh`}
          title="Energy - This Month"
          footer="Units generated"
        />
        <BKPanel
          color="green"
          icon
          data={`${data.totalEnergyGenL} kWh`}
          title="Energy - Year"
          footer="Units generated"
        />
        <BKPanel
          data={Number(parseFloat(data.todayEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - Today"
        />
        <BKPanel
          data={Number(parseFloat(data.weekEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - This Week"
        />
        <BKPanel
          data={Number(parseFloat(data.monthEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - This Month"
        />
        <BKPanel
          data={Number(parseFloat(data.totalEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - This Year"
        />
      </Grid>
    </div>
  );
};

OverCon.propTypes = {
  data: PropTypes.object.isRequired,
};

export default withStyles(styles)(OverCon);
