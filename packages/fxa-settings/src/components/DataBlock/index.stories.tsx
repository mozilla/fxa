/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject } from './mocks';
import DataBlock from '.';

export default {
  title: 'Components/DataBlock',
  component: DataBlock,
  decorators: [withLocalization],
} as Meta;

export const SingleCodeInlineCopy = () => <Subject isInline />;

export const SingleCode = () => <Subject />;

export const SingleCodeOnIOS = () => <Subject isIOS />;

export const MultipleCodes = () => (
  <Subject
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
