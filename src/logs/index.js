import React from 'react';
import { Route } from 'react-router-dom';

import NuevoLogs from './tab';

const NuevoLogWrapper = props => (
  <div>
    <Route
      exact
      path={`${props.match.url}`}
      render={() => (<NuevoLogs {...props} />)}
    />
  </div>
);
export default NuevoLogWrapper;
