/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { OAuthRelier } from '../reliers';
import { IntegrationType } from './base-integration';
import { OAuthIntegration } from './oauth-integration';

// TODO in the 'Pairing' React epic. This shouldn't have any `feature` overrides but feel
// free to look at all of that logic with fresh eyes in case we want to do it differently.
export class PairingSupplicantIntegration extends OAuthIntegration {
  constructor(relier: OAuthRelier) {
    super(relier, IntegrationType.PairingSupplicant);
  }
}
