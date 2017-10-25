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
    this.authHandler = this.authHandler.bind(this);
  }
  authHandler = (e,p) => {
    console.log("authHandler",e,p);
  }
  componentWillMount(){
    let self = this;
    let isLoggedIn = getCurrentUser(function(e){
      console.log(e,"Attr");
      self.setState({
        isLoggedin: true
      });
    });
    console.log("APP component will mount: is loggedIn", isLoggedIn);
  }
  render() {
    return (
      <div className="App">
        <Router>
            <MuiThemeProvider theme={theme}>
            { !this.state.isLoggedin ? <Login authHandler={this.authHandler} />:
              (<div>
                <ButtonAppBar classes={{}} />
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Route exact path="/" component={Overview} />
                    <Route exact path="/d" component={Dashboard} />
                    <Route exact path="/l" component={Logs} />
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
