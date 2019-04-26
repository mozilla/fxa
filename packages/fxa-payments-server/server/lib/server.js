/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = () => {
  const path = require('path');

  // setup version first for the rest of the modules
  const logger = require('./logging/log')('server.main');
  const version = require('./version');
  const config = require('../config');

  logger.info(`source set to: ${version.source}`);
  logger.info(`version set to: ${version.version}`);
  logger.info(`commit hash set to: ${version.commit}`);

  const express = require('express');
  const helmet = require('helmet');
  const serveStatic = require('serve-static');

  const app = express();

  app.disable('x-powered-by');

  app.use(
    // Side effect - Adds default_fxa and dev_fxa to express.logger formats
    require('./logging/route-logging')(),

    helmet.frameguard({
      action: 'deny'
    }),

    helmet.xssFilter(),

    helmet.hsts({
      force: true,
      includeSubDomains: true,
      maxAge: config.get('hstsMaxAge')
    }),

    helmet.noSniff(),

    // TODO CSP
    require('./no-robots')
  );

  if (isCorsRequired()) {
    // JS, CSS and web font resources served from a CDN
    // will be ignored unless CORS headers are present.
    const corsOptions = {
      origin: config.get('public_url')
    };

    app.route(/\.(js|css|woff|woff2|eot|ttf)$/)
      .get(require('cors')(corsOptions));
  }

  const STATIC_DIRECTORY =
    path.join(__dirname, '..', '..', config.get('staticResources.directory'));

  app.use(serveStatic(STATIC_DIRECTORY, {
    maxAge: config.get('staticResources.maxAge')
  }));

  // TODO routes

  // it's a four-oh-four not found.
  app.use(require('./404'));


  function listen () {
    const port = config.get('listen.port');
    logger.info('server.starting', { port });
    app.listen(port, '0.0.0.0', (error) => {
      if (error) {
        logger.error('server.start.error', { error });
        return;
      }

      logger.info('server.started', { port });
    });

  }

  return {
    listen
  };

  function isCorsRequired() {
    return config.get('staticResources.url') !== config.get('listen.publicUrl');
  }

};

