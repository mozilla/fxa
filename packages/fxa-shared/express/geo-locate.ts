/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// IP address geolocation

import express from 'express';
import { Logger } from 'mozlog';

export const geolocate =
  (geodb: Function) =>
  (remoteAddress: Function) =>
  (log: Logger) =>
  (request: express.Request) => {
    try {
      // @ts-ignore - locale/lang might not be in standard Request type but injected by middleware
      const locale = request.locale || request.lang;
      return geodb(remoteAddress(request).clientAddress, {
        userLocale: locale,
      });
    } catch (err) {
      log.error('geodb.error', err);
      return {};
    }
  };

export default geolocate;
