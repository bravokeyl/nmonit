import React from 'react';

import Typography from 'material-ui/Typography';

const pvsystem = (window.localStorage.nuser) ? JSON.parse(window.localStorage.nuser).plant : null;
const PlantHeader = () => (
  <div>
    <Typography type="title" style={{ margin: 16 }}>
      PVSystem: {pvsystem}
    </Typography>
  </div>
);
export default PlantHeader;
