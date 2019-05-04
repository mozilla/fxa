//eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
//eslint-disable-next-line no-unused-vars
import Payments from './Payments';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Payments />, document.getElementById('main-content'));

const parentOrigin = 'http://127.0.0.1:3030';//process.env.PARENT_ORIGIN;

window.parent.postMessage({ message: 'hello' }, parentOrigin);
window.addEventListener('message', (event) => {
  if (event.origin !== parentOrigin) {
    console.log('message from unexpected origin', event.origin, parentOrigin);
    return;
  }
  console.log('message received', event.data);
}, false);
// If you want your App to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
