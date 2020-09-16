/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, act, fireEvent, wait } from '@testing-library/react';
import { DELETE_TOTP_MUTATION, UnitRowTwoStepAuth } from '.';
import {
  renderWithRouter,
  MockedCache,
  mockAccountQuery,
} from '../../models/_mocks';

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

describe('UnitRowTwoStepAuth', () => {
  it('renders when Two-step authentication is enabled', () => {
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
    expect(screen.getByTestId('unit-row-modal').textContent).toContain(
      'Disable'
    );
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

  it('can be refreshed', async () => {
    renderWithRouter(
      <MockedCache
        account={{ totp: { exists: false } }}
        mocks={[
          mockAccountQuery({
            totp: {
              exists: true,
              verified: true,
            },
          }),
        ]}
      >
        <UnitRowTwoStepAuth />
      </MockedCache>
    );
    expect(screen.getByTestId('unit-row-header-value')).toHaveTextContent(
      'Not Set'
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('two-step-refresh'));
    });
    expect(screen.getByTestId('unit-row-header-value')).toHaveTextContent(
      'Enabled'
    );
  });

  it('renders view as not enabled after disabling TOTP', async () => {
    const mocks = [mockMutationSuccess];

    renderWithRouter(
      <MockedCache {...{ mocks, account: { totp: { exists: true } } }}>
        <UnitRowTwoStepAuth />
      </MockedCache>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('unit-row-modal'));
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
