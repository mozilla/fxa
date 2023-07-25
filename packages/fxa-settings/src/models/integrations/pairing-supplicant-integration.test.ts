/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { PairingSupplicantIntegration } from './pairing-supplicant-integration';

describe('models/integration/pairing-supplicant-integration', function () {
  let data: ModelDataStore;
  let storageData: ModelDataStore;
  let model: PairingSupplicantIntegration;

  beforeEach(function () {
    data = new GenericData({});
    storageData = new GenericData({});
    model = new PairingSupplicantIntegration(data, storageData, {
      scopedKeysEnabled: true,
      scopedKeysValidation: {},
      isPromptNoneEnabled: true,
      isPromptNoneEnabledClientIds: [],
    });
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
