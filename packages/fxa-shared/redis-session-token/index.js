/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// To save space in Redis, we serialise session token updates as arrays using
// fixed property indices, thereby not encoding any property names. The order
// of those properties is defined here in REDIS_SESSION_TOKEN_PROPERTIES and
// REDIS_SESSION_TOKEN_LOCATION_PROPERTIES. Note that, to maintain backwards
// compatibility, any future changes to these constants may only append items
// to the end of each array. There's no safe way to change the array index for
// any property, without introducing an explicit migration process for our Redis
// instance.
const REDIS_SESSION_TOKEN_PROPERTIES = [
  'lastAccessTime',
  'location',
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'uaFormFactor',
];

const REDIS_SESSION_TOKEN_LOCATION_INDEX = REDIS_SESSION_TOKEN_PROPERTIES.indexOf(
  'location'
);

const REDIS_SESSION_TOKEN_LOCATION_PROPERTIES = [
  'city',
  'state',
  'stateCode',
  'country',
  'countryCode',
];

// Reduce redis memory usage by not encoding the keys. Store properties
// as fixed indices into arrays instead. Takes an unpacked session tokens
// structure as its argument, returns the packed string.
function packTokensForRedis(tokens) {
  return JSON.stringify(
    Object.keys(tokens).reduce((result, tokenId) => {
      const unpackedToken = tokens[tokenId];

      result[tokenId] = truncatePackedArray(
        REDIS_SESSION_TOKEN_PROPERTIES.map((property, index) => {
          const value = unpackedToken[property];

          if (index === REDIS_SESSION_TOKEN_LOCATION_INDEX && value) {
            return truncatePackedArray(
              REDIS_SESSION_TOKEN_LOCATION_PROPERTIES.map(
                locationProperty => value[locationProperty]
              )
            );
          }

          return unpackedToken[property];
        })
      );

      return result;
    }, {})
  );
}

// Trailing null and undefined don't need to be stored.
function truncatePackedArray(array) {
  for (let i = array.length - 1; i > -1; i--) {
    if (array[i] !== null && array[i] !== undefined) {
      return array.slice(0, i + 1);
    }
  }

  return [];
}

// Sanely unpack both the packed and raw formats from redis. Takes a redis
// result as it's argument (may be null or a stringified mish mash of packed
// and/or unpacked stored tokens), returns the unpacked session tokens
// structure.
function unpackTokensFromRedis(tokens) {
  if (!tokens) {
    return {};
  }

  tokens = JSON.parse(tokens);

  return Object.keys(tokens).reduce((result, tokenId) => {
    const packedToken = tokens[tokenId];

    if (Array.isArray(packedToken)) {
      const unpackedToken = unpackToken(
        packedToken,
        REDIS_SESSION_TOKEN_PROPERTIES
      );

      const location = unpackedToken.location;
      if (Array.isArray(location)) {
        unpackedToken.location = unpackToken(
          location,
          REDIS_SESSION_TOKEN_LOCATION_PROPERTIES
        );
      }

      result[tokenId] = unpackedToken;
    } else {
      result[tokenId] = packedToken;
    }

    return result;
  }, {});
}

function unpackToken(packedToken, properties) {
  return properties.reduce((result, property, index) => {
    result[property] = packedToken[index];
    return result;
  }, {});
}

module.exports = { packTokensForRedis, unpackTokensFromRedis };
