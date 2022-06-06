/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router';
import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './index';

function renderWithRouter(
  ui: any,
  { route = '/', history = createHistory(createMemorySource(route)) } = {}
) {
  return {
    ...render(<LocationProvider {...{ history }}>{ui}</LocationProvider>),
    history,
  };
}

it('renders Modal without onDismiss', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId="some-header" descId="some-description" {...{ onDismiss}}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );

  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.getByTestId('modal-content-container')).toBeInTheDocument();
});

it('renders Modal', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId="some-header" descId="some-description" {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.getByTestId('modal-content-container')).toBeInTheDocument();
  // expect(screen.queryByTestId('modal-dismiss')).toHaveAttribute(
  //   'title',
  //   'Close'
  // );
});

it('passes testId if provided', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal data-testid="strange-info-modal" headerId="some-header" descId="some-description" {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );

  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.getByTestId('strange-info-modal')).toBeInTheDocument();
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

it('renders the cancel button if hasCancelButton is passed through', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId="some-header"
      descId="some-description"
      hasButtons
      hasCancelButton
      onDismiss={onDismiss}
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-cancel')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-confirm')).not.toBeInTheDocument();
});

it('does not render the cancel button if hasCancelButton is set to false', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId="some-header"
      descId="some-description"
      hasCancelButton={false}
      onDismiss={onDismiss}
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-cancel')).not.toBeInTheDocument();
  expect(screen.queryByTestId('modal-confirm')).not.toBeInTheDocument();
});

it('renders only confirm button', () => {
  const onConfirm = jest.fn();
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      hasButtons
      headerId="some-header"
      descId="some-description"
      {...{ onConfirm, onDismiss }}
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );

  expect(screen.queryByTestId('modal-confirm')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-cancel')).not.toBeInTheDocument();
});

it('renders confirm button as a link if route is passed', () => {
  const route = '/some/route';
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      hasButtons
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

it('renders both cancel and confirm buttons', () => {
  const onConfirm = jest.fn();
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId="some-header"
      descId="some-description"
      hasButtons
      hasCancelButton
      {...{ onConfirm, onDismiss }}
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-cancel')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-confirm')).toBeInTheDocument();
});

it('does not render any buttons if hasButtons and hasCancelButton are not passed', () => {
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId="some-header"
      descId="some-description"
      {...{ onDismiss }}
    >
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-cancel')).not.toBeInTheDocument();
  expect(screen.queryByTestId('modal-confirm')).not.toBeInTheDocument();
});
