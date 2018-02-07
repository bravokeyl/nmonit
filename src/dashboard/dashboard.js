import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Switch from 'material-ui/Switch';

import BKPanel from '../common/panel';

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
});

const NuevoDashboardComp = ({
  classes, selectedPVSystem, handleChange, state,
}) => {
  console.log('Rendering...', state.inProgress);
  return (
    <div className={classes.root}>
      <Typography variant="title" style={{ margin: 16 }}>
        PVSystem: {selectedPVSystem.name}
      </Typography>
      <Grid container spacing={0}>
        <BKPanel
          title="Inv 1: Voltage"
          data={`${state.i1.voltage || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
        <BKPanel
          title="Inv 1: Current"
          data={`${state.i1.current || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
        <BKPanel
          title="Inv 1: Power"
          data={`${state.i1.power || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />

        <BKPanel
          title="Inv 2: Voltage"
          data={`${state.i2.voltage || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
        <BKPanel
          title="Inv 2: Current"
          data={`${state.i2.current || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
        <BKPanel
          title="Inv 2: Power"
          data={`${state.i2.power || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />

        <BKPanel
          title="Inv 3: Voltage"
          data={`${state.i3.voltage || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
        <BKPanel
          title="Inv 3: Current"
          data={`${state.i3.current || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
        <BKPanel
          title="Inv 3: Power"
          data={`${state.i3.power || 0} W`}
          cols={3}
          inProgress={state.inProgress}
          footer={`Last updated: ${state.relativeTimestamp}`}
        />
      </Grid>
      <div style={{
          position: 'fixed',
          bottom: 50,
          right: 50,
          zIndex: 101,
        }}
      >
        <Switch
          checked={state.isLive}
          onChange={handleChange('checkedA')}
          aria-label="checkedA"
        />
      </div>
    </div>
  );
};

NuevoDashboardComp.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(NuevoDashboardComp);
