/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppErrorDialog from '.';
import { renderWithLocalizationProvider } from '../../lib/test-utils/localizationProvider';

describe('AppErrorDialog', () => {
  it('renders a general error dialog', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <AppErrorDialog />
    );

    expect(queryByTestId('error-loading-app')).toBeInTheDocument();
  });

  it('can trigger another signin attempt in invalid-session case', async () => {
    const { queryByText } = renderWithLocalizationProvider(
      <AppErrorDialog errorType="invalid-session" />
    );

    expect(queryByText('Invalid Session')).toBeInTheDocument();
    expect(
      queryByText('Please sign out and sign in again.')
    ).toBeInTheDocument();
  });
});
