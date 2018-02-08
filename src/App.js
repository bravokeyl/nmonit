import React, { Component } from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { deepOrange, indigo } from 'material-ui/colors';
import red from 'material-ui/colors/red';
import Grid from 'material-ui/Grid';

import { signOut, getCurrentUser } from './aws/cognito';

import ErrorBoundary from './common/errorBoundary';
import NuevoAppBar from './appbar';
import NuevoOverview from './overview';
import NuevoDashboard from './dashboard';
import NuevoLogin from './login';
import NuevoLogWrapper from './logs';
import NuevoProfile from './profile';
import Bad404 from './404';
import { bkLog } from './common/utils';

import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: deepOrange,
    secondary: indigo,
    error: red,
  },
});

class NuevoMonit extends Component {
  constructor(props) {
    super(props);
    const initialPVSystem = { key: 'ne', name: 'Demo System', location: 'Nuevosol Energy, Hyderabad' };
    this.state = {
      isLoggedin: false,
      apiPath: 'demo',
      selectedPVSystem: initialPVSystem,
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }
  componentWillMount() {
    const self = this;
    const isLoggedIn = getCurrentUser();
    if (isLoggedIn) {
      let nuser = {};
      if (localStorage.nuser) {
        nuser = JSON.parse(localStorage.nuser);
        bkLog('initialPVSystem ', nuser);
        self.setState({
          isLoggedin: true,
          selectedPVSystem: nuser,
        });
      } else {
        bkLog('No user saved to localStorage, but still logged in... :D');
      }
    }
    bkLog('APP component will mount, isUserLoggedIn:', isLoggedIn);
  }
  componentWillUnmount() {
    bkLog('APP component will unmount');
  }
  logIn = (r, f) => {
    bkLog('Login authHandler');
    if (f) {
      let nuser = {};
      const d = { key: 'v1', name: 'Shyamala Hospital', location: 'Wyra Road, Khammam' };
      let initialPVSystem = d;
      if (localStorage.nuser) {
        nuser = JSON.parse(localStorage.nuser);
        initialPVSystem = { ...d, ...nuser };
        bkLog('initialPVSystem ', initialPVSystem);
      } else {
        bkLog('No user saved, but still logged in... :D');
      }
      this.setState({
        isLoggedin: true,
        selectedPVSystem: initialPVSystem,
      });
    }
  }
  logOut = (r) => {
    bkLog('Logout authHandler');
    window.localStorage.removeItem('nuser');
    signOut();
    this.setState({
      isLoggedin: false,
      apiPath: 'demo',
    });
    if (r) {
      r.push('/');
    } else {
      // window.location.reload();
    }
  }
  changeUser = (r = null) => {
    if (r && r.key) {
      bkLog('Changing user with state:', r);
      this.setState({
        apiPath: r.key,
        selectedPVSystem: r,
      });
    }
  }
  render() {
    const newProps = {
      ...this.props,
      apiPath: this.state.apiPath,
      selectedPVSystem: this.state.selectedPVSystem,
    };
    return (
      <div className="nmonit">
        <Router>
          <MuiThemeProvider theme={theme}>
            {
              !this.state.isLoggedin ?
                <ErrorBoundary>
                  <Route
                    path="/"
                    render={
                      props => (<NuevoLogin {...props} authHandler={(e, f) => this.logIn(e, f)} />)
                    }
                  />
                </ErrorBoundary>
              :
              (
                <div className="nmonit-container">
                  <NuevoAppBar
                    logOut={() => this.logOut()}
                    changeUser={r => this.changeUser(r)}
                    selectedPVSystem={this.state.selectedPVSystem}
                  />
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <ErrorBoundary>
                        <Switch>
                          <Route
                            exact
                            path="/"
                            render={routeProps => (<NuevoOverview {...newProps} {...routeProps} />)}
                          />

                          <Route
                            exact
                            path="/d"
                            render={
                              routeProps => (<NuevoDashboard {...newProps} {...routeProps} />)}
                          />

                          <Route
                            path="/l"
                            render={
                              routeProps => (<NuevoLogWrapper {...newProps} {...routeProps} />)}
                          />

                          <Route
                            exact
                            path="/p"
                            render={routeProps =>
                              (
                                <NuevoProfile
                                  {...newProps}
                                  {...routeProps}
                                  authHandler={(e, f) => this.logOut(e, f)}
                                />
                              )}
                          />

                          <Route component={Bad404} />
                        </Switch>
                      </ErrorBoundary>
                    </Grid>
                  </Grid>
                </div>
              )
            }
          </MuiThemeProvider>
        </Router>
      </div>
    );
  }
}

export default NuevoMonit;
