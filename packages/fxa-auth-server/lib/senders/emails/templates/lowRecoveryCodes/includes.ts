/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GlobalTemplateValues } from '../../../renderer';

const getSubject = (numberRemaining: number) =>
  numberRemaining === 1
    ? '1 recovery code remaining'
    : '<%= numberRemaining %> recovery codes remaining';

export const getIncludes = (numberRemaining: number): GlobalTemplateValues => ({
  subject: {
    id: 'lowRecoveryCodes-subject',
    message: getSubject(numberRemaining),
  },
  action: {
    id: 'lowRecoveryCodes-action',
    message: 'Confirm email',
  },
});

export default getIncludes;
