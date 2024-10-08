/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordWithRecoveryKeyVerified from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Account } from '../../../models';
import { renderStoryWithHistory } from '../../../lib/storybook-utils';

export default {
  title: 'Pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified',
  component: ResetPasswordWithRecoveryKeyVerified,
  decorators: [withLocalization],
} as Meta;

type RenderStoryOptions = {
  account?: Account;
  queryParams?: string;
  props?: Partial<Parameters<typeof ResetPasswordWithRecoveryKeyVerified>[0]>;
};

function renderStory({ account, queryParams, props }: RenderStoryOptions = {}) {
  return renderStoryWithHistory(
    <ResetPasswordWithRecoveryKeyVerified
      {...{
        email: 'testo@example.gg',
        newRecoveryKey: '90019001900190019001900190019001',
        showHint: false,
        oAuthError: undefined,
        navigateToHint: () => {},
        updateRecoveryKeyHint: (x) => Promise.resolve(),
        navigateNext: () => Promise.resolve(),
        ...props,
      }}
    />,
    '/reset_password_with_recovery_key_verified',
    account,
    queryParams
  );
}

export const RecoveryKeyGenerated = () => renderStory({});
export const RecoveryKeyHint = () => renderStory({ props: { showHint: true } });
