/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { FlowRecoveryKeyConfirmPwd } from '.';
import { Meta } from '@storybook/react';
import { Account, AppContext, useFtlMsgResolver } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { MfaContext } from '../../../lib/hooks';
import AuthClient from 'fxa-auth-client/browser';
import {
  mockAccountWithoutRecoveryKey as accountWithoutKey,
  mockAccountWithRecoveryKey as accountWithKey,
  mockRecoveryKeyAuthClient,
} from './mocks';

export default {
  title: 'Components/Settings/FlowRecoveryKeyConfirmPwd',
  component: FlowRecoveryKeyConfirmPwd,
  decorators: [withLocalization, withLocation('/settings/account_recovery')],
} as Meta;

const viewName = 'example-view-name';

const navigateBackward = () => {
  alert('Going back!');
};

const navigateForward = () => {
  alert('Success!');
};

const StoryWithContext = (account: Account, authClient: AuthClient) => {
  const [, setFormattedRecoveryKey] = useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-back-button',
    'Back to settings'
  );
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-page-title',
    'Account Recovery Key'
  );

  return (
    <AppContext.Provider value={mockAppContext({ account, authClient })}>
      <SettingsLayout>
        <MfaContext.Provider value="recovery_key">
          <FlowRecoveryKeyConfirmPwd
            {...{
              localizedBackButtonTitle,
              localizedPageTitle,
              navigateBackward,
              navigateForward,
              setFormattedRecoveryKey,
              viewName,
            }}
          />
        </MfaContext.Provider>
      </SettingsLayout>
    </AppContext.Provider>
  );
};

export const CreateKey = () =>
  StoryWithContext(accountWithoutKey, mockRecoveryKeyAuthClient());

export const ChangeKey = () =>
  StoryWithContext(accountWithKey, mockRecoveryKeyAuthClient());

export const WithTooltipErrorOnSubmit = () =>
  StoryWithContext(
    accountWithoutKey,
    mockRecoveryKeyAuthClient(AuthUiErrors.INCORRECT_PASSWORD)
  );

export const WithBannerErrorOnSubmit = () =>
  StoryWithContext(
    accountWithoutKey,
    mockRecoveryKeyAuthClient(AuthUiErrors.THROTTLED)
  );
