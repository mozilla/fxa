/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import SigninCached from '.';
import { AppContext } from '../../../../models';
import { mockAppContext } from '../../../../models/mocks';
import { createMockSigninWebIntegration } from '../../mocks';
import {
  MOCK_AVATAR_NON_DEFAULT,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  mockFinishOAuthFlowHandler,
} from '../../../mocks';
import { MozServices } from '../../../../lib/types';

jest.mock('../../../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

const renderSigninCached = (
  props: Partial<React.ComponentProps<typeof SigninCached>> = {}
) =>
  renderWithLocalizationProvider(
    <LocationProvider>
      <AppContext.Provider value={mockAppContext()}>
        <SigninCached
          integration={createMockSigninWebIntegration()}
          email={MOCK_EMAIL}
          sessionToken={MOCK_SESSION_TOKEN}
          serviceName={MozServices.Default}
          hasLinkedAccount={false}
          hasPassword={true}
          avatarData={{ account: { avatar: MOCK_AVATAR_NON_DEFAULT } }}
          avatarLoading={false}
          cachedSigninHandler={jest.fn()}
          finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
          onSessionExpired={jest.fn()}
          {...props}
        />
      </AppContext.Provider>
    </LocationProvider>
  );

describe('SigninCached', () => {
  it('renders the cached signin UI without password input or third-party auth', () => {
    renderSigninCached();

    screen.getByRole('heading', { name: 'Sign in' });
    screen.getByAltText('Your avatar');
    screen.getByText(MOCK_EMAIL);
    screen.getByRole('button', { name: 'Sign in' });
    screen.getByRole('link', { name: 'Use a different account' });
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Continue with Google/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Forgot password?' })
    ).not.toBeInTheDocument();
  });

  it('renders the same cached UI for passwordless users (hasPassword=false)', () => {
    renderSigninCached({ hasPassword: false, hasLinkedAccount: true });

    screen.getByRole('heading', { name: 'Sign in' });
    screen.getByRole('button', { name: 'Sign in' });
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });

  it('hides "Use a different account" link when signed into Firefox with a service', () => {
    const integration = createMockSigninWebIntegration();
    integration.isFirefoxClient = () => true;
    integration.getService = () => MozServices.FirefoxSync;
    renderSigninCached({ integration, isSignedIntoFirefox: true });

    expect(
      screen.queryByRole('link', { name: 'Use a different account' })
    ).not.toBeInTheDocument();
  });
});
