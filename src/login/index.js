import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';


const styles = theme => ({
  root: {
    width: '100vw',
    minHeight: '100vh',
    // backgroundImage: 'linear-gradient(129deg,rgba(0, 137, 217, 0.8),rgba(80, 255, 245, 0.8))',
    // background: "linear-gradient(to right, #fd651a 0%,#fb6529 24%,#f3635c 76%,#f1636c 100%)"
  },
  flex: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  container: {

  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400,
  },
});

class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoggedin: false
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleClick = (ev) => {
    this.state = {
      isLoggedin: true
    }
  }
  handleChange = (ev) => {
    console.log(ev);
  }
  render() {
    const { classes } = this.props;
    return (
    <div className={classes.root}>
      <div className={classes.flex}>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            id="email"
            label="Email"
            className={classes.textField}
            value={this.state.email}
            onChange={this.handleChange('email')}
            margin="normal"
          />
          <br/>
          <TextField
            id="password"
            label="Password"
            defaultValue=""
            className={classes.textField}
            margin="normal"
            type="password"
          />
          <br/>
          <Button raised className={classes.button} color="primary"
          onClick = {this.props.authHandler}>Login</Button>
        </form>
      </div>

    </div>
  );
  }
}

export default withStyles(styles)(Login);
