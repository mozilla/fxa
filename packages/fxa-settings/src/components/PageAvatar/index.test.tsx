/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';

import { AuthContext, createAuthClient } from '../../lib/auth';
import { MockedCache, renderWithRouter } from '../../models/_mocks';

import PageAddAvatar from './Add';
import { PageCaptureAvatar } from './Capture';

const client = createAuthClient('none');

it('PageAddAvatar | renders', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageAddAvatar />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
});

// CAPTURE COMPONENT
it('PageCaptureAvatar | renders', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageCaptureAvatar />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('shutter')).toBeInTheDocument();
});
