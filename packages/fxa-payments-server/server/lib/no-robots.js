/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Our page URLs might contain sensitive info like verification tokens.
// We want to avoid them showing up in search engine indexes, even if a user
// accidentally posts e.g. their account verification link into a public
// support website and it gets found by the googlebot.
//
// Disallowing robots entirely from the site does *not* achieve this, per [1].
// Instead we have to:
//
//  * send a 'noindex' meta-tag on every page, so that any links the
//    bot does find will be discarded from its index.
//
//  * allow the bot to access the site, so that it can attempt to crawl
//    any links it finds and discover the 'noindex' directive.
//
//  * send a 'nofollow' meta-tag on every page, so that the bot doesn't
//    get carried away and try to crawl the entire site.
//
// [1] https://support.google.com/webmasters/answer/93710

const htmlOnly = require('./html-middleware');

module.exports = htmlOnly((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex,nofollow');
  next();
});
