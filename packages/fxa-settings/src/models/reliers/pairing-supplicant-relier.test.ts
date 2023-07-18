/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { PairingSupplicantRelier } from './pairing-supplicant-relier';

describe('models/reliers/pairing-supplicant-relier', function () {
  let data: ModelDataStore;
  let storageData: ModelDataStore;
  let model: PairingSupplicantRelier;

  beforeEach(function () {
    data = new GenericData({});
    storageData = new GenericData({});
    model = new PairingSupplicantRelier(data, storageData, {
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
