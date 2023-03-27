/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  bind,
  KeyTransforms as T,
  ModelValidation as V,
} from '../../lib/model-data';
import { OAuthRelier, OAuthRelierData } from './oauth-relier';

/**
 * A convenience interface for easy mocking / testing. Use this type in components.
 */
export interface PairingAuthorityRelierData extends OAuthRelierData {
  channelId: string;
}

export class PairingAuthorityRelier
  extends OAuthRelier
  implements PairingAuthorityRelierData
{
  get name() {
    return 'pairing-authority';
  }

  @bind([V.isString], T.snakeCase)
  channelId: string = '';
}
