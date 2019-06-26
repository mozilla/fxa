/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import CountryTelephoneInfo from 'lib/country-telephone-info';

describe('lib/country-telephone-info', () => {
  /**
   * An entry per country. `format` and `normalize`
   * use the entry key as input, and entry value as output.
   *
   * To avoid duplicating validation logic between front and
   * back ends, very little validation is done on the front end,
   * primarily length validation. The back end uses a much
   * more full featured library to validate numbers and will reject
   * a phone number it views as invalid.
   */
  /* eslint-disable sorting/sort-object-props */
  const testData = {
    // Austria
    AT: {
      format: {
        '1234567890': '+43 1234567890',
      },
      normalize: {
        '+431234567890': '+431234567890',
        '1234567890': '+431234567890',
      },
      validPatterns: ['123456', '+43123456'],
      invalidPatterns: [
        // wrong country code
        '+331234567890',
      ],
    },
    // Australia
    AU: {
      format: {
        '1234567890': '+61 1234567890',
      },
      normalize: {
        '+61123456789': '+61123456789',
        '1234567890': '+611234567890',
      },
      validPatterns: ['1234567890', '+61123456789'],
      invalidPatterns: [
        // wrong country code
        '+331234567890',

        // too short
        '123456789',
        '+6112345678',

        // too long
        '12345678901',
        '+611234567890',
      ],
    },
    // Belgium
    BE: {
      format: {
        '1234567890': '+32 1234567890',
      },
      normalize: {
        '+32123456789': '+32123456789',
        '1234567890': '+321234567890',
      },
      validPatterns: ['1234567890', '+32123456789'],
      invalidPatterns: [
        // too short
        '123456789',
        '+3212345678',

        // too long
        '12345678901',
        '+321234567890',
      ],
    },
    // Germany
    DE: {
      format: {
        '1234567890': '+49 1234567890',
      },
      normalize: {
        '+491234567890': '+491234567890',
        '1234567890': '+491234567890',
      },
      validPatterns: [
        '123456',
        '1234567890123',
        '+49123456',
        '+491234567890123',
      ],
      invalidPatterns: ['+331234567890'],
    },
    // Denmark
    DK: {
      format: {
        '12345678': '+45 12345678',
      },
      normalize: {
        '+4512345678': '+4512345678',
        '12345678': '+4512345678',
      },
      validPatterns: ['12345678', '+4512345678'],
      invalidPatterns: [
        // too short
        '+451234567',
        '1234567',

        // too long
        '+45123456789',
        '123456789',
      ],
    },
    // Spain
    ES: {
      format: {
        '123456789': '+34 123456789',
      },
      normalize: {
        '+34123456789': '+34123456789',
        '123456789': '+34123456789',
      },
      validPatterns: ['123456789', '+34123456789'],
      invalidPatterns: [
        // too short
        '12345678',
        '+3412345678',

        // too long
        '1234567890',
        '+341234567890',
      ],
    },
    // France
    FR: {
      format: {
        '1234567890': '+33 1234567890',
      },
      normalize: {
        '+33123456789': '+33123456789',
        '1234567890': '+331234567890',
      },
      validPatterns: ['1234567890', '+33123456789'],
      invalidPatterns: [
        // too short
        '123456789',
        '+3312345678',

        // too long
        '12345678901',
        '+331234567890',
      ],
    },
    // Great Britain
    GB: {
      format: {
        '1234567890': '+44 1234567890',
      },
      normalize: {
        '+441234567890': '+441234567890',
        '1234567890': '+441234567890',
      },
      validPatterns: ['12345678901', '+441234567890', '07775556372'],
      invalidPatterns: [
        '+331234567890',
        '+44123456789',
        // trunk 0 not allowed w/ country code prefix
        '+4407775551234',
        '123456789',
      ],
    },
    // Italy
    // Italy can have either 9 or 10 digit numbers. 9 digits
    // are the old style and are still used.
    IT: {
      format: {
        '123456789': '+39 123456789',
        '1234567890': '+39 1234567890',
      },
      normalize: {
        '+39123456789': '+39123456789',
        '123456789': '+39123456789',
        '+391234567890': '+391234567890',
        '1234567890': '+391234567890',
      },
      validPatterns: [
        '+39123456789',
        '123456789',
        '+391234567890',
        '1234567890',
      ],
      invalidPatterns: [
        // too short
        '+3912345678',
        '12345678',

        // too long
        '+3912345678901',
        '12345678901',
      ],
    },
    // Luxembourg
    LU: {
      format: {
        '621123456': '+352 621123456',
      },
      normalize: {
        '+352123456789': '+352123456789',
        '123456789': '+352123456789',
      },
      validPatterns: ['123456789', '+352123456789'],
      invalidPatterns: [
        // too short
        '12345678',
        '+35212345678',

        // too long
        '1234567890',
        '+3521234567890',
      ],
    },
    // Netherlands
    NL: {
      format: {
        '123456789': '+31 123456789',
      },
      normalize: {
        '+31123456789': '+31123456789',
        '123456789': '+31123456789',
      },
      validPatterns: ['+311234', '1234', '123456789'],
      invalidPatterns: [
        // too short
        '+31123',
        '123',
        // Non-geographical numbers have no fixed length
      ],
    },
    // Portugal
    PT: {
      format: {
        '123456789': '+351 123456789',
      },
      normalize: {
        '+351123456789': '+351123456789',
        '123456789': '+351123456789',
      },
      validPatterns: ['+351123456789', '123456789'],
      invalidPatterns: [
        // too short
        '+35112345678',
        '12345678',

        // too long
        '+3511234567890',
        '1234567890',
      ],
    },
    // Romania
    RO: {
      format: {
        '712345678': '+40 712345678',
      },
      normalize: {
        '712345678': '+40712345678', // no country code prefix
        '0712345678': '+40712345678', // no country code prefix, extra 0 before the 7
        '+40712345678': '+40712345678', // full country code prefix
        '+400712345678': '+40712345678', // full country code prefix, extra 0 before the 7
      },
      validPatterns: [
        '712345678',
        '0712345678', // allow leading 0
        '+40712345678', // full country code prefix
        '+400712345678', // full country code prefix with 0 before 7
      ],
      invalidPatterns: [
        '71234567', // too short
        '7123456789', // too long
        '812345678', // invalid prefix (must be 7)
        '+45712345678', // incorrect country code prefix
      ],
    },
    // United States & Canada
    US: {
      format: {
        '1234567890': '1234567890',
      },
      normalize: {
        '+11234567890': '+11234567890', // full country code prefix
        '11234567890': '+11234567890', // country code prefix w/o +
        '1234567890': '+11234567890', // no country code prefix
      },
      validPatterns: [
        '2134567890',
        '+12134567890', // full country code prefix
        '12134567890', // country code prefix w/o +
        '15234567890',
      ],
      invalidPatterns: [
        '+332134567890',
        '+1213456789',
        '213456789',
        '1213456789',
        '1123456789', // can't start an area code with 1
        '11234567890', // can't start an area code with 1
        '121345678901', // too long, has country prefix
        '21345678901', // too long, no country prefix
      ],
    },
  };
  /* eslint-enable sorting/sort-object-props */

  Object.keys(testData).forEach(countryCode => {
    describe(countryCode, () => {
      const { format, normalize, pattern } = CountryTelephoneInfo[countryCode];
      const countryTelephoneTestData = testData[countryCode];

      it('format formats correctly', () => {
        Object.keys(countryTelephoneTestData.format).forEach(input => {
          assert.equal(format(input), countryTelephoneTestData.format[input]);
        });
      });

      it('normalize normalizes a number accepted by pattern correctly', () => {
        Object.keys(countryTelephoneTestData.normalize).forEach(input => {
          assert.equal(
            normalize(input),
            countryTelephoneTestData.normalize[input]
          );
        });
      });

      it('accepts valid patterns', () => {
        countryTelephoneTestData.validPatterns.forEach(input => {
          assert.isTrue(pattern.test(input));
        });
      });

      it('rejects invalid patterns', () => {
        countryTelephoneTestData.invalidPatterns.forEach(input => {
          assert.isFalse(pattern.test(input));
        });
      });
    });
  });
});
