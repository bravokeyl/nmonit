import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { bkLog } from '../common/utils';
import ButtonAppBar from './appbar';


class NuevoAppBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
    };
  }
  render() {
    const { logOut } = this.props;
    return (
      <div>
        <ButtonAppBar
          handleMenu={() => {
            this.setState({ isMenuOpen: true });
            bkLog('Menu button clicked.');
          }}
          logOut={() => {
            bkLog('logout invoked.');
            logOut();
          }}
          isMenuOpen={this.state.isMenuOpen}
          handleMenuClose={() => {
            this.setState({ isMenuOpen: false });
            bkLog('Menu close/outside clicked.');
          }}
        />
      </div>
    );
  }
}

NuevoAppBar.propTypes = {
  logOut: PropTypes.func.isRequired,
};

export default NuevoAppBar;
