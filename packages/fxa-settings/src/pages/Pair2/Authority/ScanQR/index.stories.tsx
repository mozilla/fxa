/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ScanQR from '.';
import { MOCK_LONG_QR_CODE_VALUE, Subject } from './mocks';

export default {
  title: 'Pages/Pair2/Authority/ScanQR',
  component: ScanQR,
  decorators: [withLocalization],
} as Meta;

export const Default = () => <Subject />;

// A denser code, to check that the QR still lands inside the phone outline
// whatever version the encoded value forces.
export const WithLongQrCodeValue = () => (
  <Subject qrCodeValue={MOCK_LONG_QR_CODE_VALUE} />
);
