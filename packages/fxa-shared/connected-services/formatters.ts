/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as i18n from 'i18n-abide';

import { localizeTimestamp as fnLocalizeTimestamp } from '../l10n/localizeTimestamp';
import { ILogger } from '../log';
import { AttachedClient } from './models/AttachedClient';
import { ClientFormatterConfig } from './models/ClientFormatterConfig';

export interface IClientFormatterRequest {
  app: {
    acceptLanguage: string;
  };
}

export interface IClientFormatter {
  formatLocation(
    client: AttachedClient,
    request: IClientFormatterRequest
  ): void;
  formatTimestamps(
    client: AttachedClient,
    request: IClientFormatterRequest
  ): void;
}

export class ClientFormatter implements IClientFormatter {
  constructor(
    public readonly config: ClientFormatterConfig,
    private readonly logProvider: () => ILogger
  ) {}

  public formatLocation(
    client: AttachedClient,
    request: IClientFormatterRequest
  ) {
    let language;
    const { supportedLanguages, defaultLanguage } = this.config.i18n;

    if (!client.location) {
      client.location = {};
    } else {
      const location = client.location;
      try {
        const languages = i18n.parseAcceptLanguage(request.app.acceptLanguage);
        language = i18n.bestLanguage(
          languages,
          supportedLanguages || [],
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
        } else if (location.countryCode) {
          const territoriesLang =
            language === 'en-US' ? 'en-US-POSIX' : language;

          const territories = require(`cldr-localenames-full/main/${language}/territories.json`);
          client.location = {
            country:
              territories.main[language].localeDisplayNames.territories[
                location.countryCode
              ],
          };
        }
      } catch (err) {
        const log = this.logProvider();
        log.debug('attached-clients.formatLocation.warning', {
          err: err.message,
          languages: request.app.acceptLanguage,
          language,
          location,
        });
        client.location = {};
      }
    }
    return client;
  }

  public formatTimestamps(
    client: AttachedClient,
    request: IClientFormatterRequest
  ) {
    const { supportedLanguages, defaultLanguage } = this.config.i18n;

    const earliestSaneAccessTime =
      this.config.lastAccessTimeUpdates.earliestSaneTimestamp;

    const languages = request.app.acceptLanguage;

    const localizeTimestamp = fnLocalizeTimestamp({
      supportedLanguages: supportedLanguages,
      defaultLanguage: defaultLanguage,
    });

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
  }
}
