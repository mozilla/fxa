/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AdminPanelFeature } from 'fxa-shared/guards';
import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'AdminPanelFeature';
export const Features = (...features: AdminPanelFeature[]) =>
  SetMetadata(FEATURE_KEY, features);
