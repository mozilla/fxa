/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import Security from '.';
import { renderWithRouter, MockedCache } from '../../models/_mocks';

describe('Security', () => {
  it('renders "fresh load" <Security/> with correct content', async () => {
    renderWithRouter(
      <MockedCache account={{ recoveryKey: false, totp: { exists: false } }}>
        <Security />
      </MockedCache>
    );

    expect(await screen.findByText('rk-header')).toBeTruthy;
    expect(await screen.findByText('tfa-row-header')).toBeTruthy;

    const result = await screen.findAllByText('Not set');
    expect(result).toHaveLength(2);
  });

  it('renders "enabled two factor" and "recovery key present" <Security/> with correct content', async () => {
    renderWithRouter(
      <MockedCache account={{ recoveryKey: true, totp: { exists: true } }}>
        <Security />
      </MockedCache>
    );

    const result = await screen.findAllByText('Enabled');
    expect(result).toHaveLength(2);
  });
});
