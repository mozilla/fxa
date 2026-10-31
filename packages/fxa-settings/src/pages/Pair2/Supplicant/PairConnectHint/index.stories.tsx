/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import PairConnectHint from '.';

export default {
  title: 'Pages/Pair2/Supplicant/PairConnectHint',
  component: PairConnectHint,
  decorators: [withLocalization],
} as Meta;

export const Ios = () => <PairConnectHint os="ios" />;
Ios.decorators = [withLocation()];

export const Android = () => <PairConnectHint os="android" />;
Android.decorators = [withLocation()];

export const Webview = () => <PairConnectHint os="ios" />;
Webview.decorators = [
  withLocation('/pair/supplicant/connect_hint?embed=customtab'),
];
