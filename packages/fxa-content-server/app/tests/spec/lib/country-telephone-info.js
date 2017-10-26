/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const CountryTelephoneInfo = require('lib/country-telephone-info');

  describe('lib/country-telephone-info', () => {

    describe('AT', () => {
      const { format, normalize, pattern } = CountryTelephoneInfo.AT;

      describe('format', () => {
        it('formats correctly', () => {
          assert.equal(format('1234567890'), '+43 1234567890');
        });
      });

      describe('normalize', () => {
        it('normalizes a number accepted by pattern correctly', () => {
          assert.equal(normalize('+431234567890'), '+431234567890');
          assert.equal(normalize('1234567890'), '+431234567890');
        });
      });

      describe('pattern', () => {
        it('validates correctly', () => {
          assert.ok(pattern.test('123456'));
          assert.ok(pattern.test('+43123456'));
          assert.isFalse(pattern.test('+331234567890'));
        });
      });
    });

    describe('DE', () => {
      const { format, normalize, pattern } = CountryTelephoneInfo.DE;

      describe('format', () => {
        it('formats correctly', () => {
          assert.equal(format('1234567890'), '+49 1234567890');
        });
      });

      describe('normalize', () => {
        it('normalizes a number accepted by pattern correctly', () => {
          assert.equal(normalize('+491234567890'), '+491234567890');
          assert.equal(normalize('1234567890'), '+491234567890');
        });
      });

      describe('pattern', () => {
        it('validates correctly', () => {
          assert.ok(pattern.test('123456'));
          assert.ok(pattern.test('1234567890123'));
          assert.ok(pattern.test('+49123456'));
          assert.ok(pattern.test('+491234567890123'));
          assert.isFalse(pattern.test('+331234567890'));
        });
      });
    });

    describe('GB', () => {
      const { format, normalize, pattern } = CountryTelephoneInfo.GB;

      describe('format', () => {
        it('formats correctly', () => {
          assert.equal(format('1234567890'), '+44 1234567890');
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

    describe('RO', () => {
      const { format, normalize, pattern } = CountryTelephoneInfo.RO;

      it('formats correctly', () => {
        assert.equal(format('712345678'), '+40 712345678');
      });

      describe('normalize', () => {
        it('normalizes a number accepted by pattern correctly', () => {
          assert.equal(normalize('712345678'), '+40712345678'); // no country code prefix
          assert.equal(normalize('0712345678'), '+40712345678'); // no country code prefix, extra 0 before the 7
          assert.equal(normalize('+40712345678'), '+40712345678'); // full country code prefix
          assert.equal(normalize('+400712345678'), '+40712345678'); // full country code prefix, extra 0 before the 7
        });
      });

      describe('pattern', () => {
        it('validates correctly', () => {
          assert.isFalse(pattern.test('71234567')); // too short
          assert.isFalse(pattern.test('7123456789')); // too long
          assert.isFalse(pattern.test('812345678')); // invalid prefix (must be 7)

          assert.ok(pattern.test('712345678'));
          assert.ok(pattern.test('0712345678')); // allow leading 0
          assert.ok(pattern.test('+40712345678')); // full country code prefix
          assert.ok(pattern.test('+400712345678')); // full country code prefix with 0 before 7
          assert.isFalse(pattern.test('+45712345678')); // incorrect country code prefix
        });
      });
    });

    describe('US', () => {
      const { format, normalize, pattern } = CountryTelephoneInfo.US;

      it('formats correctly', () => {
        assert.equal(format('1234567890'), '1234567890');
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
