/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-env node*/

'use strict';

function settingFor(propertyName) {
  return function (settings) {
    const value = settings[`mocha/${ propertyName}`];
    const mochaSettings = settings.mocha || {};

    return value || mochaSettings[propertyName] || [];
  };
}

module.exports = {
  getAdditionalTestFunctions: settingFor('additionalTestFunctions'),
  additionalSuiteNames: settingFor('additionalSuiteNames'),
  getAdditionalXFunctions: settingFor('additionalXFunctions')
};
