/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import ConnectedServices from '.';
import { renderWithRouter, MockedCache } from '../../models/_mocks';

describe('Connected Services', () => {
  it('renders "fresh load" <ConnectedServices/> with correct content', async () => {
    renderWithRouter(
      <MockedCache account={{ recoveryKey: false, totp: { exists: false } }}>
        <ConnectedServices />
      </MockedCache>
    );

    expect(await screen.findByText('Connected Services')).toBeTruthy;
  });
});
