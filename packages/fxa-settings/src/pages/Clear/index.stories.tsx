/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Clear from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

// This page is only used for testing and does not need the localization decorator
export default {
  title: 'Pages/Clear',
  component: Clear,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => <Clear />;
