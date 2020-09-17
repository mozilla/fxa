/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import Modal from './index';
import { renderWithRouter } from '../../models/_mocks';

it('renders as expected', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId="some-header" descId="some-description" {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-dismiss')).toHaveAttribute(
    'title',
    'Close modal'
  );
});

it('renders confirm button as a link if route is passed', () => {
  const route = '/some/route';
  const onDismiss = jest.fn();
  const { container } = renderWithRouter(
    <Modal
      headerId="some-header"
      descId="some-description"
      {...{ route, onDismiss }}
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );

  expect(screen.getByTestId('modal-confirm').getAttribute('href')).toContain(
    route
  );
});

it('accepts an alternate className', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId="some-header"
      descId="some-description"
      {...{ onDismiss }}
      className="barquux"
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(screen.queryByTestId('modal-content-container')).toHaveClass(
    'barquux'
  );
});

it('calls onDismiss on click outside', () => {
  const onDismiss = jest.fn();
  const { container } = renderWithRouter(
    <Modal headerId="some-header" descId="some-description" {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  fireEvent.click(screen.getByTestId('modal-content-container'));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.click(container);
  expect(onDismiss).toHaveBeenCalled();
});

it('calls onDismiss on esc key press', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId="some-header" descId="some-description" {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onDismiss).toHaveBeenCalled();
});

it('shifts focus to the tab fence when opened', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId="some-header" descId="some-description" {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
});
