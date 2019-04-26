//eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
//eslint-disable-next-line no-unused-vars
import Payments from './Payments';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Payments />, document.getElementById('main-content'));

// If you want your App to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
