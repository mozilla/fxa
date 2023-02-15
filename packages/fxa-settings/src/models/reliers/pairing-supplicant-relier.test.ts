/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelContext, GenericContext } from '../../lib/context';
import { PairingSupplicantRelier } from './pairing-supplicant-relier';

describe('models/reliers/pairing-supplicant-relier', function () {
  let context: ModelContext;
  let model: PairingSupplicantRelier;

  beforeEach(function () {
    context = new GenericContext({});
    model = new PairingSupplicantRelier(context);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
