import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import './assets/css/app.css';
import './assets/css/custom.css';
import App from './components/App';
import setupGIAP from './utils/setupGIAP';

setupGIAP();

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root'),
);
