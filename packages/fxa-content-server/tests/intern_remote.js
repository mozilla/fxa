/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  'use strict';

  // override the main config file and adjust it to suit Sauce Labs
  intern.useSauceConnect = true;
  intern.webdriver.port = 4445;

  intern.environments = [
    // XXX these two browsers currently aren't working on SauceLabs
    //{ browserName: 'iphone', version: '6.0', platform: 'OS X 10.8' },
    //{ browserName: 'android', version: '4.0', platform: 'Linux' },

    // TODO No IE support yet
    //{ browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
    //{ browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
    //{ browserName: 'internet explorer', version: '9', platform: 'Windows 7' },
    //{ browserName: 'internet explorer', version: '8', platform: 'Windows XP' },

    { browserName: 'firefox', version: '25', platform: [ 'OS X 10.6'/*, 'Windows 7' */] },
//    { browserName: 'firefox', version: '24', platform: 'Linux' },
//   { browserName: 'chrome', version: '', platform: [ 'Linux', 'OS X 10.6', 'Windows 7' ] },
//    { browserName: 'safari', version: '6', platform: 'OS X 10.8' }
  ];

  return intern;
});
