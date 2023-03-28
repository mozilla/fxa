/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bind } from '../../lib/model-data';
import { OAuthRelier, OAuthRelierData } from './oauth-relier';

/**
 * A convenience interface for easy mocking / testing. Use this type in components.
 */
export interface RelierPairingSupplicantData extends OAuthRelierData {
  codeChallenge: string | undefined;
  codeChallengeMethod: string | undefined;
  scope: string | undefined;
  state: string | undefined;
}

export class PairingSupplicantRelier
  extends OAuthRelier
  implements RelierPairingSupplicantData
{
  get name() {
    return 'pairing-supplicant';
  }

  @bind([])
  scope: string | undefined = '';
}
