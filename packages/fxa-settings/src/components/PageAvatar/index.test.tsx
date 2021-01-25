/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, screen } from '@testing-library/react';

import { AuthContext, createAuthClient } from '../../lib/auth';
import {
  renderWithRouter,
  MockedCache,
} from '../../models/_mocks';

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

it('PageAddAvatar | render add, take buttons on initial load', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client}}>
      <MockedCache>
        <PageAddAvatar />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('add-photo-btn')).toBeInTheDocument();
  expect(screen.getByTestId('take-photo-btn')).toBeInTheDocument();
});

it('PageAddAvatar | render remove button if avatar is set', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache account={{avatarUrl: 'https://example.com/avatar.jpg'}}>
        <PageAddAvatar />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('remove-photo-btn')).toBeInTheDocument();
});
