import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import SwipeableViews from 'react-swipeable-views';
import Grid from 'material-ui/Grid';
import Tabs, { Tab } from 'material-ui/Tabs';

import moment from 'moment';

import NuevoDay from './day';
import NuevoMonth from './month';
import NuevoYear from './year';
import { bkLog } from '../common/utils';

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

class NuevoLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment().format('YYYY/MM/DD'),
      month: moment().format('YYYY/MM'),
      value: 1,
    };
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDayChange = this.handleDayChange.bind(this);
    this.handleDate = this.handleDate.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
  }

  handleChange = (event, value) => {
    this.setState({
      value,
    });
  };
  handleDayChange = (event, value, dt) => {
    bkLog('HANDLE DAY CHANGE', value, dt);
    let date = dt;
    if (!date) {
      date = moment();
    }
    this.setState({
      value,
      date,
    });
  };
  handleMonthChange = (event, value, mnt) => {
    bkLog('HANDLE MONTH CHANGE', value, mnt);
    let month = mnt;
    if (!month) {
      month = moment().format('YYYY/MM');
    }
    this.setState({
      value,
      month: moment(month, 'MMM YYYY').format('YYYY/MM'),
    });
  };
  handleDate = (date) => {
    this.setState({ date });
  };
  handleChangeIndex = (index) => {
    this.setState({ value: index });
  };
  render() {
    const { classes, apiPath } = this.props;
    return (
      <div className={classes.root}>
        <Grid item xs={12} sm={12}>
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
            className={classes.tabsheader}
          >
            <Tab label="Day" />
            <Tab label="Month" />
            <Tab label="Year" />
          </Tabs>
          <SwipeableViews
            axis="x"
            index={this.state.value}
            onChangeIndex={this.handleChangeIndex}
          >
            <NuevoDay date={this.state.date} apiPath={apiPath} />
            <NuevoMonth month={this.state.month} indexV={this.handleDayChange} apiPath={apiPath} />
            <NuevoYear indexV={this.handleMonthChange} apiPath={apiPath} />
          </SwipeableViews>
        </Grid>
      </div>
    );
  }
}

NuevoLogs.propTypes = {
  classes: PropTypes.object.isRequired,
  apiPath: PropTypes.string.isRequired,
};

export default withStyles(styles)(NuevoLogs);
