import React, { Component } from 'react';
import {
  withRouter,
  Switch,
  Route,
} from 'react-router-dom';
import Form from './Form';
import giap from '../../../src';
import { EventName } from '../constants/app';

class App extends Component {
  state = { form: '' };

  onVisit = ({ economyGroup }) => {
    giap.track(EventName.VISIT, { economyGroup: parseInt(economyGroup) });
  };

  onSignUp = ({ email }) => {
    giap.track(EventName.SIGN_UP, { email });
    giap.alias(email);
    giap.setProfileProperties({ email });
    this.setState({ form: '' });
    const { history } = this.props;
    history.push('/ask');
  };

  onSignIp = ({ email }) => {
    giap.identify(email);
    this.setState({ form: '' });
    const { history } = this.props;
    history.push('/ask');
  };

  onSignOut = () => {
    giap.reset();
    this.setState({ form: '' });
    const { history } = this.props;
    history.push('/');
  }

  onAsk = ({ problemText }) => {
    giap.track(EventName.ASK, { problemText });
  }

  onSetFullName = ({ fullName }) => {
    giap.setProfileProperties({ fullName });
  }

  showForm = () => {
    const { form } = this.state;
    if (!form) return '';

    let fields = [];
    let onSubmitClick;
    switch (form) {
      case 'visit':
        fields = ['economyGroup'];
        onSubmitClick = this.onVisit;
        break;
      case 'signup':
        fields = ['email'];
        onSubmitClick = this.onSignUp;
        break;
      case 'signIn':
        fields = ['email'];
        onSubmitClick = this.onSignIp;
        break;
      case 'ask':
        fields = ['problemText'];
        onSubmitClick = this.onAsk;
        break;
      case 'setFullName':
        fields = ['fullName'];
        onSubmitClick = this.onSetFullName;
        break;
      default:
        fields = [];
    }
    return (
      <Form
        fields={fields}
        onSubmitClick={onSubmitClick}
      />
    );
  }

  render() {
    const { form } = this.state;
    return (
      <div id="giap-app-container">
        <div id="button-container">
          <Switch>
            <Route
              path="/ask"
              render={() => (
                <React.Fragment>
                  <button
                    onClick={this.onSignOut}
                  >
                Sign Out
                  </button>
                  <button
                    className={form === 'ask' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'ask' });
                    }}
                  >
                Ask
                  </button>
                  <button
                    className={form === 'setFullName' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'setFullName' });
                    }}
                  >
                Set Full Name
                  </button>
                </React.Fragment>
              )}
            />
            <Route
              path="/"
              render={() => (
                <React.Fragment>
                  <button
                    className={form === 'visit' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'visit' });
                    }}
                  >
              Visit
                  </button>
                  <button
                    className={form === 'signup' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'signup' });
                    }}
                  >
              Sign Up
                  </button>
                  <button
                    className={form === 'signIn' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'signIn' });
                    }}
                  >
              Sign In
                  </button>
                </React.Fragment>
              )}
            />

          </Switch>
        </div>
        {this.showForm()}
      </div>
    );
  }
}

export default withRouter(App);