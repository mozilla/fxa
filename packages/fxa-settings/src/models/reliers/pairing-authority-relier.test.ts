/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { PairingAuthorityRelier } from './pairing-authority-relier';

describe('models/reliers/pairing-authority-relier', function () {
  let context: ModelContext;
  let model: PairingAuthorityRelier;

  beforeEach(function () {
    context = new GenericContext({});
    model = new PairingAuthorityRelier(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
