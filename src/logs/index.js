import React from 'react';
import { Route } from 'react-router-dom';

import Logs from './tab';

const NL = props => (
  <div>
    <Route
      exact
      path={`${props.match.url}`}
      render={() => (<Logs {...props} />)}
    />
  </div>
);
export default NL;
