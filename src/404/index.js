import React, { Component } from 'react';
import PropTypes from 'prop-types';


import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Card from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

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
    justifyContent: 'center',
    alignItems: 'center'
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

class Bad404 extends Component {
  constructor(props){
    super(props);
    this.state = {
      progessL: true
    }
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Card className={classes.card}>
            <a href="/">
              <Button color="primary" >Nothing Found</Button>
            </a>
          </Card>
        </Grid>

      </div>
    );
  }

}


Bad404.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Bad404);
