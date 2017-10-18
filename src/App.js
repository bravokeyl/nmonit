import React, { Component } from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Grid from 'material-ui/Grid';
// import List, { ListItem } from 'material-ui/List';

import ButtonAppBar from './appbar';
import Dashboard from './dash';
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
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/gen" component={Generation} />
                <Route exact path="/logs" component={Logs} />
              </Grid>
            </Grid>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
