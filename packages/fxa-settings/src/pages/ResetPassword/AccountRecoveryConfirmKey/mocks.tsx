/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { MozServices } from '../../../lib/types';
import { Account, IntegrationType } from '../../../models';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  createHistoryWithQuery,
  createAppContext,
  mockUrlQueryData,
} from '../../../models/mocks';

import { LinkType } from 'fxa-settings/src/lib/types';
import LinkValidator from '../../../components/LinkValidator';
import { CompleteResetPasswordLink } from '../../../models/reset-password/verification';
import AccountRecoveryConfirmKey from '.';
import { MOCK_SERVICE } from '../../mocks';
import { AccountRecoveryConfirmKeyBaseIntegration } from './interfaces';

// Extend base mocks
export * from '../../mocks';

export const MOCK_SERVICE_NAME = MozServices.FirefoxSync;
export const MOCK_RECOVERY_KEY = 'ARJDF300TFEPRJ7SFYB8QVNVYT60WWS2';
export const MOCK_RESET_TOKEN = 'mockResetToken';
export const MOCK_RECOVERY_KEY_ID = 'mockRecoveryKeyId';

// TODO: combine a lot of mocks with AccountRecoveryResetPassword
const fxDesktopV3ContextParam = { context: 'fx_desktop_v3' };

export const mockCompleteResetPasswordParams = {
  email: MOCK_ACCOUNT.primaryEmail.email,
  emailToHashWith: MOCK_ACCOUNT.primaryEmail.email,
  token: '1111111111111111111111111111111111111111111111111111111111111111',
  code: '11111111111111111111111111111111',
  uid: MOCK_ACCOUNT.uid,
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

export function createMockWebIntegration(): AccountRecoveryConfirmKeyBaseIntegration {
  return {
    type: IntegrationType.Web,
    getServiceName: () => MozServices.Default,
  };
}

export function createMockOAuthIntegration(
  serviceName = MOCK_SERVICE
): AccountRecoveryConfirmKeyBaseIntegration {
  return {
    type: IntegrationType.OAuth,
    getServiceName: () => serviceName,
  };
}

const route = '/account_recovery_confirm_key';
export const getSubject = (
  account: Account,
  params: Record<string, string>,
  integration: AccountRecoveryConfirmKeyBaseIntegration
) => {
  const urlQueryData = mockUrlQueryData(params);
  const history = createHistoryWithQuery(
    route,
    new URLSearchParams(params).toString()
  );

  return {
    Subject: () => (
      <LinkValidator
        linkType={LinkType['reset-password']}
        viewName="account-recovery-confirm-key"
        createLinkModel={() => {
          return new CompleteResetPasswordLink(urlQueryData);
        }}
        {...{ integration }}
      >
        {({ setLinkStatus, linkModel }) => (
          <AccountRecoveryConfirmKey
            {...{ setLinkStatus, linkModel, integration }}
          />
        )}
      </LinkValidator>
    ),
    route,
    history,
    appCtx: {
      ...mockAppContext({
        ...createAppContext(),
        account,
      }),
    },
  };
};
