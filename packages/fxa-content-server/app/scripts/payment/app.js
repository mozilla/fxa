/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
console.log('heya');

import ConfigLoader from '../lib/config-loader';
//import render from './view.jsx';

const configLoader = new ConfigLoader();
//const configLoader = Promise.resolve();
console.log('trying config loader');
configLoader.fetch().then((config) => {
  console.log('got config', config);
  configLoader.useConfig(config);
  render(config);
  console.log('did render');
});
