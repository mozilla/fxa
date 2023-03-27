/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { SignInSignUpInfo } from './signin-signup-info';

describe('models/reliers/signin-signup-info', function () {
  let data: ModelDataStore;
  let model: SignInSignUpInfo;

  beforeEach(function () {
    data = new GenericData({});
    model = new SignInSignUpInfo(data);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
