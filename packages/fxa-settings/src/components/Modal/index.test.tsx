/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import Modal from './index';
import { renderWithRouter } from '../../models/mocks';

it('renders as expected', () => {
  const onDismiss = jest.fn();
  const ariaLabelledBy="modal-header";
  const ariaDescribedBy="modal-description";

  renderWithRouter(
    <Modal headerId={ariaLabelledBy} descId={ariaDescribedBy} {...{ onDismiss }}>
      <div data-testid="children">Hi mom</div>
    </Modal>
  );
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-dismiss')).toHaveAttribute(
    'title',
    'Close'
  );
  expect(screen.getByTestId('modal-information')).toHaveAttribute('aria-labelledby', ariaLabelledBy);
  expect(screen.getByTestId('modal-information')).toHaveAttribute('aria-describedby', ariaDescribedBy);
  expect(screen.getByTestId('modal-information')).toHaveAttribute('role', "dialog")
});

it('renders confirm button as a link if route is passed', () => {
  const ariaLabelledBy="modal-with-confirm-header";
  const ariaDescribedBy="modal-with-confirm-description";
  const route = '/some/route';
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
      {...{ route, onDismiss }}
    >
      <div data-testid="children">
        <h4 id={ariaLabelledBy}>Message for mom</h4>
        <p id={ariaDescribedBy}>Hi mom</p>
      </div>
    </Modal>
  );

  expect(screen.getByTestId('modal-confirm').getAttribute('href')).toContain(
    route
  );
});

it('does not render the cancel button if hasCancelButton is set to false', () => {
  const ariaLabelledBy="no-cancel-modal-header"
  const ariaDescribedBy="no-cancel-modal-description"
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
      {...{ hasCancelButton: false, onDismiss }}
    >
      <div data-testid="children">
        <h4 id={ariaLabelledBy}>Message for mom</h4>
        <p id={ariaDescribedBy}>Hi mom</p>
      </div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
  expect(screen.queryByTestId('children')).toBeInTheDocument();
  expect(screen.queryByTestId('modal-cancel')).not.toBeInTheDocument();
});

it('accepts an alternate className', () => {
  const ariaLabelledBy="barquux-modal-header";
  const ariaDescribedBy="barquux-modal-description";
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
      {...{ onDismiss }}
      className="barquux"
    >
      <div data-testid="children">
        <h4 id={ariaLabelledBy}>Message for mom</h4>
        <p id={ariaDescribedBy}>Hi mom</p>
      </div>
    </Modal>
  );
  expect(screen.queryByTestId('modal-content-container')).toHaveClass(
    'barquux'
  );
});

it('calls onDismiss on click outside', () => {
  const ariaLabelledBy="some-modal-header";
  const ariaDescribedBy="some-modal-description";
  const onDismiss = jest.fn();
  const { container } = renderWithRouter(
    <Modal headerId={ariaLabelledBy} descId={ariaDescribedBy} {...{ onDismiss }}>
      <div data-testid="children">
        <h4 id={ariaLabelledBy}>Message for mom</h4>
        <p id={ariaDescribedBy}>Hi mom</p>
      </div>
    </Modal>
  );
  fireEvent.click(screen.getByTestId('modal-content-container'));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.click(container);
  expect(onDismiss).toHaveBeenCalled();
});

it('calls onDismiss on esc key press', () => {
  const ariaLabelledBy="use-esc-modal-header";
  const ariaDescribedBy="use-esc-modal-description";
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId={ariaLabelledBy} descId={ariaDescribedBy} {...{ onDismiss }}>
      <div data-testid="children">
        <h4 id={ariaLabelledBy}>Message for mom</h4>
        <p id={ariaDescribedBy}>Hi mom</p>
      </div>
    </Modal>
  );
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onDismiss).toHaveBeenCalled();
});

it('shifts focus to the tab fence when opened', () => {
  const ariaLabelledBy="tab-focus-modal-header";
  const ariaDescribedBy="tab-focus-modal-description";
  const onDismiss = jest.fn();
  renderWithRouter(
    <Modal headerId={ariaLabelledBy} descId={ariaDescribedBy} {...{ onDismiss }}>
      <div data-testid="children">
        <h4 id={ariaLabelledBy}>Message for mom</h4>
        <p id={ariaDescribedBy}>Hi mom</p>
      </div>
    </Modal>
  );
  expect(document.activeElement).toBe(screen.getByTestId('modal-tab-fence'));
});
