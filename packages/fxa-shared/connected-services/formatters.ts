/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { determineLocale, localizeTimestamp } from '@fxa/shared/l10n';
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
  private readonly supportedLanguages: string[];
  private readonly defaultLanguage: string;
  private readonly earliestSaneAccessTime: number;
  private readonly localizeTimestamp: any;

  constructor(
    public readonly config: ClientFormatterConfig,
    private readonly logProvider: () => ILogger
  ) {
    // Important! Resolving the following can be expensive, particularly localizeTimestamp.
    // Hold in private readonly fields!
    this.supportedLanguages = this.config.i18n.supportedLanguages || [];
    this.defaultLanguage = this.config.i18n.defaultLanguage;
    this.earliestSaneAccessTime =
      this.config.lastAccessTimeUpdates.earliestSaneTimestamp;
    this.localizeTimestamp = localizeTimestamp({
      supportedLanguages: this.supportedLanguages,
      defaultLanguage: this.defaultLanguage,
    });
  }

  public formatLocation(
    client: AttachedClient,
    request: IClientFormatterRequest
  ) {
    let language;
    if (!client.location) {
      client.location = {};
    } else {
      const location = client.location;
      try {
        language = determineLocale(
          request.app.acceptLanguage,
          this.supportedLanguages
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
          const territories = require(`cldr-localenames-full/main/${territoriesLang}/territories.json`);
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
    const languages = request.app.acceptLanguage;
    if (client.createdTime) {
      client.createdTimeFormatted = this.localizeTimestamp.format(
        client.createdTime,
        languages
      );
    }
    if (client.lastAccessTime) {
      client.lastAccessTimeFormatted = this.localizeTimestamp.format(
        client.lastAccessTime,
        languages
      );
      if (client.lastAccessTime < this.earliestSaneAccessTime) {
        client.approximateLastAccessTime = this.earliestSaneAccessTime;
        client.approximateLastAccessTimeFormatted =
          this.localizeTimestamp.format(this.earliestSaneAccessTime, languages);
      }
    }
    return client;
  }
}
