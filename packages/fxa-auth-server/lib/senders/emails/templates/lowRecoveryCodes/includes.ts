/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GlobalTemplateValues } from '../../../renderer';

const SUBJECTS = [ 'No backup authentication codes left', 'Only 1 backup authentication code left' ];

const getSubject = (numberRemaining: number) =>
  SUBJECTS[numberRemaining] || 'Only <%= numberRemaining %> backup authentication codes left!';

export const getIncludes = (numberRemaining: number): GlobalTemplateValues => ({
  subject: {
    id: 'lowRecoveryCodes-subject-2',
    message: getSubject(numberRemaining),
  },
  action: {
    id: 'lowRecoveryCodes-action-2',
    message: 'Create codes',
  },
});

export default getIncludes;
