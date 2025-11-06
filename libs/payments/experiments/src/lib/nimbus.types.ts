/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { NimbusResult } from '@fxa/shared/experiments';

export interface WelcomeFeature {
  enabled: boolean;
}

export interface Features {
  'welcome-feature': WelcomeFeature;
}

export interface SubPlatNimbusResult extends NimbusResult {
  Features: Features;
}
