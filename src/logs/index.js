import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';


import Typography from 'material-ui/Typography';
import Logs from './tab';
const NL = ({ match }) => (
  <div>
    <Typography type="title" style={{margin:16, marginBottom: 0}}>
      PVSystem: Shyamala Hospital, Khammam
    </Typography>
   <Route path={`${match.url}/:dhr`} component={Logs}/>
   <Route exact path={`${match.url}`} component={Logs}/>
  </div>
);
export default NL;
