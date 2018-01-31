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

const defaultProps = {
  data: {
    todayEnergyGenL: 0,
    weekEnergyGenL: 0,
    monthEnergyGenL: 0,
    totalEnergyGenL: 0,
  },
};

const OverCon = (props) => {
  const {
    todayEnergyGenL, weekEnergyGenL, monthEnergyGenL, totalEnergyGenL,
  } = props.data;
  return (
    <div className="nm-generation">
      <Grid container spacing={0}>
        <BKPanel
          color="green"
          icon
          info
          data={`${Number(todayEnergyGenL) || 'NA'} kWh`}
          title="Energy - Today"
          footer="Last updated:"
        />
        <BKPanel
          color="green"
          icon
          data={`${weekEnergyGenL || 'NA'} kWh`}
          title="Energy - This Week"
          footer={getCurrentWeekString()}
        />
        <BKPanel
          color="green"
          icon
          data={`${monthEnergyGenL || 'NA'} kWh`}
          title="Energy - This Month"
          footer="Units generated"
        />
        <BKPanel
          color="green"
          icon
          data={`${totalEnergyGenL || 'NA'} kWh`}
          title="Energy - Year"
          footer="Units generated"
        />
        <BKPanel
          data={Number(parseFloat(todayEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - Today"
        />
        <BKPanel
          data={Number(parseFloat(weekEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - This Week"
        />
        <BKPanel
          data={Number(parseFloat(monthEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - This Month"
        />
        <BKPanel
          data={Number(parseFloat(totalEnergyGenL * 9.5).toFixed(3))}
          title="Revenue - This Year"
        />
      </Grid>
    </div>
  );
};

OverCon.propTypes = {
  data: PropTypes.shape({
    todayEnergyGenL: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    weekEnergyGenL: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    monthEnergyGenL: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    totalEnergyGenL: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  }),
};

OverCon.defaultProps = defaultProps;
export default withStyles(styles)(OverCon);
