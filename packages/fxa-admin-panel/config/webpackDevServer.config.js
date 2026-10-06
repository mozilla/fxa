/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (publicPath) {
  const port = Number(process.env.PORT) || 8092;

  return {
    allowedHosts: 'all',
    // The admin server proxies these assets from its own origin.
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: { disableDotRule: true },
    host: process.env.HOST || '0.0.0.0',
    port,
    devMiddleware: {
      publicPath: new URL(publicPath, 'http://localhost').pathname,
    },
    client: {
      // The page loads from the admin proxy, so its origin names the wrong port.
      webSocketURL: { port },
      overlay: {
        errors: true,
        warnings: false,
        // The panel renders its own error states; the overlay hides them.
        runtimeErrors: false,
      },
    },
  };
};
