/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Expose window.jQuery and window.$ so that 3rd party libraries compile
 * correctly under Webpack.
 */
window.jQuery = window.$ = require('jquery');
