//eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom';
//eslint-disable-next-line no-unused-vars
import Payments from './Payments';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Payments />, div);
  ReactDOM.unmountComponentAtNode(div);
});
