/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function Location(locationData, userLocale) {
  'use strict';

  if (locationData.location) {
    this.accuracy = locationData.location.accuracy_radius;
    this.latLong = {
      latitude: locationData.location.latitude,
      longitude: locationData.location.longitude,
    };
    this.timeZone = locationData.location.time_zone;
  }

  this.getLocaleSpecificLocationString = function (locationObject, userLocale) {
    // if we have the user's locale specific name, return that,
    // else return 'en' - english.
    return locationObject.names[userLocale] || locationObject.names['en'];
  };

  if (locationData.city) {
    this.city = this.getLocaleSpecificLocationString(
      locationData.city,
      userLocale
    );
  }

  if (locationData.continent) {
    this.continent = this.getLocaleSpecificLocationString(
      locationData.continent,
      userLocale
    );
  }

  if (locationData.country) {
    this.country = this.getLocaleSpecificLocationString(
      locationData.country,
      userLocale
    );
    this.countryCode = locationData.country.iso_code;
  }

  if (locationData.subdivisions) {
    this.state = this.getLocaleSpecificLocationString(
      locationData.subdivisions[0],
      userLocale
    );
    this.stateCode =
      locationData.subdivisions[0] && locationData.subdivisions[0].iso_code;
  }
}

module.exports = Location;
