/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_USER_INFO } from '../../partials/userInfo/mocks';
import { includes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/postAddPasskey',
} as Meta;

const baseData = {
  ...MOCK_USER_INFO,
  link: 'http://localhost:3030/settings',
  securitySettingsLink: 'http://localhost:3030/settings#security',
  reviewActivitySupportUrl:
    'https://support.mozilla.org/kb/review-mozilla-account-activity-and-protect-data',
  passkeySupportUrl: 'https://support.mozilla.org',
};

const createStory = storyWithProps<TemplateData>(
  'postAddPasskey',
  'Sent when a user successfully registers a new passkey',
  { ...baseData, showSyncPasswordNote: true },
  includes
);

const createStoryNoSyncNote = storyWithProps<TemplateData>(
  'postAddPasskey',
  'Sent when a user successfully registers a new passkey (passwordless account — no Sync note)',
  { ...baseData, showSyncPasswordNote: false },
  includes
);

export const PostAddPasskey = createStory();
export const PostAddPasskeyPasswordless = createStoryNoSyncNote();
