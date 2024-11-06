/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { StoryFn } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LinkExpired, LinkExpiredProps } from '.';
import { ResendStatus } from 'fxa-settings/src/lib/types';

const meta = {
  title: 'Components/LinkExpired',
  component: LinkExpired,
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
};

export const Default = () => <LinkExpired {...mockedProps} />;

export const ResendError = () => (
  <LinkExpired
    {...mockedProps}
    resendStatus={ResendStatus.error}
    errorMessage="Mocked resend failure."
  />
);

export const ResendSuccess = () => (
  <LinkExpired {...mockedProps} resendStatus={ResendStatus.sent} />
);
