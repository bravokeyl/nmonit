import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import SwipeableViews from 'react-swipeable-views';
import Grid from 'material-ui/Grid';
import Tabs, { Tab } from 'material-ui/Tabs';

import moment from 'moment';

import DayGen from './day';
import MonthGen from './month';


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

function TabContainer({ children, dir }) {
  return (
    <div dir={dir}>
      {children}
    </div>
  );
}

class Logs extends Component {
  constructor(props){
    super(props);
    this.state = {
      progessL: true,

      lastupdated: moment(Date.now()).fromNow(),
      todayEnergyL: 0,
      weekEnergyL: 0,
      weekEnergyRL: 0,
      weekEnergyYL: 0,
      weekEnergyBL: 0,
      monthEnergyL: 0,
      totalEnergyL: 0,
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
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  componentDidMount(){
    console.info("Log component did mount");
  }
  render(){
    const { classes } = this.props;
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
            axis='x'
            index={this.state.value}
            onChangeIndex={this.handleChangeIndex}>
            <DayGen />
            <MonthGen />
            <TabContainer>Item Three</TabContainer>
          </SwipeableViews>
        </Grid>
      </div>
    );
  }

}

Logs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Logs);
