/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPassword, { ResetPasswordProps } from '.';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { withLocalization } from '../../../.storybook/decorators';
import {
  mockAccountWithThrottledError,
  mockAccountWithUnexpectedError,
} from './mocks';
import { renderStoryWithHistory } from '../../lib/storybook-utils';
import { Account } from '../../models';
import { MOCK_ACCOUNT } from '../../models/mocks';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
  decorators: [withLocalization],
} as Meta;

type RenderStoryOptions = {
  account?: Account;
  props?: Partial<ResetPasswordProps>;
  queryParams?: string;
};

function renderStory({ account, props, queryParams }: RenderStoryOptions = {}) {
  return renderStoryWithHistory(
    <ResetPassword {...props} />,
    '/reset_password',
    account,
    queryParams
  );
}

export const Default = () => renderStory();

export const WithServiceName = () =>
  renderStory({ queryParams: `service=${MozServices.MozillaVPN}` });

export const WithForceAuth = () =>
  renderStory({
    props: {
      prefillEmail: MOCK_ACCOUNT.primaryEmail.email,
      forceAuth: true,
    },
  });

export const WithThrottledErrorOnSubmit = () =>
  renderStory({ account: mockAccountWithThrottledError });

export const WithUnexpectedErrorOnSubmit = () =>
  renderStory({ account: mockAccountWithUnexpectedError });
