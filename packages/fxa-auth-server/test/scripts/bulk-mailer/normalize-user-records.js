/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import sinon from 'sinon';
import UserRecordNormalizer from '../../../scripts/bulk-mailer/normalize-user-records';

describe('normalize-user-records', () => {
  let normalizer;

  before(() => {
    normalizer = new UserRecordNormalizer();
  });

  describe('normalizeLanguage', () => {
    it('updates the record language to what parseAcceptLanguage says is best', () => {
      const userRecord = { acceptLanguage: 'es,de' };
      normalizer.normalizeLanguage(userRecord);
      assert.equal(userRecord.language, 'es');
    });
  });

  describe('normalizeLocationTimestamp', () => {
    const date = new Date('2017-01-02T03:04Z');

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
      translator = sinon.spy((language) => ({ language }));

      sinon.stub(normalizer, 'normalizeLanguage');
      sinon.stub(normalizer, 'normalizeLocations');

      normalizer.normalizeUserRecord(userRecord, translator);
    });

    it('calls normalizeLanguage', () => {
      assert.isTrue(normalizer.normalizeLanguage.calledOnce);
      assert.equal(normalizer.normalizeLanguage.args[0][0], userRecord);
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
        primaryEmail: 'email@email.com',
        location: 'location 1',
      },
      {
        primaryEmail: 'email2@email.com',
        location: 'location 2',
      },
    ];

    before(() => {
      translator = sinon.spy((language) => ({ language }));
      sinon.stub(normalizer, 'normalizeUserRecord');

      normalizer.normalize(userRecords, translator);
    });

    it('calls normalizeUserRecord the expected number of times', () => {
      assert.equal(normalizer.normalizeUserRecord.callCount, 2);
    });
  });
});
