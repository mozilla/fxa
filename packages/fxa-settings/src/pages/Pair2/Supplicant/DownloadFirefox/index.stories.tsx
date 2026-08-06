/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import DownloadFirefox from '.';

export default {
  title: 'Pages/Pair2/Supplicant/DownloadFirefox',
  component: DownloadFirefox,
  decorators: [withLocalization],
} as Meta;

// The card takes no props — both actions are static external links — so there
// is a single state to review.
export const Default = () => <DownloadFirefox />;
