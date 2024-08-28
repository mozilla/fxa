/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../lib/types';
import { Integration } from '../../models';

export type IndexIntegration = Pick<
  Integration,
  'type' | 'isSync' | 'getService'
>;

export interface IndexProps {
  integration: IndexIntegration;
  serviceName: MozServices;
}
