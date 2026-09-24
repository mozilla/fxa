/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The shared config loads *.svg with @svgr/webpack and file-loader, the same as config/webpack.config.js.
module.exports = require('fxa-react/configs/storybooks').customizeWebpackConfig;
