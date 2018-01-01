import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
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
  }
});


class BKPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  render(){
    const { classes,data,title } = this.props;
    // console.log("Rendering panel",data,title);
    return (
    <Grid item xs={12} sm={3}>
      <Card className={classes.card}>
        <div className={classes.details}>
          <ChromeReaderModeIcon className={classes.icon}/>
          <CardContent className={classes.content}>
            <Typography type="body1" className={classes.title}>
              {title || "No Title"}
            </Typography>
            <Typography type="headline" component="h2">
              {this.state.progessL?<CircularProgress size={24} />: data.energy} kWh
            </Typography>
          </CardContent>
        </div>
        <Typography type="body1" className={classes.info}>
          Last updated: {this.state.lastupdated}
        </Typography>
      </Card>
    </Grid>
    )
  }
}

BKPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

export default withStyles(styles)(BKPanel);
