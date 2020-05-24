/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const leftpad = require('leftpad');

module.exports = class UserRecordNormalizer {
  /**
   * Normalize the records in `userRecords`. Filters out entries
   * without an `email` field, converts location information to
   * the a format suitable for the user.
   *
   * @param {Object[]} userRecords
   * @param {Object} translator
   */
  normalize(userRecords, translator) {
    return (
      userRecords
        // no email can be sent if the record does not contain an email
        .filter((record) => !!record.email)
        .map((userRecord) => this.normalizeUserRecord(userRecord, translator))
    );
  }

  normalizeUserRecord(userRecord, translator) {
    this.normalizeAcceptLanguage(userRecord);
    this.normalizeLanguage(userRecord, translator);
    this.normalizeLocations(userRecord);

    return userRecord;
  }

  normalizeAcceptLanguage(userRecord) {
    // The Chinese translations were handed to us as "zh" w/o a country
    // specified. We put these translations into "zh-cn", use "zh-cn" for
    // Taiwan as well.
    if (!userRecord.acceptLanguage && userRecord.locale) {
      userRecord.acceptLanguage = userRecord.locale.replace(/zh-tw/gi, 'zh-cn');
    }
  }

  normalizeLanguage(userRecord, translator) {
    const { language } = translator.getTranslator(userRecord.acceptLanguage);
    userRecord.language = language;
  }

  normalizeLocations(userRecord) {
    if (!userRecord.locations) {
      userRecord.locations = [];
    } else {
      userRecord.locations.forEach((location) =>
        this.normalizeLocation(location, userRecord.language)
      );
    }
  }

  normalizeLocation(location, language) {
    this.normalizeLocationTimestamp(location);
    this.normalizeLocationName(location, language);
  }

  normalizeLocationTimestamp(location) {
    const timestamp = new Date(location.timestamp || location.date);
    location.timestamp = this.formatDate(timestamp);
  }

  formatDate(date) {
    return `${date.getUTCFullYear()}-${leftpad(
      date.getUTCMonth(),
      2
    )}-${leftpad(date.getUTCDate(), 2)} @ ${leftpad(
      date.getUTCHours(),
      2
    )}:${leftpad(date.getUTCMinutes(), 2)} UTC`;
  }

  normalizeLocationName(location, language) {
    // first, try to generate a localized locality
    if (!location.location && location.citynames && location.countrynames) {
      const parts = [];

      const localizedCityName = location.citynames[language];
      if (localizedCityName) {
        parts.push(localizedCityName);
      }

      const localizedCountryName = location.countrynames[language];
      if (localizedCountryName) {
        parts.push(localizedCountryName);
      }

      location.location = parts.join(', ');
    }

    // if that can't be done, fall back to the english locality
    if (!location.location && location.locality) {
      location.location = location.locality;
    }
  }
};
