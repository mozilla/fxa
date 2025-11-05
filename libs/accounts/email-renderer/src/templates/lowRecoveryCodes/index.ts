/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type TemplateData = {
  link: string;
  numberRemaining: number;
};

export const template = 'lowRecoveryCodes';
export const version = 7;
export const layout = 'fxa';

const SUBJECTS = [
  'No backup authentication codes left',
  'Only 1 backup authentication code left',
];
const getSubject = (numberRemaining: number) =>
  SUBJECTS[numberRemaining] ||
  'Only <%= numberRemaining %> backup authentication codes left!';
export function getIncludes({ numberRemaining }: TemplateData) {
  return {
    subject: {
      id: 'lowRecoveryCodes-subject-2',
      message: getSubject(numberRemaining),
    },
    action: {
      id: 'lowRecoveryCodes-action-2',
      message: 'Create codes',
    },
  };
}
