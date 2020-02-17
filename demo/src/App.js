import React, { Component } from 'react';
import Form from './Form';
import GIAP from '../../src/index';

export default class App extends Component {
  state = { form: '', isSignedIn: false };

  componentDidMount() {
    GIAP.initialize('tokenlsakjdflksjdfl', 'http://localhost:3000/');
  }

  onVisit = ({ economyGroup }) => {
    GIAP.track('VISIT', { economyGroup: parseInt(economyGroup) });
  };

  onSignUp = ({ email }) => {
    GIAP.alias(email);
    GIAP.setProfileProperties({ email });
    this.setState({ form: '', isSignedIn: true });
  };

  onSignIp = ({ email }) => {
    GIAP.identify(email);
    this.setState({ form: '', isSignedIn: true });
  };

  onSignOut = () => {
    GIAP.reset();
    this.setState({ form: '', isSignedIn: false });
  }

  onAsk = ({ problemText }) => {
    GIAP.track('ASK', { problemText });
  }

  onSetFullName = ({ fullName }) => {
    GIAP.setProfileProperties({ fullName });
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
    const { form, isSignedIn } = this.state;
    return (
      <div id="giap-app-container">
        <div id="button-container">
          {!isSignedIn ? (
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
          )
            : (
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
        </div>
        {this.showForm()}
      </div>
    );
  }
}
