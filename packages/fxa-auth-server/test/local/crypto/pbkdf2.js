/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const pbkdf2 = require('../../../lib/crypto/pbkdf2');
const ITERATIONS = 20000;
const LENGTH = 32;

describe('pbkdf2', () => {
  it('pbkdf2 derive', () => {
    const salt = Buffer.from(
      'identity.mozilla.com/picl/v1/first-PBKDF:andré@example.org'
    );
    const password = Buffer.from('pässwörd');
    return pbkdf2.derive(password, salt, ITERATIONS, LENGTH).then((K1) => {
      assert.equal(
        K1.toString('hex'),
        'f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd'
      );
    });
  });

  it('pbkdf2 derive long input', () => {
    const email = Buffer.from(
      'ijqmkkafer3xsj5rzoq+msnxsacvkmqxabtsvxvj@some-test-domain-with-a-long-name-example.org'
    );
    const password = Buffer.from(
      'mSnxsacVkMQxAbtSVxVjCCoWArNUsFhiJqmkkafER3XSJ5rzoQ'
    );
    const salt = Buffer.from(
      `identity.mozilla.com/picl/v1/first-PBKDF:${email}`
    );
    return pbkdf2.derive(password, salt, ITERATIONS, LENGTH).then((K1) => {
      assert.equal(
        K1.toString('hex'),
        '5f99c22dfac713b6d73094604a05082e6d345f8a00d4947e57105733f51216eb'
      );
    });
  });

  it('pbkdf2 derive bit array', () => {
    const salt = Buffer.from(
      'identity.mozilla.com/picl/v1/second-PBKDF:andré@example.org'
    );
    const K2 =
      '5b82f146a64126923e4167a0350bb181feba61f63cb1714012b19cb0be0119c5';
    const passwordString = 'pässwörd';
    const password = Buffer.concat([
      Buffer.from(K2, 'hex'),
      Buffer.from(passwordString),
    ]);

    return pbkdf2.derive(password, salt, ITERATIONS, LENGTH).then((K1) => {
      assert.equal(
        K1.toString('hex'),
        'c16d46c31bee242cb31f916e9e38d60b76431d3f5304549cc75ae4bc20c7108c'
      );
    });
  });
});
