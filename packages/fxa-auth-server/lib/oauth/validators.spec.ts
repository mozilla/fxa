/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const validators = require('./validators');

describe('oauth scope validator', () => {
  it('parses a valid scope string into a ScopeSet', () => {
    const { value, error } = validators.scope.validate('profile:email');
    expect(error).toBeUndefined();
    expect(value.getScopeValues()).toEqual(['profile:email']);
  });

  it('accepts an empty scope as an empty ScopeSet', () => {
    const { value, error } = validators.scope.validate('');
    expect(error).toBeUndefined();
    expect(value.isEmpty()).toBe(true);
  });

  it('rejects a scope string longer than 256 characters', () => {
    const { error } = validators.scope.validate('a'.repeat(257));
    expect(error).toBeDefined();
    expect(error.message).toContain('needs to be a valid scope string');
  });

  it('rejects an oversized many-component scope before expansion', () => {
    const { error } = validators.scope.validate(
      new Array(4000).fill('a').join(':')
    );
    expect(error).toBeDefined();
  });

  it('rejects a scope containing invalid characters', () => {
    const { error } = validators.scope.validate('profile:email!');
    expect(error).toBeDefined();
    expect(error.message).toContain('needs to be a valid scope string');
  });
});
