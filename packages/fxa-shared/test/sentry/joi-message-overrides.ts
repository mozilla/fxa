/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import joi, { valid } from 'joi';
import { overrideJoiMessages } from '../../sentry/joi-message-overrides';

describe('#unit - joi-message-overrides', () => {
  it('overrides default message for regex', () => {
    const validators = {
      test: joi.string().regex(/test/),
    };
    const result1 = validators.test.validate('foobar').error?.message;

    const validators2 = overrideJoiMessages(validators);
    const result2 = validators2.test.validate('foobar').error?.message;

    assert.exists(validators2);
    assert.exists(result1);
    assert.exists(result2);
    assert.notEqual(result1, result2);
    assert.include(result1, 'with value');
    assert.notInclude(result2, 'with value');
  });
});
