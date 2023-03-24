/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { LinkType } from 'fxa-settings/src/lib/types';
import CompleteResetPassword from '.';
import LinkValidator from '../../../components/LinkValidator';
import { UrlSearchContext } from '../../../lib/context';
import { Account, AppContext } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';

export const mockCompleteResetPasswordParams = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  emailToHashWith: MOCK_ACCOUNT.primaryEmail.email,
  token: '1111111111111111111111111111111111111111111111111111111111111111',
  code: '11111111111111111111111111111111',
};

export const paramsWithMissingEmail = {
  ...mockCompleteResetPasswordParams,
  email: '',
};

export const paramsWithMissingCode = {
  ...mockCompleteResetPasswordParams,
  code: '',
};

export const paramsWithMissingEmailToHashWith = {
  ...mockCompleteResetPasswordParams,
  emailToHashWith: '',
};

export const paramsWithMissingToken = {
  ...mockCompleteResetPasswordParams,
  token: '',
};

export function mockUrlSearchContext(
  params: Record<string, string> = mockCompleteResetPasswordParams
) {
  const ctx = new UrlSearchContext(window);
  for (const param of Object.keys(params)) {
    ctx.set(param, params[param]);
  }
  return ctx;
}

export const Subject = ({
  account,
  params,
}: {
  account: Account;
  params?: Record<string, string>;
}) => (
  <AppContext.Provider value={mockAppContext({ account })}>
    <LocationProvider>
      <LinkValidator
        linkType={LinkType['reset-password']}
        viewName={'complete-reset-password'}
        getParamsFromModel={() => {
          return new CompleteResetPasswordLink(mockUrlSearchContext(params));
        }}
      >
        {({ setLinkStatus, params }) => (
          <CompleteResetPassword {...{ setLinkStatus, params }} />
        )}
      </LinkValidator>
    </LocationProvider>
  </AppContext.Provider>
);
