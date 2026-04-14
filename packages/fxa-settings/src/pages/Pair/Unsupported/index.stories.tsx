/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PairUnsupported from '.';
import { Meta } from '@storybook/react';
import { MOCK_ERROR } from './mock';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/Unsupported',
  component: PairUnsupported,
  decorators: [withLocalization],
} as Meta;

// NOTE: PairUnsupported renders different UI based on `navigator.userAgent` via
// the internal `useDeviceContext()` hook. The variant you see in Storybook depends
// on the browser you use to view it:
//
// - Chrome/Safari desktop  -> "Desktop non-Firefox" (Oops! heading + download CTA)
// - Firefox desktop        -> "Desktop Firefox fallback" (system camera message)
// - Mobile non-Firefox     -> "Mobile non-Firefox" (Oops! inline + download link)
// - Mobile Firefox (no system camera hash) -> "Mobile Firefox" (download prompt)
// - Mobile with #channel_id&channel_key   -> "System camera URL" (pair-from-app message)
//
// Because the hook reads the real user agent, we cannot render all variants
// simultaneously in Storybook without refactoring the component to accept
// device context as a prop. The stories below cover the prop-controllable state
// (the `error` prop) and are named to document the UA-dependent behavior.

export const Default = () => <PairUnsupported />;

export const WithError = () => <PairUnsupported error={MOCK_ERROR} />;
