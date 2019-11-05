/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Utility function to parse the client IP address from request headers.

'use strict';

const joi = require('joi');

const IP_ADDRESS = joi
  .string()
  .ip()
  .required();

module.exports = clientIpAddressDepth => request => {
  let ipAddresses = (request.headers['x-forwarded-for'] || '')
    .split(',')
    .map(address => address.trim());
  ipAddresses.push(request.ip || request.connection.remoteAddress);
  ipAddresses = ipAddresses.filter(
    ipAddress => ! joi.validate(ipAddress, IP_ADDRESS).error
  );

  let clientAddressIndex = ipAddresses.length - clientIpAddressDepth;
  if (clientAddressIndex < 0) {
    clientAddressIndex = 0;
  }

  return {
    addresses: ipAddresses,
    clientAddress: ipAddresses[clientAddressIndex],
  };
};
