/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require("path");

module.exports = {
  entry: require.resolve("./src/index.ts"),
  output: {
    filename: "fxa-client.js",
    path: path.resolve(__dirname, "dist"),
    library: "FxAccountClient",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
  }
};
