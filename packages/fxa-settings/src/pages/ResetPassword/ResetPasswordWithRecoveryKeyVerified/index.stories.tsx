/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordWithRecoveryKeyVerified from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Account } from '../../../models';
import { renderStoryWithHistory } from '../../../lib/storybook-utils';
import { createMockResetPasswordWithRecoveryKeyVerifiedWebIntegration } from './mocks';

export default {
  title: 'Pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified',
  component: ResetPasswordWithRecoveryKeyVerified,
  decorators: [withLocalization],
} as Meta;

type RenderStoryOptions = {
  account?: Account;
  props?: { isSignedIn: boolean };
  queryParams?: string;
};

function renderStory({
  account,
  props = {
    isSignedIn: false,
  },
  queryParams,
}: RenderStoryOptions = {}) {
  return renderStoryWithHistory(
    <ResetPasswordWithRecoveryKeyVerified
      {...props}
      integration={createMockResetPasswordWithRecoveryKeyVerifiedWebIntegration()}
    />,
    '/reset_password_with_recovery_key_verified',
    account,
    queryParams
  );
}

export const DefaultAccountSignedIn = () =>
  renderStory({
    props: {
      isSignedIn: true,
    },
  });
export const DefaultAccountSignedOut = () => renderStory();
export const WithSyncAccountSignedIn = () =>
  renderStory({
    props: { isSignedIn: true },
    queryParams: `service=sync`,
  });
export const WithSyncAccountSignedOut = () =>
  renderStory({ queryParams: `service=sync` });
