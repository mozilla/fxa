/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Serve up the favicon. A temporary route to serve the Fx 57 logo to
 * only Fx >= 57 until the logo is publicly released.
 */

const uaParser = require('../user-agent');

function shouldSee57Icon(uaHeader) {
  const agent = uaParser.parse(uaHeader);
  return (agent.ua.family === 'Firefox' && parseInt(agent.ua.major, 10) >= 57) ||
         (agent.ua.family === 'Firefox Mobile' && parseInt(agent.ua.major, 10) >= 57) ||
         (agent.ua.family === 'Firefox iOS' && parseInt(agent.ua.major, 10) >= 10);
}

module.exports = function () {
  return {
    method: 'get',
    path: '/favicon.ico',
    process: (req, res, next) => {
      if (! shouldSee57Icon(req.headers['user-agent'] || '')) {
        req.url = 'favicon-pre57.ico';
      }
      next();
    }
  };
};
