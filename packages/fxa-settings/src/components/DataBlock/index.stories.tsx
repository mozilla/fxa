/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../.storybook/decorators';
import DataBlock from './index';

export default {
  title: 'Components/DataBlock',
  component: DataBlock,
  decorators: [withLocalization],
} as Meta;

export const SingleCodeInlineCopy = () => (
  <DataBlock value="ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F" isInline />
);

export const SingleCode = () => (
  <DataBlock value="ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F" />
);

export const SingleCodeOnIOS = () => (
  <DataBlock value="ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F" isIOS />
);

export const MultipleCodes = () => (
  <DataBlock
    value={[
      'C1OFZW7R04',
      'XVKRLKERT4',
      'CF0V94X204',
      'C3THX2SGZ4',
      'UXC6NRQT54',
      '24RF9WFA44',
      'ZBULPFN7J4',
      'D4J6KY8FL4',
    ]}
  />
);
