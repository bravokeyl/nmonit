import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardContent } from 'material-ui/Card';
import { CircularProgress } from 'material-ui/Progress';
import ChromeReaderModeIcon from 'material-ui-icons/ChromeReaderMode';
import AssessmentIcon from 'material-ui-icons/Assessment';

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
    fill: "#f06267",
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
    const { classes,data,title,footer,color,icon } = this.props;
    return (
    <Grid item xs={12} sm={6}>
      <Card className={classes.card}>
        <div className={classes.details}>
          {
            icon ? <AssessmentIcon className={classes.icon} style={{fill:color}}/> :
            <ChromeReaderModeIcon className={classes.icon} style={{fill:color}}/>
          }
          <CardContent className={classes.content}>
            <Typography type="body1" className={classes.title}>
              {title || "No Title"}
            </Typography>
            <Typography type="headline" component="h2">
              {this.state.progessL?<CircularProgress size={24} />: data}
            </Typography>
          </CardContent>
        </div>
        <Typography type="body1" className={classes.info}>
          {footer || ""}
        </Typography>
      </Card>
    </Grid>
    )
  }
}

BKPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BKPanel);
