import React from 'react';
import { Route } from 'react-router-dom';
import Logs from './tab';
const NL = ({ match }) => (
  <div>
   <Route path={`${match.url}/:dhr`} component={Logs}/>
   <Route exact path={`${match.url}`} component={Logs}/>
  </div>
);
export default NL;
