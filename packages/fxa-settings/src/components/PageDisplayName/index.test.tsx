/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import PageDisplayName from '.';
import { MockedCache, renderWithRouter } from 'fxa-settings/src/models/_mocks';
import { AuthContext, createAuthClient } from 'fxa-settings/src/lib/auth';

const client = createAuthClient('none');

it('renders', async () => {
  renderWithRouter(
    <AuthContext.Provider value={{ auth: client }}>
      <MockedCache>
        <PageDisplayName />
      </MockedCache>
    </AuthContext.Provider>
  );
  expect(screen.getByTestId('flow-container')).toBeInTheDocument();
  expect(screen.getByTestId('flow-container-back-btn')).toBeInTheDocument();
  expect(screen.getByTestId('input-field')).toBeInTheDocument();
  expect(screen.getByTestId('submit-display-name')).toBeInTheDocument();
});
