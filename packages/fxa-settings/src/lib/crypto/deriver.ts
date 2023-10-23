/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// `fxaCryptoDeriver` is used in device pairing, so it's not something we
// always need to load in the main js bundle.
export default function importFxaCryptoDeriver() {
  // @ts-ignore
  return import(/* webpackChunkName: "fxaCryptoDeriver" */ 'fxaCryptoDeriver');
}
