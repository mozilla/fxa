/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TemplateData as AutomatedEmailNoActionTemplateData } from '../../partials/automatedEmailNoAction';

export type TemplateData = AutomatedEmailNoActionTemplateData & {
  mozillaSupportUrl: string;
  wasDeleted: boolean;
};

export const template = 'fraudulentAccountDeletion';
export const version = 1;
export const layout = 'subscription';
export const includes = {
  subject: {
    id: 'fraudulentAccountDeletion-subject-2',
    message: 'Your Mozilla account was deleted',
  },
};
