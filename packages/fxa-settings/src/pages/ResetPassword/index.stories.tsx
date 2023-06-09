/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPassword, { ResetPasswordProps } from '.';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { MozServices } from '../../lib/types';
import { withLocalization } from '../../../.storybook/decorators';
import { Account } from '../../models';
import {
  mockAccountWithThrottledError,
  mockAccountWithUnexpectedError,
  mockDefaultAccount,
} from './mocks';

import {
  produceComponent,
  createAppContext,
  createHistoryWithQuery,
} from '../../models/mocks';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
  decorators: [withLocalization],
} as Meta;

const route = '/reset_password';

function render(
  account: Account,
  props?: Partial<ResetPasswordProps>,
  queryParams?: string
) {
  const history = createHistoryWithQuery(route, queryParams);
  return produceComponent(
    <ResetPassword {...props} />,
    { route, history },
    {
      ...createAppContext(history),
      account,
    }
  );
}

export const Default = () => {
  return render(mockDefaultAccount);
};

export const WithServiceName = () => {
  return render(
    mockDefaultAccount,
    undefined,
    `service=${MozServices.MozillaVPN}`
  );
};

export const WithForceAuth = () => {
  return render(mockDefaultAccount, {
    prefillEmail: MOCK_ACCOUNT.primaryEmail.email,
    forceAuth: true,
  });
};

export const WithThrottledErrorOnSubmit = () => {
  return render(mockAccountWithThrottledError);
};

export const WithUnexpectedErrorOnSubmit = () => {
  return render(mockAccountWithUnexpectedError);
};
