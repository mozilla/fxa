/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import joi from 'joi';
import { overrideJoiMessages } from './joi-message-overrides';

describe('joi-message-overrides', () => {
  it('overrides default message for regex', () => {
    const validators = {
      test: joi.string().regex(/test/),
    };
    const result1 = validators.test.validate('foobar').error?.message;

    const validators2 = overrideJoiMessages(validators);
    const result2 = validators2.test.validate('foobar').error?.message;

    expect(validators2).toBeDefined();
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result1).not.toEqual(result2);
    expect(result1).toContain('with value');
    expect(result2).not.toContain('with value');
  });
});
