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
  expect(queryByTestId('alert-container')).toHaveClass('bg-black/10');
  expect(queryByTestId('alert-container')).toHaveAttribute(
    'aria-labelledby',
    'alert-bar-header'
  );
  expect(queryByTestId('alert-container')).toHaveAttribute('role', 'dialog');
});

it('renders success alert', () => {
  const { queryByTestId } = render(
    <AlertBar
      className="alert-success"
      dataTestId="children"
      headerId="success-alert-bar-header"
      localizedId="success-alert-bar"
    >
      <div id="success-alert-bar-header">Hi mom, this was a success</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).toHaveClass(
    'bg-grey-700 text-white'
  );
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('renders error alert', () => {
  const { queryByTestId } = render(
    <AlertBar
      className="alert-error"
      dataTestId="children"
      headerId="error-alert-bar-header"
      localizedId="error-alert-bar"
    >
      <div id="error-alert-bar-header">Hi mom, this has an error</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).toHaveClass('bg-red-600 text-white');
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('renders newsletter error alert', () => {
  const { queryByTestId } = render(
    <AlertBar
      className="alert-newsletter-error"
      dataTestId="children"
      headerId="newsletter-error-alert-bar-header"
      localizedId="newsletter-error-alert-bar"
    >
      <div id="newsletter-alert-bar-header">Hi mom, we have newsletters?</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).toHaveClass('bg-yellow-500');
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('renders pending alert', () => {
  const { queryByTestId } = render(
    <AlertBar
      className="alert-pending"
      dataTestId="children"
      headerId="pending-alert-bar-header"
      localizedId="pending-alert-bar"
    >
      <div id="pending-alert-bar-header">Waiting for mom...</div>
    </AlertBar>
  );
  expect(queryByTestId('alert-container')).toHaveClass('bg-black/10');
  expect(queryByTestId('children')).toBeInTheDocument();
});
