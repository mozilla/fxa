/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { TemplateData as SupportTemplateData } from '../../partials/support';

export type TemplateData = SupportTemplateData & {
  link: string;
};

export const template = 'passwordChangeRequired';
export const version = 4;
export const layout = 'fxa';
export const includes = {
  subject: {
    id: 'passwordChangeRequired-subject',
    message: 'Suspicious activity detected',
  },
  preview: {
    id: 'passwordChangeRequired-preview',
    message: 'Change your password immediately',
  },
  action: {
    id: 'passwordChangeRequired-action',
    message: 'Reset password',
  },
};
