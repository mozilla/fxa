import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { AlertBar } from './index';

afterEach(cleanup);

it('renders as expected', () => {
  const { queryByTestId } = render(
    <AlertBar
      dataTestId="children"
      headerId="alert-bar-header"
      localizedId="alert-bar"
    >
      <div id="alert-bar-header">Message for mom</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).toHaveClass('alert');
  expect(queryByTestId('alert-container')).toHaveAttribute('aria-labelledby', "alert-bar-header");
  expect(queryByTestId('alert-container')).toHaveAttribute('role', "dialog");
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('accepts an alternate className', () => {
  const { queryByTestId } = render(
    <AlertBar
      className="foo"
      dataTestId="children"
      headerId="alternate-alert-bar-header"
      localizedId="alert-bar"
    >
      <div id="alternate-alert-bar-header">Hi mom</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).not.toHaveClass('alert');
  expect(queryByTestId('alert-container')).toHaveClass('foo');
  expect(queryByTestId('children')).toBeInTheDocument();
});
