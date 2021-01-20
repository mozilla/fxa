/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import PageSettings from '.';
import { MockedCache, renderWithRouter } from '../../models/_mocks';
import * as Metrics from '../../lib/metrics';

jest.spyOn(Metrics, 'setProperties');
jest.spyOn(Metrics, 'usePageViewEvent');

it('renders without imploding', async () => {
  renderWithRouter(
    <MockedCache>
      <PageSettings />
    </MockedCache>
  );
  expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
  expect(screen.getByTestId('settings-security')).toBeInTheDocument();
  expect(screen.getByTestId('settings-connected-services')).toBeInTheDocument();
  expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument();
  expect(Metrics.setProperties).toHaveBeenCalledWith({
    uid: 'abc123',
  });
  expect(Metrics.usePageViewEvent).toHaveBeenCalledWith('settings');
});
