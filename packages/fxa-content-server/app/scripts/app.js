/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'core-js';
import * as tracing from 'fxa-shared/tracing/browser-tracing';
import ConfigLoader from './lib/config-loader';
import AppStart from './lib/app-start';

const configLoader = new ConfigLoader();
configLoader.fetch().then((config) => {
  if (config.tracing) {
    const flowId = $ && $(document.body).data('flowId'); // eslint-disable-line no-undef
    tracing.init(config.tracing, flowId, console);
  }

  const appStart = new AppStart({
    config,
  });
  configLoader.useConfig(config);
  appStart.startApp();
});
