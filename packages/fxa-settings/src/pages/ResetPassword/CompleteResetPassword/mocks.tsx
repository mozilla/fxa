/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { LinkType } from 'fxa-settings/src/lib/types';
import CompleteResetPassword from '.';
import LinkValidator from '../../../components/LinkValidator';
import { StorageData, UrlQueryData } from '../../../lib/model-data';
import { Account, AppContext } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';
import { ReachRouterWindow } from '../../../lib/window';

// TODO: combine a lot of mocks with AccountRecoveryResetPassword
const fxDesktopV3ContextParam = { context: 'fx_desktop_v3' };

export const mockCompleteResetPasswordParams = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  emailToHashWith: MOCK_ACCOUNT.primaryEmail.email,
  token: '1111111111111111111111111111111111111111111111111111111111111111',
  code: '11111111111111111111111111111111',
};

export const paramsWithSyncDesktop = {
  ...mockCompleteResetPasswordParams,
  ...fxDesktopV3ContextParam,
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

class StorageDataMock extends StorageData {
  public override persist(): void {
    // no op
  }
  public override load(): void {
    // no op
  }
}

export const Subject = ({
  account,
  params,
}: {
  account: Account;
  params?: Record<string, string>;
}) => {
  const windowWrapper = new ReachRouterWindow();
  const urlQueryData = mockUrlQueryData(params);

  return (
    <AppContext.Provider
      value={mockAppContext({
        account,
        windowWrapper,
        storageData: new StorageDataMock(windowWrapper),
        urlQueryData,
      })}
    >
      <LocationProvider>
        <LinkValidator
          linkType={LinkType['reset-password']}
          viewName={'complete-reset-password'}
          getParamsFromModel={() => {
            return new CompleteResetPasswordLink(urlQueryData);
          }}
        >
          {({ setLinkStatus, params }) => (
            <CompleteResetPassword {...{ setLinkStatus, params }} />
          )}
        </LinkValidator>
      </LocationProvider>
    </AppContext.Provider>
  );
};
