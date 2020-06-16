/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ConfigLoader from './lib/config-loader';
import AppStart from './lib/app-start';

const configLoader = new ConfigLoader();
configLoader.fetch().then((config) => {
  const appStart = new AppStart({
    config,
  });
  configLoader.useConfig(config);
  appStart.startApp();
});
