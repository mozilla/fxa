/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import DownloadFirefox from '.';
import { MOCK_ANDROID_PLAN, Subject } from './mocks';

export default {
  title: 'Pages/Pair2/Supplicant/DownloadFirefox',
  component: DownloadFirefox,
  decorators: [withLocalization],
} as Meta;

// No pairing channel to hand over, so the CTA is a plain download link.
export const Default = () => <DownloadFirefox />;

// iOS requires the user to tap, so the CTA is the whole story.
export const Ios = () => <Subject />;

// Android auto-navigates on mount, so the CTA starts in its active state and
// only returns to rest if the intent silently no-ops.
export const AndroidAutoAttempting = () => <Subject plan={MOCK_ANDROID_PLAN} />;

// The auto-attempt was already spent, or storage is unavailable.
export const AndroidManual = () => (
  <Subject plan={{ ...MOCK_ANDROID_PLAN, autoAttempt: false }} />
);
