/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { OAuthRelier } from './oauth-relier';

describe('models/reliers/oauth-relier', function () {
  let context: ModelContext;
  let model: OAuthRelier;

  beforeEach(function () {
    context = new GenericContext({});
    model = new OAuthRelier(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: OAuth Relier Model Test Coverage
});
