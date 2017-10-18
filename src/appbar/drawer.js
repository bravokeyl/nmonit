import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';


const styles = {
  list: {
    width: 250,
  },
  listFull: {
    width: 'auto',
  },
};

class TemporaryDrawer extends React.Component {
  state = {
    top: false,
    left: false,
    bottom: false,
    right: false,
  };

  toggleDrawer = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };

  render() {
    const { classes } = this.props;

    const sideList = (
      <div className={classes.list}>
        <List className={classes.list}>
          Dashboard
        </List>
        <List className={classes.list}>
          Generation
        </List>
      </div>
    );

    const fullList = (
      <div className={classes.listFull}>
      <List className={classes.list}>
        Dashboard
      </List>
      <List className={classes.list}>
        Generation
      </List>
      <List className={classes.list}>
        Logs
      </List>
        <Divider />
        <List className={classes.list}>
          Dashboard
        </List>
        <List className={classes.list}>
          Generation
        </List>
        <List className={classes.list}>
          Logs
        </List>
      </div>
    );

    return (
      <div>
        <Button onClick={this.toggleDrawer('left', true)}>Open Left</Button>
        <Drawer open={this.state.left} onRequestClose={this.toggleDrawer('left', false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer('left', false)}
            onKeyDown={this.toggleDrawer('left', false)}
          >
            {sideList}
          </div>
        </Drawer>
      </div>
    );
  }
}

TemporaryDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TemporaryDrawer);
