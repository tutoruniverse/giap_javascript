import React, { Component } from 'react';
import GIAPLib from '../../src';

export default class App extends Component {
  giapLib = new GIAPLib();

  componentDidMount() {
    this.giapLib.initialize('tokenlsakjdflksjdfl');
  }

  render() {
    return (
      <React.Fragment>
        <button
          type="submit"
          onClick={() => this.giapLib.identify('coolUsername')}
        >
          Sign In
        </button>
        <button
          type="submit"
          onClick={() => this.giapLib.alias('coolUsername')}
        >
          Sign Up
        </button>
        <button
          type="submit"
          onClick={this.giapLib.reset}
        >
          Sign Out
        </button>
      </React.Fragment>
    );
  }
}
