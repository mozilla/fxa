/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Modal from './index';

afterEach(cleanup);

it('renders as expected', () => {
  const onDismiss = jest.fn();
  const { queryByTestId } = render(
    <Modal {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(queryByTestId('children')).toBeInTheDocument();
});

it('accepts an alternate className', () => {
  const onDismiss = jest.fn();
  const { queryByTestId } = render(
    <Modal {...{onDismiss }} className="barquux">
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(queryByTestId('modal-content-container')).toHaveClass('barquux');
});

it('calls onDismiss on click outside', () => {
  const onDismiss = jest.fn();
  const { container, getByTestId } = render(
    <Modal {...{onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  fireEvent.click(getByTestId('modal-content-container'));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.click(container);
  expect(onDismiss).toHaveBeenCalled();
});

it('hides the close button when onDismiss is not supplied', () => {
  const { queryByTestId } = render(
    <Modal>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(queryByTestId('modal-dismiss')).not.toBeInTheDocument();
});
