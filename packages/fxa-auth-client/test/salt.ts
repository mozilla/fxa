/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import * as assert from 'assert';
 import {
   NAMESPACE,
   V2_MARKER,
   createSaltV1,
   createSaltV2,
   parseSalt,
 } from '../lib/salt';

 describe('lib/salt', () => {
   describe('v1', () => {
     it('creates', () => {
       const salt = createSaltV1('foo@bar.com');
       assert.notEqual(salt, null);
       assert.ok(salt.length > 0);
     });

     it('creates predictable', () => {
       const salt1 = createSaltV1('foo@bar.com');
       const salt2 = createSaltV1('foo@bar.com');
       assert.equal(salt1, salt2);
     });

     it('parses', () => {
       const salt = createSaltV1('foo@bar.com');
       const parsed = parseSalt(salt);
       assert.equal(parsed.version, 1);
       assert.equal(parsed.value, 'foo@bar.com');
       assert.equal(parsed.namespace, NAMESPACE);

       assert.throws(
         () => parseSalt(salt.replace(NAMESPACE, 'foo')),
         new Error('invalid salt format')
       );
       assert.throws(
         () => parseSalt(salt.replace('quickStretch', 'bar')),
         new Error('invalid salt format')
       );
       assert.throws(
         () => parseSalt(salt.replace(/:.*/, ':baz')),
         new Error('salt value must be email like')
       );
     });
   });

   describe('v2', () => {
     it('creates', () => {
       const salt = createSaltV2();
       assert.notEqual(salt, null);
       assert.ok(salt.length > 0);
     });

     it('creates with value', () => {
       const value = '0123456789abcdef0123456789abcdef';
       const salt = createSaltV2(value);
       assert.equal(salt, `${NAMESPACE}${V2_MARKER}:${value}`);
     });

     it('will not create bogus value', () => {
       const error = new Error(
         'Invalid v2 salt value. Must be 32 character random hex string.'
       );
       assert.throws(
         () => createSaltV2('0123456789ABCDEF0123456789ABCDEF'),
         error
       );
       assert.throws(
         () => createSaltV2('0123456789abcdef0123456789abcde'),
         error
       );
       assert.throws(
         () => createSaltV2('0123456789abcdeg0123456789abcdef'),
         error
       );
     });

     it('creates distinct', () => {
       const salt1 = createSaltV2();
       const salt2 = createSaltV2();
       assert.notEqual(salt1, salt2);
     });

     it('parses', () => {
       const salt = createSaltV2();
       const parsed = parseSalt(salt);
       assert.equal(parsed.version, 2);
       assert.notEqual(parsed.value, null);
       assert.equal(parsed.value?.length, 32);
       assert.equal(parsed.namespace, NAMESPACE);

       assert.throws(
         () => parseSalt(salt.replace(NAMESPACE, 'foo')),
         new Error('invalid salt format')
       );
       assert.throws(
         () => parseSalt(salt.replace('quickStretch', 'bar')),
         new Error('invalid salt format')
       );
       assert.throws(
         () => parseSalt(salt.replace(/:.*/, ':baz')),
         new Error('salt value must have length of 32')
       );
     });
   });
 });
