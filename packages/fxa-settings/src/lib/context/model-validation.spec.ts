/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ContextValidation as V } from './model-validation';

describe('context-validation', function () {
  //let sandbox:SinonSandbox;

  it('validates string', () => {
    V.isString('', '');
    V.isString('', null);
    V.isString('', undefined);
    expect(() => V.isString('', {})).toThrow();
    expect(() => V.isString('', 1)).toThrow();
    expect(() => V.isString('', true)).toThrow();
    expect(() => V.isString('', false)).toThrow();
  });

  it('validates hex string', () => {
    // Based on string, so only check formatting here
    V.isHex('', '123ABC');
    expect(() => V.isHex('', 'zys')).toThrow();
  });

  it('validates non empty string', () => {
    V.isNonEmptyString('', '1');
    expect(() => V.isNonEmptyString('', '')).toThrow();
  });

  it('validates number', () => {
    V.isNumber('', 1);
    V.isNumber('', 1.1);
    V.isNumber('', 1e2);
    V.isNumber('', -1e2);
    V.isNumber('', '1');
    V.isNumber('', '1.1');
    V.isNumber('', '1e2');
    V.isNumber('', '-1e2');
    V.isNumber('', null);
    V.isNumber('', undefined);
    expect(() => V.isNumber('', 'a')).toThrow();
    expect(() => V.isNumber('', true)).toThrow();
    expect(() => V.isNumber('', false)).toThrow();
    expect(() => V.isNumber('', {})).toThrow();
  });

  // TODO: Complete validations and tests
});
