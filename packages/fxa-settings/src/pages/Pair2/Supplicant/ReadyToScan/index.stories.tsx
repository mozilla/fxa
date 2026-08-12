/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ReadyToScan from '.';

export default {
  title: 'Pages/Pair2/Supplicant/ReadyToScan',
  component: ReadyToScan,
  decorators: [withLocalization],
} as Meta;

// The card takes no props, so there is only one state to show.
export const Default = () => <ReadyToScan />;
