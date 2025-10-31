/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { getIncludes, TemplateData } from './index';

export default {
  title: 'FxA Emails/Templates/lowRecoveryCodes',
} as Meta;

const data = {
  link: 'http://localhost:3030/settings/two_step_authentication/replace_codes?low_recovery_codes=true',
  numberRemaining: 1,
};

const createStory = storyWithProps<TemplateData>(
  'lowRecoveryCodes',
  'Sent when a user has 2 or less backup authentication codes remaining.',
  data,
  getIncludes(data)
);

export const LowRecoveryCodesZero = createStory(
  {
    numberRemaining: 0,
  },
  'User has 0 recovery codes remaining'
);

export const LowRecoveryCodesOne = createStory(
  {
    numberRemaining: 1,
  },
  'User has 1 backup authentication code remaining'
);

export const LowRecoveryCodesMultiple = createStory(
  {
    numberRemaining: 2,
  },
  'User has 2 backup authentication codes remaining'
);
