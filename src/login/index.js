import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { withStyles } from 'material-ui/styles';

import { authenticateUser, signOut } from '../aws/cognito';

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
  formControl: {
    margin: theme.spacing.unit,
  },
});

class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoggedin: false,
      email: '',
      password: '',
      showPassword: false,
      loading: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  handleSubmit = (e) => {
    console.log("Submit",e)
    this.setState({ loading: true })
    console.log('Entered:', this.state)
    authenticateUser(this.state.email, this.state.password, (err, result) => {
      if (err) {
        console.log(err)
        this.setState({ loading: false })
        return
      }
      console.log(result)
      this.setState({ loading: false })
    });
  }
  handleClickShowPasssword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };
  render() {
    const { classes } = this.props;
    return (
    <div className={classes.root}>
      <div className={classes.flex}>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            required
            id="email"
            label="Email"
            className={classes.textField}
            value={this.state.email}
            onChange={this.handleChange('email')}
            margin="normal"
          />
          <br/>
          <TextField
            required
            id="password"
            label="Password"
            className={classes.textField}
            margin="normal"
            type="password"
            value={this.state.password}
            onChange={this.handleChange('password')}
          />
          <br/>
          <Button raised className={classes.button} color="primary"
            onClick={this.handleSubmit}
            >
            Login
          </Button>
        </form>
      </div>

    </div>
  );
  }
}

export default withStyles(styles)(Login);
