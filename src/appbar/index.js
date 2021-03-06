import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { bkLog } from '../common/utils';
import ButtonAppBar from './appbar';


class NuevoAppBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      isDialogOpen: false,
    };
  }
  handleDialogClose = (selectedPVSystem, changeUser) => {
    const nuser = JSON.parse(localStorage.nuser);
    bkLog('Before State:', nuser.key, selectedPVSystem.key);
    this.setState(() => ({ isDialogOpen: false }));
    if (selectedPVSystem.key && (selectedPVSystem.key !== nuser.key)) {
      const finalSys = Object.assign({}, nuser, selectedPVSystem);
      localStorage.setItem('nuser', JSON.stringify(finalSys));
      bkLog('After State:', nuser.key, selectedPVSystem.key);
      changeUser(finalSys);
    }
  }
  handleClickOpen = () => {
    this.setState({
      isDialogOpen: true,
    });
  };
  render() {
    bkLog('App bar Re-render');
    const { logOut, changeUser, selectedPVSystem } = this.props;
    return (
      <div>
        <ButtonAppBar
          isDialogOpen={this.state.isDialogOpen}
          selectedPVSystem={selectedPVSystem}
          handleDialogClick={() => this.handleClickOpen()}
          handleDialogClose={c => this.handleDialogClose(c, changeUser)}
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
  selectedPVSystem: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
  changeUser: PropTypes.func.isRequired,
};

export default NuevoAppBar;
