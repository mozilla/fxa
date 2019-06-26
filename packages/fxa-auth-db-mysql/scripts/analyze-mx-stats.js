#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Usage:

 NODE_ENV=prod node scripts/analyze-mx-stats.js

 This script is used to analyze the breakdown of popular MX domain records
 in our accounts data.  It takes a random sample of email addresses from the
 `accounts` table, performs a DNS lookup to determine their MX servers(s), and
 prints a report of the most popular MX servers.

 /*/

var dns = require('dns');
var P = require('../lib/promise');

var log = {
  info: function() {},
};
var DB = require('../lib/db/mysql')(log, require('../db-server').errors);
var config = require('../config');

var resolve = P.promisify(dns.resolve);

DB.connect(config)
  .then(function(db) {
    var query = 'SELECT normalizedEmail FROM accounts ';
    // Ignore known test accounts.
    query += "WHERE normalizedEmail NOT LIKE '%@restmail.net' ";
    // Only sample emails we know to be valid.
    query += 'AND emailVerified ';
    // Simulate random ordering, by walking the uid primary key.
    // By default MySQL will walk them in order using the email index.
    query += 'ORDER BY uid ';
    query += 'LIMIT 10000';
    return db.read(query).then(function(rows) {
      var emails = rows.map(function(row) {
        return row.normalizedEmail;
      });
      return db.close().then(function() {
        return emails;
      });
    });
  })
  .then(function(emails) {
    // We want to count two distinct things:
    //
    //  * the total number of emails using that domain as MX
    //  * the number of emails using that domain as MX, but we
    //    couldn't tell that just by looking at the email as a string.
    //

    var countMx = {};
    var countMxDynamic = {};

    return P.each(emails, function(email) {
      var host = getEmailHostPart(email);

      // Get all unique domains that provide MX for that host.
      // If no MX record, use the host itself.
      var addrs = resolve(host, 'MX').catch(function(err) {
        if (
          ['ENODATA', 'ENOTFOUND', 'ESERVFAIL'].indexOf(err.cause.code) !== -1
        ) {
          return [{ exchange: host }];
        }
        throw err;
      });

      var seen = {};
      return P.each(addrs, function(addr) {
        var mxDomain = normalizeMxDomain(addr.exchange);
        seen[mxDomain] = true;
      }).then(function() {
        // Increment the counts for each unique MX domain.
        Object.keys(seen).forEach(function(mxDomain) {
          if (!countMx[mxDomain]) {
            countMx[mxDomain] = 0;
            countMxDynamic[mxDomain] = 0;
          }
          countMx[mxDomain] += 1;
          if (!canStaticallyDetermineMx(host, mxDomain)) {
            countMxDynamic[mxDomain] += 1;
          }
        });
      });
    }).then(function() {
      // Now we can create a percentage breakdown of the most popular.
      var topMxDomains = Object.keys(countMx);
      topMxDomains.sort(function(a, b) {
        return countMx[b] - countMx[a];
      });

      process.stdout.write('\nOf ' + emails.length + ' email addresses:\n\n');
      topMxDomains.slice(0, 20).forEach(function(mxDomain) {
        var count = countMx[mxDomain];
        var countDynamic = countMxDynamic[mxDomain] || 0;
        if (percentage(count, emails.length) > 1) {
          process.stdout.write(
            percentage(count, emails.length) +
              '% of emails use ' +
              mxDomain +
              '\n'
          );
          process.stdout.write(
            '  including ' +
              percentage(countDynamic, emails.length) +
              '% requiring'
          );
          process.stdout.write(
            ' dynamic lookup to resolve to ' + mxDomain + '\n\n'
          );
        }
      });
    });
  });

function getEmailHostPart(email) {
  var emailHostRegex = /^.+@(.+)$/;
  return emailHostRegex.exec(email)[1].toLowerCase();
}

function normalizeMxDomain(mxDomain) {
  mxDomain = mxDomain.toLowerCase();
  // Try to pick out just the main part of the domain,
  // allowing for things like mail1.something.com.au -> something.com.au.
  // This isn't always right but it's pretty close.
  var mainDomainRegex = /[^.]+\.([^.]{1,3}\.)?[^.]+$/;
  var m = mainDomainRegex.exec(mxDomain);
  if (m) {
    mxDomain = m[0];
  }
  return mxDomain;
}

function endsWith(haystack, needle) {
  var idx = haystack.lastIndexOf(needle);
  if (idx < 0) {
    return false;
  }
  return idx === haystack.length - needle.length;
}

function percentage(part, whole) {
  return Math.round((part / whole) * 1000) / 10;
}

function canStaticallyDetermineMx(host, mxDomain) {
  if (host === mxDomain) {
    return true;
  }
  if (endsWith(host, '.' + mxDomain)) {
    return true;
  }
  // Some simple static rules we can apply for common domains.
  if (host === 'gmail.com' && mxDomain === 'google.com') {
    return true;
  }
  if (host === 'yahoo.com' && mxDomain === 'yahoodns.net') {
    return true;
  }
  if (host === 'fastmail.fm' && mxDomain === 'messagingengine.com') {
    return true;
  }
  return false;
}
