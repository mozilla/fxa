/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AlertBar from '.';
import { alertContent, alertType, alertVisible } from '../../../models';

// Click-outside-to-close must not fire on the same click that opened the
// alert. These tests exercise the real reactive vars so we observe the actual
// DOM-level race that mocks in `index.test.tsx` hide.

const resetAlertVars = () => {
  alertVisible(false);
  alertContent('');
  alertType('success');
};

const Harness = ({ message }: { message: string }) => (
  <>
    <button
      type="button"
      data-testid="trigger"
      onClick={() => {
        alertType('error');
        alertContent(message);
        alertVisible(true);
      }}
    >
      open alert
    </button>
    <AlertBar />
  </>
);

describe('AlertBar click-outside arming', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAlertVars();
    // Make sure nothing from a previous test leaves a #modal element around
    // that would interfere with the modal-coexistence rule.
    document.getElementById('modal')?.remove();
  });

  afterEach(() => {
    act(() => {
      resetAlertVars();
    });
    jest.useRealTimers();
  });

  it('survives the click that triggered it (Cancel-button race)', () => {
    renderWithLocalizationProvider(<Harness message="canceled" />);

    // Same-task: click an external button whose handler opens the alert. The
    // click then bubbles to <body>. Before the fix this immediately closed
    // the alert.
    fireEvent.click(screen.getByTestId('trigger'));

    expect(screen.getByTestId('alert-bar')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('canceled');

    // After the arming delay the listener is attached; the triggering click
    // must have been ignored, so the alert is still visible.
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('alert-bar')).toBeInTheDocument();
  });

  it('still closes on a subsequent outside click after the arming delay', () => {
    renderWithLocalizationProvider(<Harness message="canceled" />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.queryByTestId('alert-bar')).toBeInTheDocument();

    // Advance past the arming setTimeout(0).
    act(() => {
      jest.advanceTimersByTime(1);
    });

    // A genuinely separate click outside the alert closes it.
    fireEvent.click(document.body);
    expect(screen.queryByTestId('alert-bar')).not.toBeInTheDocument();
  });

  it('does not close when a modal is present', () => {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.innerHTML = '<div>open modal content</div>';
    document.body.appendChild(modal);

    renderWithLocalizationProvider(<Harness message="canceled" />);
    fireEvent.click(screen.getByTestId('trigger'));

    act(() => {
      jest.advanceTimersByTime(1);
    });

    fireEvent.click(document.body);
    expect(screen.queryByTestId('alert-bar')).toBeInTheDocument();

    modal.remove();
  });

  it('clicking inside the alert does not close it', () => {
    renderWithLocalizationProvider(<Harness message="canceled" />);
    fireEvent.click(screen.getByTestId('trigger'));

    act(() => {
      jest.advanceTimersByTime(1);
    });

    fireEvent.click(screen.getByTestId('alert-bar-inner'));
    expect(screen.queryByTestId('alert-bar')).toBeInTheDocument();
  });
});
