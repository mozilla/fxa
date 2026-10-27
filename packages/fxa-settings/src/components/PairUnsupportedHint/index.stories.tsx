/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';
import PairUnsupportedHint, { PairUnsupportedHintProps } from '.';

export default {
  title: 'Components/PairUnsupportedHint',
  component: PairUnsupportedHint,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: PairUnsupportedHintProps) => () => (
  <AppLayout whiteBackground>
    <PairUnsupportedHint {...props} />
  </AppLayout>
);

export const WebviewIos = storyWithProps({ view: 'webview', os: 'ios' });
export const WebviewAndroid = storyWithProps({
  view: 'webview',
  os: 'android',
});
export const TabIos = storyWithProps({ view: 'tab', os: 'ios' });
export const TabAndroid = storyWithProps({ view: 'tab', os: 'android' });
