/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { LinkType } from 'fxa-settings/src/lib/types';
import CompleteResetPassword from '.';
import LinkValidator from '../../../components/LinkValidator';
import { UrlQueryData } from '../../../lib/model-data';
import { Account, AppContext } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';
import { ReachRouterWindow } from '../../../lib/window';

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

export function mockUrlQueryData(
  params: Record<string, string> = mockCompleteResetPasswordParams
) {
  const window = new ReachRouterWindow();
  const data = new UrlQueryData(window);
  for (const param of Object.keys(params)) {
    data.set(param, params[param]);
  }
  return data;
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
          return new CompleteResetPasswordLink(mockUrlQueryData(params));
        }}
      >
        {({ setLinkStatus, params }) => (
          <CompleteResetPassword {...{ setLinkStatus, params }} />
        )}
      </LinkValidator>
    </LocationProvider>
  </AppContext.Provider>
);
