/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const UserRecordNormalizer = require('../../../scripts/bulk-mailer/normalize-user-records');

describe('normalize-user-records', () => {
  let normalizer;

  before(() => {
    normalizer = new UserRecordNormalizer();
  });

  describe('normalizeAcceptLanguage', () => {
    it('uses acceptLanguage if available', () => {
      const userRecord = { acceptLanguage: 'es' };
      normalizer.normalizeAcceptLanguage(userRecord);

      assert.equal(userRecord.acceptLanguage, 'es');
    });

    it('uses the locale if acceptLanguage not set', () => {
      const userRecord = { locale: 'es' };
      normalizer.normalizeAcceptLanguage(userRecord);

      assert.equal(userRecord.acceptLanguage, 'es');
    });

    it('converts zh-tw locale to zh-cn', () => {
      const userRecord = { locale: 'zh-tw' };
      normalizer.normalizeAcceptLanguage(userRecord);

      assert.equal(userRecord.acceptLanguage, 'zh-cn');
    });
  });

  describe('normalizeLanguage', () => {
    it('updates the record language to what the translator says is best', () => {
      const userRecord = { acceptLanguage: 'es,de' };
      const translator = {
        getTranslator: sinon.spy(() => {
          return { language: 'de' };
        }),
      };
      normalizer.normalizeLanguage(userRecord, translator);

      assert.isTrue(translator.getTranslator.calledOnce);
      assert.equal(translator.getTranslator.args[0][0], 'es,de');
      assert.equal(userRecord.language, 'de');
    });
  });

  describe('normalizeLocationTimestamp', () => {
    const date = new Date();
    date.setUTCFullYear(2017);
    date.setUTCMonth(1);
    date.setUTCDate(2);
    date.setUTCHours(3);
    date.setUTCMinutes(4);
    date.setUTCSeconds(5);
    date.setUTCMilliseconds(678);

    const expectedTimestamp = '2017-01-02 @ 03:04 UTC';

    describe('with timestamp', () => {
      it('formats as expected', () => {
        const location = { timestamp: date };
        normalizer.normalizeLocationTimestamp(location);
        assert.equal(location.timestamp, expectedTimestamp);
      });
    });

    describe('with date', () => {
      it('formats as expected', () => {
        const location = { date };
        normalizer.normalizeLocationTimestamp(location);
        assert.equal(location.timestamp, expectedTimestamp);
      });
    });
  });

  describe('normalizeLocationName', () => {
    it('uses location if available', () => {
      const location = {
        location: 'London, United Kingdom',
      };

      normalizer.normalizeLocationName(location);
      assert.equal(location.location, 'London, United Kingdom');
    });

    it('converts citynames, countrynames to location', () => {
      const location = {
        citynames: {
          en: 'London',
          es: 'Londres',
        },
        countrynames: {
          en: 'England',
          es: 'Ingleterra',
        },
      };

      normalizer.normalizeLocationName(location, 'es');
      assert.equal(location.location, 'Londres, Ingleterra');
    });

    it('uses locality as a fallback', () => {
      const location = {
        locality: 'Barcelona, Spain',
      };

      normalizer.normalizeLocationName(location, 'es');
      assert.equal(location.location, 'Barcelona, Spain');
    });
  });

  describe('normalizeUserRecord', () => {
    let translator;
    const userRecord = {
      locale: 'zh-tw',
      locations: [],
    };

    before(() => {
      translator = sinon.spy(language => ({ language }));

      sinon.stub(normalizer, 'normalizeAcceptLanguage');
      sinon.stub(normalizer, 'normalizeLanguage');
      sinon.stub(normalizer, 'normalizeLocations');

      normalizer.normalizeUserRecord(userRecord, translator);
    });

    it('calls normalizeAcceptLanguage', () => {
      assert.isTrue(normalizer.normalizeAcceptLanguage.calledOnce);
      assert.equal(normalizer.normalizeAcceptLanguage.args[0][0], userRecord);
    });

    it('calls normalizeLanguage', () => {
      assert.isTrue(normalizer.normalizeLanguage.calledOnce);
      assert.equal(normalizer.normalizeLanguage.args[0][0], userRecord);
      assert.equal(normalizer.normalizeLanguage.args[0][1], translator);
    });

    it('calls normalizeLocations', () => {
      assert.isTrue(normalizer.normalizeLocations.calledOnce);
      assert.equal(normalizer.normalizeLocations.args[0][0], userRecord);
    });
  });

  describe('normalize', () => {
    let translator;
    const userRecords = [
      {
        location: 'dropped, no email',
      },
      {
        email: 'email@email.com',
        location: 'location 1',
      },
      {
        email: 'email2@email.com',
        location: 'location 2',
      },
    ];

    before(() => {
      translator = sinon.spy(language => ({ language }));
      sinon.stub(normalizer, 'normalizeUserRecord');

      normalizer.normalize(userRecords, translator);
    });

    it('calls normalizeUserRecord the expected number of times', () => {
      assert.equal(normalizer.normalizeUserRecord.callCount, 2);
    });
  });
});
