import React, { Component } from 'react';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';

import { authenticateUser } from '../aws/cognito';

import bg from './bg.jpg';
const styles = theme => ({
  root: {
    width: '100vw',
    minHeight: '100vh',
    // background: "linear-gradient(to right, #fd651a 0%,#fb6529 24%,#f3635c 76%,#f1636c 100%)",
    // background: 'aliceblue',
    background: 'url('+bg+')',
    // background: '#FF5722',
  },
  flex: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  container: {
    padding: '60px 50px',
    background: '#fff',
    borderRadius: 8,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    [theme.breakpoints.up('sm')]: {
      width: 400,
    }
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
    this.setState({ loading: true })
    authenticateUser(this.state.email, this.state.password, (err, result) => {
      if (err) {
        console.log(err)
        this.setState({ loading: false })
        return
      }
      this.props.authHandler(this.props.history);
    });
  }
  componentDidMount(){
    console.log("Login component Did mount");
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <div className={classes.flex}>
              {
                (<form className={classes.container} noValidate autoComplete="off">
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
                  <Button raised className={classes.button} disabled={this.state.loading} color="primary"
                    onClick={this.handleSubmit}
                    >
                    Login
                  </Button>
                </form>)
              }
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(Login);
