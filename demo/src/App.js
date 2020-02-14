import React, { Component } from 'react';
import Modal from './Modal';
import GIAP from '../../src/index';

export default class App extends Component {
  state= { modal: '' };

  componentDidMount() {
    GIAP.initialize('tokenlsakjdflksjdfl', 'https://www.random-server-url.com/');
  }

  showModal = () => {
    const { modal } = this.state;
    if (!modal) return '';

    let fields = [];
    let onSubmitClick;
    switch (modal) {
      case 'identify':
        fields = ['userId'];
        onSubmitClick = ({ userId }) => {
          GIAP.identify(userId);
        };
        break;
      case 'alias':
        fields = ['userId'];
        onSubmitClick = ({ userId }) => {
          GIAP.alias(userId);
        };
        break;
      case 'track':
        fields = ['eventName', 'data'];
        onSubmitClick = ({ eventName, data }) => {
          if (!data) {
            GIAP.track(eventName);
            return;
          }
          try {
            const objData = JSON.parse(data);
            GIAP.track(eventName, objData);
          } catch {
            GIAP.track(eventName);
          }
        };
        break;
      case 'setProfileProperties':
        fields = ['propertyName', 'value'];
        onSubmitClick = ({ propertyName, value }) => {
          GIAP.setProfileProperties({ [propertyName]: value });
        };
        break;
      default:
        fields = [];
    }
    return (
      <Modal
        fields={fields}
        onSubmitClick={onSubmitClick}
      />
    );
  }

  render() {
    const { modal } = this.state;
    return (
      <div id="giap-app-container">
        <div id="button-container">
          <button
            className={modal === 'track' ? 'button-active' : ''}
            type="submit"
            onClick={() => {
              this.setState({ modal: 'track' });
            }}
          >
          Track
          </button>
          <button
            className={modal === 'identify' ? 'button-active' : ''}
            type="submit"
            onClick={() => {
              this.setState({ modal: 'identify' });
            }}
          >
          Sign In
          </button>
          <button
            className={modal === 'alias' ? 'button-active' : ''}
            type="submit"
            onClick={() => {
              this.setState({ modal: 'alias' });
            }}
          >
          Sign Up
          </button>
          <button
            type="submit"
            onClick={() => {
              GIAP.reset();
              this.setState({ modal: '' });
            }}
          >
          Sign Out
          </button>
          <button
            type="submit"
            onClick={() => {
              this.setState({ modal: 'setProfileProperties' });
            }}
          >
          Modify Profile
          </button>
        </div>
        {this.showModal()}
      </div>
    );
  }
}
