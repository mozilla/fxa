/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import InlinePasswordlessSyncSetup from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/InlinePasswordlessSyncSetup',
  component: InlinePasswordlessSyncSetup,
  decorators: [withLocalization],
} as Meta;

const handlers = {
  onEnable: action('onEnable'),
  onNotNow: action('onNotNow'),
};

export const Default = () => <Subject {...handlers} />;

export const Enabling = () => <Subject isEnabling {...handlers} />;

export const ConfirmationDismissed = () => (
  <Subject
    error={{
      type: 'warning',
      content: {
        localizedHeading: 'Passkey confirmation didn’t finish',
        localizedDescription:
          'Confirm with your passkey to skip the password next time.',
      },
      link: {
        url: 'https://support.mozilla.org/kb/troubleshoot-passkey-mozilla-account',
        localizedText: 'How to use passkeys',
      },
    }}
    {...handlers}
  />
);
