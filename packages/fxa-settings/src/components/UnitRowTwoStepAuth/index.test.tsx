/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act, fireEvent, wait } from '@testing-library/react';
import { DELETE_TOTP_MUTATION, UnitRowTwoStepAuth } from '.';
import { renderWithRouter, MockedCache } from '../../models/_mocks';

const mockMutationSuccess = {
  request: {
    query: DELETE_TOTP_MUTATION,
    variables: { input: {} },
  },
  result: {
    data: {
      deleteTotp: {
        clientMutationId: null,
      },
    },
  },
};

const getModalButtonByIndex = async (idx: number) => {
  const modalButtons = await screen.findAllByTestId('unit-row-modal');
  return modalButtons[idx];
};

describe('UnitRowTwoStepAuth', () => {
  it('renders when Two-step authentication is enabled', async () => {
    renderWithRouter(
      <MockedCache account={{ totp: { exists: true } }}>
        <UnitRowTwoStepAuth />
      </MockedCache>
    );
    expect(screen.getByTestId('unit-row-header').textContent).toContain(
      'Two-step authentication'
    );
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Enabled'
    );
    const disableButton = await getModalButtonByIndex(1);
    expect(disableButton.textContent).toContain('Disable');
  });

  it('renders proper modal when Two-step authentication is enabled and "change" is clicked', async () => {
    renderWithRouter(
      <MockedCache account={{ totp: { exists: true } }}>
        <UnitRowTwoStepAuth />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.click(await getModalButtonByIndex(0));
    });
    await wait();

    expect(
      screen.queryByTestId('change-codes-modal-header')
    ).toBeInTheDocument();
  });

  it('renders when Two-step authentication is not enabled', () => {
    renderWithRouter(
      <MockedCache account={{ totp: { exists: false } }}>
        <UnitRowTwoStepAuth />
      </MockedCache>
    );
    expect(screen.getByTestId('unit-row-header').textContent).toContain(
      'Two-step authentication'
    );
    expect(screen.getByTestId('unit-row-header-value').textContent).toContain(
      'Not Set'
    );
    expect(screen.getByTestId('unit-row-route').textContent).toContain('Add');
  });

  it('renders view as not enabled after disabling TOTP', async () => {
    const mocks = [mockMutationSuccess];

    renderWithRouter(
      <MockedCache {...{ mocks, account: { totp: { exists: true } } }}>
        <UnitRowTwoStepAuth />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.click(await getModalButtonByIndex(1));
    });
    await wait();

    expect(
      screen.queryByTestId('disable-totp-modal-header')
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-confirm'));
    });
    await wait();

    expect(screen.getByTestId('delete-totp-success')).toBeInTheDocument();
  });
});
