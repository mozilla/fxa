/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { app } = require("./app");
const logging = require("./logging");
const config = require("./config").getProperties();

const { port, host } = config.listen;
logging.info("server.starting", { host, port });
app.listen(port, host, error => {
  if (error) {
    logging.error("server.start.error", { error });
    return;
  }

  logging.info("server.started", { host, port });
});
