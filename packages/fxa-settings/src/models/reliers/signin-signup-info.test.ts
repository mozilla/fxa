/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { SignInSignUpInfo } from './signin-signup-info';

describe('models/reliers/signin-signup-info', function () {
  let context: ModelContext;
  let model: SignInSignUpInfo;

  beforeEach(function () {
    context = new GenericContext({});
    model = new SignInSignUpInfo(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
