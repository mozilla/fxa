/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require("fs");
const path = require("path");
const express = require("express");
const logging = require("./logging");
const mustache = require("mustache");
const config = require("./config").getProperties();
const Raven = require("raven");

const pageTemplate = fs.readFileSync(
  path.join(__dirname, "templates/index.html"),
  {
    encoding: "UTF-8"
  }
);
mustache.parse(pageTemplate);

function formatDate(d) {
  if (!d) {
    return "-";
  }
  return String(d);
}

const app = express();

app.get("/__lbheartbeat__", (req, res) => {
  res.status(200).json({});
});

app.get("/", (req, res) => {
  // The fxa uid being queried:
  let uid = req.query.uid;
  if (!uid) {
    res
      .type("text")
      .status(400)
      .send("No ?uid given");
    return;
  }
  // This is the user who is asking for the information:
  let requestTicket = req.query.requestTicket || "ticket-unknown";
  // FIXME: use appropriate header
  let authUser = req.headers["X-Unknown-Header"];
  logging.info("info-request", { uid, requestTicket, authUser });
  let view = {
    uid,
    email: "test@example.com",
    emailVerified: true,
    created: formatDate(new Date(Date.now() - 1000000000)),
    locale: "en-US",
    lockedAt: formatDate(null),
    profileChanged: formatDate(new Date(Date.now() - 100000000)),
    keysChanged: formatDate(null),
    devices: [
      {
        name: "laptop",
        type: "desktop",
        created: formatDate(new Date(Date.now() - 1000000000))
      },
      {
        name: "phone",
        type: "android",
        created: formatDate(new Date(Date.now() - 1000000000))
      }
    ],
    os: "linux",
    twoFactorAuth: false,
    subscriptionStatus: "no subscription"
  };
  res.send(mustache.render(pageTemplate, view));
});

if (config.sentryDsn) {
  Raven.config(config.sentryDsn).install();
  app.use(Raven.requestHandler());
}

exports.app = app;
