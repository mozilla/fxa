/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import { GlobalTemplateValues } from '../../../renderer';

 const getSubject = (numberRemaining: number) =>
 numberRemaining === 1 ? '<%= numberRemaining %> backup authentication code left' : '<%= numberRemaining %> backup authentication codes left';

 export const getIncludes = (numberRemaining: number): GlobalTemplateValues => ({
   subject: {
     id: 'postConsumeRecoveryCode-subject-2',
     message: getSubject(numberRemaining),
   },
   action: {
    id: 'postConsumeRecoveryCode-action',
    message: 'Manage account'
  }
 });

 export default getIncludes;
