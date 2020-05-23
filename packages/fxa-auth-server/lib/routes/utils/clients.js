/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const i18n = require('i18n-abide');

module.exports = (log, config) => {
  const earliestSaneAccessTime =
    config.lastAccessTimeUpdates.earliestSaneTimestamp;
  const { supportedLanguages, defaultLanguage } = config.i18n;

  const localizeTimestamp = require('fxa-shared/l10n/localizeTimestamp').localizeTimestamp(
    {
      supportedLanguages,
      defaultLanguage,
    }
  );

  return {
    formatLocation(client, request) {
      let language;
      if (!client.location) {
        client.location = {};
      } else {
        const location = client.location;
        try {
          const languages = i18n.parseAcceptLanguage(
            request.app.acceptLanguage
          );
          language = i18n.bestLanguage(
            languages,
            supportedLanguages,
            defaultLanguage
          );
          // For English, we can leave all the location components intact.
          // For other languages, only return what we can translate
          if (language[0] === 'e' || language[1] === 'n') {
            client.location = {
              city: location.city,
              country: location.country,
              state: location.state,
              stateCode: location.stateCode,
            };
          } else {
            const territories = require(`cldr-localenames-full/main/${language}/territories.json`);
            client.location = {
              country:
                territories.main[language].localeDisplayNames.territories[
                  location.countryCode
                ],
            };
          }
        } catch (err) {
          log.warn('attached-clients.formatLocation.warning', {
            err: err.message,
            languages: request.app.acceptLanguage,
            language,
            location,
          });
          client.location = {};
        }
      }
      return client;
    },

    formatTimestamps(client, request) {
      const languages = request.app.acceptLanguage;
      if (client.createdTime) {
        client.createdTimeFormatted = localizeTimestamp.format(
          client.createdTime,
          languages
        );
      }
      if (client.lastAccessTime) {
        client.lastAccessTimeFormatted = localizeTimestamp.format(
          client.lastAccessTime,
          languages
        );
        if (client.lastAccessTime < earliestSaneAccessTime) {
          client.approximateLastAccessTime = earliestSaneAccessTime;
          client.approximateLastAccessTimeFormatted = localizeTimestamp.format(
            earliestSaneAccessTime,
            languages
          );
        }
      }
      return client;
    },
  };
};
