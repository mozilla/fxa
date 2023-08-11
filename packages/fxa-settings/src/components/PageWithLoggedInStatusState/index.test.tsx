/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// import React from 'react';
// import {  screen } from '@testing-library/react';
// import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { PageWithLoggedInStatusState } from '.';
// import { MockComponent } from './mocks';
import {
  /* Account, AppContext,*/ useInitialSettingsState,
} from '../../models';
// import { mockAppContext } from '../../models/mocks';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialSettingsState: jest.fn(),
}));

describe('PageWithLoggedInStatusState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  (useInitialSettingsState as jest.Mock).mockReturnValue({ loading: false });

  it('passes the `isSignedIn` prop on to the child component', () => {
    // TODO:
    // Tests are going to require changes incoming from https://github.com/mozilla/fxa/pull/14918/,
    // which has not been merged yet and may still change. As a result, I am commenting out these tests
    // until that is in main and we can incorporate it.
    // const account = {
    //   metricsEnabled: false,
    //   hasPassword: true,
    // } as unknown as Account;
    // renderWithLocalizationProvider(
    //   <AppContext.Provider value={mockAppContext({ account })}>
    //     <PageWithLoggedInStatusState
    //       path="/arbitrary_path/*"
    //       Page={MockComponent}
    //     />
    //   </AppContext.Provider>
    // );
    // expect(screen.getByText('You are signed in!')).toBeInTheDocument();
  });
});
