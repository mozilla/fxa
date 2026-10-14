/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as lib from '@fxa/shared/email/server';
import * as errorsShim from '../../email/emailValidatorErrors';
import * as validateShim from '../../email/validateEmail';

describe('email validation shims', () => {
  it('re-export tryResolveMx and tryResolveIpv4', () => {
    assert.strictEqual(validateShim.tryResolveMx, lib.tryResolveMx);
    assert.strictEqual(validateShim.tryResolveIpv4, lib.tryResolveIpv4);
  });

  it('re-export NotFoundErrorCodes and WrappedErrorCodes', () => {
    assert.strictEqual(errorsShim.NotFoundErrorCodes, lib.NotFoundErrorCodes);
    assert.strictEqual(errorsShim.WrappedErrorCodes, lib.WrappedErrorCodes);
  });
});
