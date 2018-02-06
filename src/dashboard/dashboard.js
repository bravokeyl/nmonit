import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import Switch from 'material-ui/Switch';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';


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
  console.log(selectedPVSystem);
  return (
    <div className={classes.root}>
      <Typography variant="title" style={{ margin: 16 }}>
        PVSystem: {selectedPVSystem.name}
      </Typography>
      <Grid container spacing={0}>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 1: Voltage
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ? <CircularProgress size={24} /> : state.c1Voltage} V
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Last updated: {state.relativeTimestamp}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 1: Current
                </Typography>
                <Typography variant="headline" component="h2">
                  {
                    state.progessL ?
                      <CircularProgress size={24} /> : state.c1Current
                  } Amps
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Last updated: {state.relativeTimestamp}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 1: Power
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ? <CircularProgress size={24} /> : state.c1Power} W
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Energy - Total
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          {}
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 2: Voltage
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ? <CircularProgress size={24} /> : state.c5Voltage} V
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Last updated: {state.relativeTimestamp}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 2: Current
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ?
                    <CircularProgress size={24} /> : state.c5Current} Amps
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Last updated: {state.relativeTimestamp}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 2: Power
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ? <CircularProgress size={24} /> : state.c5Power} W
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Energy - Total
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          {}
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 3: Voltage
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ? <CircularProgress size={24} /> : state.c6Voltage} V
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Last updated: {state.relativeTimestamp}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 3: Current
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ?
                    <CircularProgress size={24} /> : state.c6Current} Amps
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Last updated: {state.relativeTimestamp}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className={classes.card}>
            <div className={classes.details}>
              <ChromeReaderModeIcon className={classes.icon} />
              <CardContent className={classes.content}>
                <Typography variant="body1" className={classes.title}>
                  Inv 3: Power
                </Typography>
                <Typography variant="headline" component="h2">
                  {state.progessL ? <CircularProgress size={24} /> : state.c6Power} W
                </Typography>
              </CardContent>
            </div>
            <Typography variant="body1" className={classes.info}>
              Energy - Total
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          {}
        </Grid>
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
