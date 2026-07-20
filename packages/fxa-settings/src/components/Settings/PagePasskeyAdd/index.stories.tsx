/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactNode } from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MemoryRouter } from 'react-router';
import { PagePasskeyAdd } from '.';
import { AppContext } from '../../../models';
import { AlertBarInfo } from '../../../models/AlertBarInfo';
import { mockAppContext, mockSettingsContext } from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { MfaContext } from '../MfaGuard';
import { getDefault } from '../../../lib/config';

export default {
  title: 'Pages/Settings/PasskeyAdd',
  component: PagePasskeyAdd,
  decorators: [withLocalization],
} as Meta;

const mockAccount = {
  getCachedJwtByScope: () => 'mock-jwt',
} as any;

const hangingAuthClient = {
  beginPasskeyRegistration: () => new Promise(() => {}),
  completePasskeyRegistration: () => new Promise(() => {}),
};

// Mirrors AlertBarInfo calls into the Actions panel; the real banner shows
// on the destination settings page, not here.
class StoryAlertBarInfo extends AlertBarInfo {
  success(message: string | ReactNode, gleanEvent?: () => void) {
    action('alertBar.success')(message);
    super.success(message, gleanEvent);
  }
  error(message: string | ReactNode, error?: Error) {
    action('alertBar.error')(message);
    super.error(message, error);
  }
  info(message: string | ReactNode) {
    action('alertBar.info')(message);
    super.info(message);
  }
}

function initLocalAccount() {
  const NS = '__fxa_storage';
  const uid = 'abc123';
  const accounts = {
    [uid]: {
      uid,
      sessionToken: 'mock-session-token',
      email: 'user@example.com',
      verified: true,
      lastLogin: Date.now(),
    },
  };
  window.localStorage.setItem(`${NS}.accounts`, JSON.stringify(accounts));
  window.localStorage.setItem(`${NS}.currentAccountUid`, JSON.stringify(uid));
}

const configWithPasskeys = {
  ...getDefault(),
  featureFlags: {
    ...getDefault().featureFlags,
    passkeyRegistrationEnabled: true,
  },
};

export const CeremonyInProgress = () => {
  initLocalAccount();
  return (
    <MemoryRouter initialEntries={['/settings/passkeys/add']}>
      <AppContext.Provider
        value={mockAppContext({
          account: mockAccount,
          authClient: hangingAuthClient as any,
          config: configWithPasskeys,
        })}
      >
        <SettingsContext.Provider
          value={mockSettingsContext({ alertBarInfo: new StoryAlertBarInfo() })}
        >
          <MfaContext.Provider value="passkey">
            <PagePasskeyAdd />
          </MfaContext.Provider>
        </SettingsContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>
  );
};
