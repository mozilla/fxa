/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { FlowRecoveryKeyConfirmPwd } from '.';
import { Meta } from '@storybook/react';
import { Account, AppContext, useFtlMsgResolver } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';

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

const accountWithChangeKeySuccess = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    return new Uint8Array(20);
  },
  recoveryKey: {
    exists: true,
  },
} as unknown as Account;

const accountWithCreateKeySuccess = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    return new Uint8Array(20);
  },
  recoveryKey: { exists: false },
} as unknown as Account;

const accountWithInvalidPasswordOnSubmit = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.INCORRECT_PASSWORD;
  },
  recoveryKey: { exists: false },
} as unknown as Account;

const accountWithThrottledErrorOnSubmit = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.THROTTLED;
  },
  recoveryKey: { exists: false },
} as unknown as Account;

const StoryWithContext = (account: Account) => {
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
    <AppContext.Provider value={mockAppContext({ account })}>
      <SettingsLayout>
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
      </SettingsLayout>
    </AppContext.Provider>
  );
};

export const CreateKey = () => StoryWithContext(accountWithCreateKeySuccess);

export const ChangeKey = () => StoryWithContext(accountWithChangeKeySuccess);

export const WithTooltipErrorOnSubmit = () =>
  StoryWithContext(accountWithInvalidPasswordOnSubmit);

export const WithBannerErrorOnSubmit = () =>
  StoryWithContext(accountWithThrottledErrorOnSubmit);
