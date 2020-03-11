import React, { Component } from 'react';
import {
  withRouter,
  Switch,
  Route,
} from 'react-router-dom';
import Form from './Form';
import giap from '../../../src';
import { EventName } from '../constants/app';
import ProfileProperty from '../constants/profileProperty';
import toArray from '../utils/toArray';

class App extends Component {
  state = { form: '' };

  onSendTestEvents = (total) => {
    for (let i = 1; i <= total; ++i) {
      giap.track(EventName.TEST_EVENT, { index: i });
    }
  }

  onVisit = ({ economyGroup }) => {
    giap.track(EventName.VISIT, { economyGroup: parseInt(economyGroup) });
  };

  onSignUp = ({ userId, email }) => {
    giap.track(EventName.SIGN_UP, { userId });
    giap.alias(userId);
    giap.setProfileProperties({ email });
    this.setState({ form: '' });
    const { history } = this.props;
    history.push('/ask');
  };

  onSignIp = ({ userId }) => {
    giap.identify(userId);
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

  onIncreaseCount = ({ value }) => {
    giap.increase(ProfileProperty.COUNT, parseFloat(value));
  }

  onDecreaseCount = ({ value }) => {
    giap.increase(ProfileProperty.COUNT, -1 * parseFloat(value));
  }

  onAppendTags = ({ value }) => {
    giap.append(ProfileProperty.TAG, toArray(value));
  }

  onRemoveTags = ({ value }) => {
    giap.remove(ProfileProperty.TAG, toArray(value));
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
        fields = ['userId', 'email'];
        onSubmitClick = this.onSignUp;
        break;
      case 'signIn':
        fields = ['userId'];
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
      case 'increaseCount':
        fields = ['value'];
        onSubmitClick = this.onIncreaseCount;
        break;
      case 'decreaseCount':
        fields = ['value'];
        onSubmitClick = this.onDecreaseCount;
        break;
      case 'appendTags':
        fields = ['value'];
        onSubmitClick = this.onAppendTags;
        break;
      case 'removeTags':
        fields = ['value'];
        onSubmitClick = this.onRemoveTags;
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
    const { history } = this.props;
    return (
      <div id="giap-app-container">
        <div>
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
                  <div>
                    <button
                      onClick={() => history.push('/modify')}
                    >
                    Modify Profile Properties
                    </button>
                  </div>
                </React.Fragment>
              )}
            />
            <Route
              path="/modify"
              render={() => (
                <React.Fragment>
                  <button
                    className={form === 'increaseCount' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'increaseCount' });
                    }}
                  >
                Increase Count
                  </button>
                  <button
                    className={form === 'decreaseCount' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'decreaseCount' });
                    }}
                  >
                Decrease Count
                  </button>
                  <button
                    className={form === 'appendTags' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'appendTags' });
                    }}
                  >
                Append Tags
                  </button>
                  <button
                    className={form === 'removeTags' ? 'button-active' : ''}
                    onClick={() => {
                      this.setState({ form: 'removeTags' });
                    }}
                  >
                Remove Tags
                  </button>
                  <button
                    onClick={() => { history.push('/ask'); }}
                  >
                Back
                  </button>
                </React.Fragment>
              )}
            />
            <Route
              path="/"
              render={() => (
                <React.Fragment>
                  <button
                    className={form === 'sendTestEvents' ? 'button-active' : ''}
                    onClick={() => {
                      this.onSendTestEvents(30);
                    }}
                  >
              Send 30 test events
                  </button>
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
