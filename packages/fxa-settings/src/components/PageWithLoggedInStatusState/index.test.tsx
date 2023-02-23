/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageWithLoggedInStatusState } from '.';
import { MockComponent } from './mocks';
import { Account, AppContext, useInitialState } from '../../models';
import { mockAppContext } from '../../models/mocks';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialState: jest.fn(),
}));

describe('PageWithLoggedInStatusState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  (useInitialState as jest.Mock).mockReturnValue({ loading: false });

  it('passes the `isSignedIn` prop on to the child component', () => {
    const account = {
      metricsEnabled: false,
      hasPassword: true,
    } as unknown as Account;
    render(
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageWithLoggedInStatusState
          path="/arbitrary_path/*"
          Page={MockComponent}
        />
      </AppContext.Provider>
    );
    expect(screen.getByText('You are signed in!')).toBeInTheDocument();
  });
});
