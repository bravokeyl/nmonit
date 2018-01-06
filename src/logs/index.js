import React from 'react';
import { Route } from 'react-router-dom';

import Logs from './tab';
const NL = (props) => (
  <div>
    {

      // <Route path={`${match.url}/:dhr`} component={Logs}/>
    }
   <Route exact path={`${props.match.url}`}
   render={(routeProps) => (<Logs {...props} />)} />
  </div>
);
export default NL;
