import React, { Component } from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Grid from 'material-ui/Grid';
// import List, { ListItem } from 'material-ui/List';

import ButtonAppBar from './appbar';
import Overview from './overview';
import Dashboard from './dashboard';
import Generation from './gen';
import Logs from './logs';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <ButtonAppBar classes={{}} />
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Route exact path="/" component={Overview} />
                <Route exact path="/d" component={Dashboard} />
                <Route exact path="/l" component={Logs} />
              </Grid>
            </Grid>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
