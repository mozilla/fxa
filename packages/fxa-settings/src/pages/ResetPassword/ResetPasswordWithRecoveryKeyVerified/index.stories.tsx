/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordWithRecoveryKeyVerified from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import {
  produceComponent,
  createAppContext,
  createHistoryWithQuery,
} from '../../../models/mocks';

export default {
  title: 'Pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified',
  component: ResetPasswordWithRecoveryKeyVerified,
  decorators: [withLocalization],
} as Meta;

const route = '/reset_password_with_recovery_key_verified';

function render(isSignedIn: boolean, queryParams?: string) {
  const history = createHistoryWithQuery(route, queryParams);
  const appCtx = createAppContext(history);
  return produceComponent(
    <ResetPasswordWithRecoveryKeyVerified isSignedIn={isSignedIn} />,
    { route, history },
    appCtx
  );
}

export const DefaultAccountSignedIn = () => render(true);
export const DefaultAccountSignedOut = () => render(false);
export const WithSyncAccountSignedIn = () => render(true, `service=sync`);
export const WithSyncAccountSignedOut = () => render(false, `service=sync`);
