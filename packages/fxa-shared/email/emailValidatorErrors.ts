/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const dns = require('dns');

export const NotFoundErrorCodes = [dns.NODATA, dns.NOTFOUND];

export const WrappedErrorCodes = [
  dns.FORMERR,
  dns.SERVFAIL,
  dns.NOTIMP,
  dns.REFUSED,
  dns.BADQUERY,
  dns.BADNAME,
  dns.BADFAMILY,
  dns.BADRESP,
  dns.CONNREFUSED,
  dns.TIMEOUT,
  dns.EOF,
  dns.FILE,
  dns.NOMEM,
  dns.DESTRUCTION,
  dns.BADSTR,
  dns.BADFLAGS,
  dns.NONAME,
  dns.BADHINTS,
  dns.NOTINITIALIZED,
  dns.LOADIPHLPAPI,
  dns.ADDRGETNETWORKPARAMS,
  dns.CANCELLED,
];
