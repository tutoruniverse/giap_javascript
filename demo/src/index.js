import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import './assets/css/app.css';
import './assets/css/custom.css';
import App from './App';
import GIAP from '../../src';
import { GIAP_API_URL, GIAP_TOKEN } from './constants/app';

GIAP.initialize(GIAP_TOKEN, GIAP_API_URL, true);

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root'),
);
