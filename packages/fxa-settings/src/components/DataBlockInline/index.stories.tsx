/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import DataBlockInline from '.';
import { Subject } from './mocks';

export default {
  title: 'Components/DataBlockInline',
  component: DataBlockInline,
  decorators: [withLocalization],
} as Meta;

export const SingleCodeInlineCopy = () => <Subject />;
