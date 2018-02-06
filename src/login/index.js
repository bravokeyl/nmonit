import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';

import { authenticateUser } from '../aws/cognito';
import { bkLog } from '../common/utils';
import NuevoQuotes from './loader-quotes';

import bg from './bg.jpg';
import NuevoLoader from './fav';
import MLogo from '../appbar/logoc.png';

const styles = theme => ({
  root: {
    width: '100vw',
    minHeight: '100vh',
    background: `url(${bg})`,
  },
  flex: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  container: {
    padding: '30px 30px',
    background: '#fff',
    borderRadius: 8,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    [theme.breakpoints.up('sm')]: {
      width: 400,
    },
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  loaderCon: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to right, #fd651a 0%,#fb6529 24%,#f3635c 76%,#f1636c 100%)',
  },
});

class NuevoLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loading: false,
      currentQuotesIndex: 0,
    };
  }
  componentDidMount() {
    bkLog('Login component Did mount');
  }
  componentWillUnmount() {
    clearInterval(this.quotesInterval);
  }
  getNextQuote = (quotes) => {
    if (this.state.currentQuotesIndex === quotes.length - 1) {
      return 0;
    }
    return this.state.currentQuotesIndex + 1;
  }
  handleChange = name => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };
  handleSubmit = () => {
    this.setState({ loading: true });
    this.startQuotes();
    authenticateUser(this.state.email, this.state.password, (err, result) => {
      if (err) {
        // eslint-disable-next-line
        console.error('Authenictation error:', err);
        this.setState({ loading: false });
        return;
      }
      this.props.authHandler(result, this.props.history);
    });
  }
  startQuotes = () => {
    const quotes = NuevoQuotes;
    const speedInMilliseconds = 3 * 1000;
    this.quotesInterval = setInterval(() => {
      this.setState({
        currentQuotesIndex: this.getNextQuote(quotes),
      });
    }, speedInMilliseconds);
  }
  render() {
    const { classes } = this.props;
    return (
      !this.state.loading ?
        <div className={classes.root}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <div className={classes.flex}>
                <img src={MLogo} alt="" style={{ maxWidth: 240 }} />
                {
                  (
                    <form className={classes.container} noValidate >
                      <TextField
                        required
                        id="email"
                        label="Email"
                        className={classes.textField}
                        value={this.state.email}
                        onChange={this.handleChange('email')}
                        margin="normal"
                        autoComplete="username email"
                      />
                      <br />
                      <TextField
                        required
                        id="password"
                        label="Password"
                        autoComplete="current-password"
                        className={classes.textField}
                        margin="normal"
                        type="password"
                        value={this.state.password}
                        onChange={this.handleChange('password')}
                      />
                      <br />
                      <Button
                        type="submit"
                        raised
                        className={classes.button}
                        disabled={this.state.loading}
                        color="primary"
                        onClick={this.handleSubmit}
                        tabIndex="0"
                      >
                        Login
                      </Button>
                    </form>
                  )
                }
              </div>
            </Grid>
          </Grid>
        </div> :
        <div className={classes.loaderCon}>
          <NuevoLoader />
          <h2 style={{ color: '#fff' }}>
            {NuevoQuotes[this.state.currentQuotesIndex]}
          </h2>
        </div>
    );
  }
}

NuevoLogin.propTypes = {
  classes: PropTypes.object.isRequired,
  authHandler: PropTypes.func.isRequired,
};
export default withStyles(styles)(NuevoLogin);
