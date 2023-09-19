/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import App from './App';
import { mockConfigBuilder } from './lib/config';
import {
  AdminPanelEnv,
  AdminPanelGroup,
  AdminPanelGuard,
} from 'fxa-shared/guards';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MockedProvider } from '@apollo/client/testing';

it('renders without imploding', () => {
  const guard = new AdminPanelGuard(AdminPanelEnv.Prod);
  const config = mockConfigBuilder({
    guard,
    user: {
      email: 'hello@mozilla.com',
      group: guard.getGroup(AdminPanelGroup.SupportAgentProd),
    },
  });
  const { queryByTestId } = renderWithLocalizationProvider(
    <MockedProvider addTypename={false}>
      <App {...{ config }} />
    </MockedProvider>
  );
  expect(queryByTestId('app')).toBeInTheDocument();
});
