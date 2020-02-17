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
    this.setState({ isSignedIn: true });
  };

  onSignOut = () => {
    GIAP.reset();
    this.setState({ form: '', isSignedIn: false });
  }

  onAsk = ({ problemText }) => {
    GIAP.track('ASK', { problemText });
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
      case 'ask':
        fields = ['problemText'];
        onSubmitClick = this.onAsk;
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
          <button
            className={form === 'visit' ? 'button-active' : ''}
            type="submit"
            onClick={() => {
              this.setState({ form: 'visit' });
            }}
          >
          Visit
          </button>
          {!isSignedIn ? (
            <button
              className={form === 'signup' ? 'button-active' : ''}
              type="submit"
              onClick={() => {
                this.setState({ form: 'signup' });
              }}
            >
              Sign Up
            </button>
          )
            : (
              <button
                type="submit"
                onClick={this.onSignOut}
              >
          Sign Out
              </button>
            )}
          <button
            className={form === 'ask' ? 'button-active' : ''}
            type="submit"
            onClick={() => {
              this.setState({ form: 'ask' });
            }}
          >
          Ask
          </button>
        </div>
        {this.showForm()}
      </div>
    );
  }
}
