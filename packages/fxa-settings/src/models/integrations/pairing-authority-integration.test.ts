/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData, ModelDataStore } from '../../lib/model-data';
import { PairingAuthorityIntegration } from './pairing-authority-integration';

describe('models/integrations/pairing-authority-relier', function () {
  let data: ModelDataStore;
  let storageData: ModelDataStore;
  let model: PairingAuthorityIntegration;

  beforeEach(function () {
    data = new GenericData({
      scope: 'profile',
    });
    storageData = new GenericData({});
    model = new PairingAuthorityIntegration(data, storageData, {
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
