/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { DialogMessage } from './index';

afterEach(cleanup);

it('renders as expected', () => {
  const onDismiss = jest.fn();
  const ariaLabelledBy = "message-header";
  const ariaDescribedBy = "message-description";
  const { queryByTestId } = render(
    <DialogMessage
      onDismiss={onDismiss}
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <div id={ariaLabelledBy} data-testid="children">Message for Mom</div>
      <p id={ariaDescribedBy}>Hi mom</p>
    </DialogMessage>
  );
  expect(queryByTestId('dialog-message-container')).toHaveClass('blocker');
  expect(queryByTestId('children')).toBeInTheDocument();
  expect(queryByTestId('dialog-message-information')).toHaveAttribute('aria-labelledby', ariaLabelledBy);
  expect(queryByTestId('dialog-message-information')).toHaveAttribute('aria-describedby', ariaDescribedBy);
  expect(queryByTestId('dialog-message-information')).toHaveAttribute(
    'role',
    'dialog'
  );
});

it('accepts an alternate className', () => {
  const onDismiss = jest.fn();
  const ariaLabelledBy = "barquux-message-header";
  const ariaDescribedBy = "barquux-message-description";
  const { queryByTestId } = render(
    <DialogMessage
      onDismiss={onDismiss}
      className="barquux"
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <div id={ariaLabelledBy} data-testid="children">Message for Mom</div>
      <p id={ariaDescribedBy}>Hi mom</p>
    </DialogMessage>
  );
  expect(queryByTestId('dialog-message-content')).toHaveClass('barquux');
});

it('calls onDismiss on click outside', () => {
  const onDismiss = jest.fn();
  const ariaLabelledBy = "dismiss-message-header";
  const ariaDescribedBy = "dismiss-message-description";
  const { container, getByTestId } = render(
    <DialogMessage
      onDismiss={onDismiss}
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <div id={ariaLabelledBy} data-testid="children">Message for Mom</div>
      <p id={ariaDescribedBy}>Hi mom</p>
    </DialogMessage>
  );
  fireEvent.click(getByTestId('dialog-message-content'));
  expect(onDismiss).not.toHaveBeenCalled();
  fireEvent.click(container);
  expect(onDismiss).toHaveBeenCalled();
});

it('hides the close button when onDismiss is not supplied', () => {
  const ariaLabelledBy = "dismiss-header";
  const ariaDescribedBy = "dismiss-description";
  const { queryByTestId } = render(
    <DialogMessage headerId={ariaLabelledBy} descId={ariaDescribedBy}>
      <div id={ariaLabelledBy} data-testid="children">Message for Mom</div>
      <p id={ariaDescribedBy}>Hi mom</p>
    </DialogMessage>
  );
  expect(queryByTestId('dialog-dismiss')).not.toBeInTheDocument();
});
