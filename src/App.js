import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { deepOrange, indigo } from 'material-ui/colors';
import red from 'material-ui/colors/red';
import Grid from 'material-ui/Grid';

import { getCurrentUser } from './aws/cognito';

import ErrorBoundary from './common/errorBoundary';
import ButtonAppBar from './appbar';
import Overview from './overview';
import Dashboard from './dashboard';
import Login from './login';
import NL from './logs';
import Profile from './profile';
import Bad404 from './404';
import {bkLog} from './common/utils';

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
      isLoggedin: false,
      apiPath: "demo"
    }
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }
  logIn = (r,f) => {
    bkLog("Login authHandler");
    if(f){
      this.setState({
        isLoggedin: true
      });
    }
  }
  logOut = r => {
    bkLog("Logout authHandler");
    window.localStorage.removeItem('nuser');
    this.setState({
      isLoggedin: false,
      apiPath: "demo"
    });
    r.push('/');
  }
  componentWillMount(){
    let self = this;
    let isLoggedIn = getCurrentUser();
    if(isLoggedIn){
      self.setState({
        isLoggedin: true,
      });
    }
    bkLog("APP component will mount, isUserLoggedIn:",isLoggedIn);
  }
  componentWillUnmount(){
    bkLog("APP component will unmount")
  }
  render() {
    const newProps = {...this.props, apiPath: this.state.apiPath }
    return (
      <div className="App">
        <Router>
            <MuiThemeProvider theme={theme}>
              {
                !this.state.isLoggedin ?
                <ErrorBoundary>
                  <Route path="/"
                    render={(props) => (<Login {...props} authHandler={(e,f)=>this.logIn(e,f)} />)}/>
                </ErrorBoundary>
                :
                (
                  <div>
                  <ButtonAppBar classes={{}} />
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <ErrorBoundary>
                        <Switch>
                          <Route exact path="/"
                          render={(routeProps) => (<Overview {...newProps}  {...routeProps} />)} />

                          <Route exact path="/d"
                          render={(routeProps) => (<Dashboard {...newProps} {...routeProps} />)}/>


                          <Route path="/l"
                          render={(routeProps) => (<NL {...newProps} {...routeProps} />)} />

                          <Route exact path="/p"
                          render={(routeProps) => (<Profile {...newProps} {...routeProps} authHandler={(e,f)=>this.logOut(e,f)}/>)} />

                          <Route component={Bad404} />
                        </Switch>
                      </ErrorBoundary>
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
