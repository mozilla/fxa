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

export const SingleCode = () => <Subject />;

export const SingleCodeOnIOS = () => <Subject isIOS />;

export const MultipleCodes = () => (
  <Subject
    value={[
      'c1ofzw7r04',
      'xvkrlkert4',
      'cf0v94x204',
      'c3thx2sgz4',
      'uxc6nrqt54',
      '24rf9wfa44',
      'zbulpfn7j4',
      'd4j6ky8fl4',
    ]}
  />
);
