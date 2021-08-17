/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { verificationReminder } from '../../partials';

export const templateVariables = {
  title: 'Welcome to the Firefox family',
  description:
    'A few days ago you created a Firefox account, but never confirmed it.',
  subDescription:
    'Confirm now and get technology that fights for and protects your privacy, arms you with practical knowledge, and the respect you deserve.',
};

export const render = () => verificationReminder(templateVariables);
