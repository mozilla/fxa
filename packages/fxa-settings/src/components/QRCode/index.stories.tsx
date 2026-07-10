/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import QRCode from '.';
import firefoxLogo from '../../pages/Pair/Index/firefox-logo-browser.svg';

export default {
  title: 'Components/QRCode',
  component: QRCode,
  decorators: [withLocalization],
} as Meta;

const value = 'https://app.adjust.com/2uo1qc?campaign=send-tab&creative=demo';

export const Default = () => (
  <QRCode value={value} localizedLabel="Scan to download Firefox for mobile" />
);

export const WithLogo = () => (
  <QRCode
    value={value}
    localizedLabel="Scan to download Firefox for mobile"
    logoSrc={firefoxLogo}
  />
);

export const Loading = () => (
  <QRCode
    value={value}
    localizedLabel="Scan to download Firefox for mobile"
    logoSrc={firefoxLogo}
    loading
  />
);
