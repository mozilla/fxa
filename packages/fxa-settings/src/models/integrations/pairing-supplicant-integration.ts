/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ModelDataStore } from '../../lib/model-data';
import { IntegrationType } from './integration';
import {
  OAuthWebIntegration,
  OAuthIntegrationOptions,
} from './oauth-web-integration';

export class PairingSupplicantIntegration extends OAuthWebIntegration {
  constructor(
    data: ModelDataStore,
    protected readonly storageData: ModelDataStore,
    public readonly opts: OAuthIntegrationOptions
  ) {
    super(data, storageData, opts, IntegrationType.PairingSupplicant);
  }
}
