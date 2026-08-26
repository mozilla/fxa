/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { ContinueInFirefox } from '.';
import { MOCK_ANDROID_PLAN, Subject } from './mocks';

export default {
  title: 'Components/ContinueInFirefox',
  component: ContinueInFirefox,
  decorators: [withLocalization],
} as Meta;

// iOS requires the user to tap, so the CTA is the whole story.
export const Ios = () => <Subject />;

// Android auto-navigates on mount, so the card starts as a spinner and only
// reveals the CTA if the intent silently no-ops.
export const AndroidAutoAttempting = () => <Subject plan={MOCK_ANDROID_PLAN} />;

// The auto-attempt was already spent, or storage is unavailable.
export const AndroidManual = () => (
  <Subject plan={{ ...MOCK_ANDROID_PLAN, autoAttempt: false }} />
);
