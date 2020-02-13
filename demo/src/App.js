import React, { Component } from 'react';
import Modal from './Modal';
import GIAPLib from '../../src';

export default class App extends Component {
  state= { modal: '' };

  componentDidMount() {
    this.giapLib.initialize('tokenlsakjdflksjdfl', 'https://www.random-server-url.com/');
  }

  giapLib = new GIAPLib();

  onInputChange = () => {

  }

  onSubmitClick = () => {

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
          this.giapLib.identify(userId);
        };
        break;
      case 'alias':
        fields = ['userId'];
        onSubmitClick = ({ userId }) => {
          this.giapLib.alias(userId);
        };
        break;
      case 'track':
        fields = ['eventName', 'data'];
        onSubmitClick = ({ eventName, data }) => {
          if (!data) {
            this.giapLib.track(eventName);
            return;
          }
          try {
            const objData = JSON.parse(data);
            this.giapLib.track(eventName, objData);
          } catch {
            this.giapLib.track(eventName);
          }
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
    return (
      <React.Fragment>
        <button
          type="submit"
          onClick={() => {
            this.setState({ modal: 'track' });
          }}
        >
          Track
        </button>
        <button
          type="submit"
          onClick={() => {
            this.setState({ modal: 'identify' });
          }}
        >
          Sign In
        </button>
        <button
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
            this.giapLib.reset();
            this.setState({ modal: '' });
          }}
        >
          Sign Out
        </button>
        {this.showModal()}
      </React.Fragment>
    );
  }
}
