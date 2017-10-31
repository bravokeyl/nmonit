import React, { Component } from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { deepOrange, indigo } from 'material-ui/colors';
import red from 'material-ui/colors/red';
import Grid from 'material-ui/Grid';

import { getCurrentUser } from './aws/cognito';

import ButtonAppBar from './appbar';
import Overview from './overview';
import Dashboard from './dashboard';
import Login from './login';
import Logs from './logs';
import Profile from './profile';

import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: deepOrange,
    secondary: indigo,
    error: red,
  },
});

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoggedin: false
    }
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }
  logIn = r => {
    console.log("Login authHandler");
    this.setState({
      isLoggedin: true
    });
    r.push('/');
  }
  logOut = r => {
    console.log("Logout authHandler");
    this.setState({
      isLoggedin: false
    });
    r.push('/');
  }
  componentWillMount(){
    let self = this;
    let isLoggedIn = getCurrentUser();
    if(isLoggedIn){
      self.setState({
        isLoggedin: true
      });
    }
    console.log("APP component will mount",isLoggedIn);
  }
  render() {
    return (
      <div className="App">
        <Router>
            <MuiThemeProvider theme={theme}>
            {
              !this.state.isLoggedin ?
              <Route path="/"
                render={(props) => (<Login {...props} authHandler={(e)=>this.logIn(e)} />)}/>:
              (<div>
                <ButtonAppBar classes={{}} />
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Route exact path="/" component={Overview} />
                    <Route exact path="/d" component={Dashboard} />
                    <Route exact path="/l" component={Logs} />
                    <Route exact path="/p"
                      render={(props) => (<Profile {...props} authHandler={(e)=>this.logOut(e)}/>)} />
                  </Grid>
                </Grid>
              </div>)
            }
            </MuiThemeProvider>
        </Router>
      </div>
    );
  }
}

export default App;
