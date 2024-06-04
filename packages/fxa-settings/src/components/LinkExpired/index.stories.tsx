/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { StoryFn } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LinkExpired, LinkExpiredProps } from '.';
import { LinkExpiredResetPassword } from '../LinkExpiredResetPassword';
import { ResendStatus } from 'fxa-settings/src/lib/types';
import { MOCK_ACCOUNT } from 'fxa-settings/src/models/mocks';

const meta = {
  title: 'Components/LinkExpired',
  component: LinkExpired,
  subcomponents: { LinkExpiredResetPassword },
  decorators: [
    withLocalization,
    (Story: StoryFn) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
};

export default meta;

const viewName = 'example-view-name';
const email = MOCK_ACCOUNT.primaryEmail.email;

const mockResendHandler = async () => {
  try {
    alert('Mock function for storybook');
  } catch (e) {}
};

const mockedProps: LinkExpiredProps = {
  headingText: 'Some heading',
  headingTextFtlId: 'mock-heading-id',
  messageText: 'Some text',
  messageFtlId: 'mock-message-id',
  resendLinkHandler: mockResendHandler,
  resendStatus: ResendStatus.none,
};

export const Default = () => <LinkExpired {...mockedProps} />;

export const LinkExpiredForResetPassword = () => (
  <LinkExpiredResetPassword {...{ email, viewName }} />
);
