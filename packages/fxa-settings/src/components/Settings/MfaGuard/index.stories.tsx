/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { action } from '@storybook/addon-actions';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { MfaGuard } from './index';
import { JwtTokenCache } from '../../../lib/cache';

const scope: 'test' = 'test';
const session = 'session-xyz';

function initLocalAccount(sessionToken: string) {
  // Match Storage fullKey logic: '__fxa_storage.' prefix
  const NS = '__fxa_storage';
  const uid = 'abc123';
  const accounts = {
    [uid]: {
      uid,
      sessionToken,
      email: 'user@example.com',
      verified: true,
      lastLogin: Date.now(),
    },
  };
  window.localStorage.setItem(`${NS}.accounts`, JSON.stringify(accounts));
  window.localStorage.setItem(`${NS}.currentAccountUid`, JSON.stringify(uid));
}

const authClient = {
  mfaRequestOtp: async (st: string, sc: string) => {
    action('mfaRequestOtp')({ sessionToken: st, scope: sc });
    return undefined;
  },
  mfaOtpVerify: async (st: string, code: string, sc: string) => {
    action('mfaOtpVerify')({ sessionToken: st, code, scope: sc });
    return { accessToken: 'storybook-jwt' } as any;
  },
} as any;

export default {
  title: 'Components/Settings/MfaGuard',
  component: MfaGuard,
  decorators: [withLocalization, withLocation('/settings')],
} as Meta;

export const JwtMissingShowsModal = () => {
  initLocalAccount(session);
  // Ensure no token present so guard triggers OTP flow
  try {
    if (JwtTokenCache.hasToken(session, scope)) {
      JwtTokenCache.removeToken(session, scope);
    }
  } catch {}

  return (
    <AppContext.Provider value={mockAppContext({ authClient } as any)}>
      <MfaGuard requiredScope={scope}>
        <div>Secured content</div>
      </MfaGuard>
    </AppContext.Provider>
  );
};

export const JwtPresentRendersChildren = () => {
  initLocalAccount(session);
  JwtTokenCache.setToken(session, scope, 'jwt-present');

  return (
    <AppContext.Provider value={mockAppContext({ authClient } as any)}>
      <MfaGuard requiredScope={scope}>
        <div>Secured content</div>
      </MfaGuard>
    </AppContext.Provider>
  );
};
