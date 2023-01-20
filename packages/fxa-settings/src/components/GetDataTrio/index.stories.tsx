/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import GetDataTrio, { GetDataCopySingleton } from './index';

export default {
  title: 'Components/GetDataTrio',
  component: GetDataTrio,
} as Meta;

export const Default = () => (
  <div className="p-10 max-w-xs">
    <GetDataTrio value="Copy that" />
  </div>
);

export const SingleCopyButton = () => (
  <div className="p-10 max-w-xs">
    <GetDataCopySingleton value="Copy that" />
  </div>
);
