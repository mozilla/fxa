/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 define((require, exports, module) => {
   'use strict';

   const { assert } = require('chai');
   const CountryTelephoneInfo = require('lib/country-telephone-info');

   describe('lib/country-telephone-info', () => {
     describe('GB', () => {
       let { format, normalize, pattern } = CountryTelephoneInfo.GB;

       describe('format', () => {
         it('formats correctly', () => {
           assert.equal(format('+441234567890'), '+44 1234 567890');
         });
       });

       describe('normalize', () => {
         it('normalizes a number accepted by pattern correctly', () => {
           assert.equal(normalize('+441234567890'), '+441234567890');
           assert.equal(normalize('1234567890'), '+441234567890');
         });
       });

       describe('pattern', () => {
         it('validates correctly', () => {
           assert.ok(pattern.test('1234567890'));
           assert.ok(pattern.test('+441234567890'));
           assert.isFalse(pattern.test('+331234567890'));
           assert.isFalse(pattern.test('+4401234567890')); // that leading 0 kills me.
           assert.isFalse(pattern.test('+44123456789'));
           assert.isFalse(pattern.test('123456789'));
         });
       });
     });

     describe('US', () => {
       let { format, normalize, pattern } = CountryTelephoneInfo.US;

       it('formats correctly', () => {
         assert.equal(format('+11234567890'), '123-456-7890');
         assert.equal(format('+14234567890'), '423-456-7890');
       });

       describe('normalize', () => {
         it('normalizes a number accepted by pattern correctly', () => {
           assert.equal(normalize('+11234567890'), '+11234567890'); // full country code prefix
           assert.equal(normalize('11234567890'), '+11234567890'); // country code prefix w/o +
           assert.equal(normalize('1234567890'), '+11234567890'); // no country code prefix
         });
       });

       describe('pattern', () => {
         it('validates correctly', () => {
           assert.ok(pattern.test('2134567890'));
           assert.ok(pattern.test('+12134567890')); // full country code prefix
           assert.ok(pattern.test('12134567890')); // country code prefix w/o +
           assert.ok(pattern.test('15234567890'));
           assert.isFalse(pattern.test('+332134567890'));
           assert.isFalse(pattern.test('+1213456789'));
           assert.isFalse(pattern.test('213456789'));
           assert.isFalse(pattern.test('1213456789'));
           assert.isFalse(pattern.test('1123456789')); // can't start an area code with 1
           assert.isFalse(pattern.test('11234567890')); // can't start an area code with 1
           assert.isFalse(pattern.test('121345678901')); // too long, has country prefix
           assert.isFalse(pattern.test('21345678901')); // too long, no country prefix
         });
       });
     });
   });
 });
