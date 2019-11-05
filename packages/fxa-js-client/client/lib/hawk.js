/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sjcl = require('sjcl');

/*
 HTTP Hawk Authentication Scheme
 Copyright (c) 2012-2013, Eran Hammer <eran@hueniverse.com>
 MIT Licensed
 */

// Declare namespace

var hawk = {};

hawk.client = {
  // Generate an Authorization header for a given request

  /*
   uri: 'http://example.com/resource?a=b'
   method: HTTP verb (e.g. 'GET', 'POST')
   options: {

   // Required

   credentials: {
   id: 'dh37fgj492je',
   key: 'aoijedoaijsdlaksjdl',
   algorithm: 'sha256'                                 // 'sha1', 'sha256'
   },

   // Optional

   ext: 'application-specific',                        // Application specific data sent via the ext attribute
   timestamp: Date.now() / 1000,                       // A pre-calculated timestamp in seconds
   nonce: '2334f34f',                                  // A pre-generated nonce
   localtimeOffsetMsec: 400,                           // Time offset to sync with server time (ignored if timestamp provided)
   payload: '{"some":"payload"}',                      // UTF-8 encoded string for body hash generation (ignored if hash provided)
   contentType: 'application/json',                    // Payload content-type (ignored if hash provided)
   hash: 'U4MKKSmiVxk37JCCrAVIjV=',                    // Pre-calculated payload hash
   app: '24s23423f34dx',                               // Oz application id
   dlg: '234sz34tww3sd'                                // Oz delegated-by application id
   }
   */
  // eslint-disable-next-line complexity
  header: function(uri, method, options) {
    /*eslint complexity: [2, 21] */
    var result = {
      field: '',
      artifacts: {},
    };

    // Validate inputs

    if (
      ! uri ||
      (typeof uri !== 'string' && typeof uri !== 'object') ||
      ! method ||
      typeof method !== 'string' ||
      ! options ||
      typeof options !== 'object'
    ) {
      result.err = 'Invalid argument type';
      return result;
    }

    // Application time

    var timestamp =
      options.timestamp ||
      Math.floor(
        (hawk.utils.now() + (options.localtimeOffsetMsec || 0)) / 1000
      );

    // Validate credentials

    var credentials = options.credentials;
    if (
      ! credentials ||
      ! credentials.id ||
      ! credentials.key ||
      ! credentials.algorithm
    ) {
      result.err = 'Invalid credential object';
      return result;
    }

    if (
      hawk.utils.baseIndexOf(hawk.crypto.algorithms, credentials.algorithm) ===
      -1
    ) {
      result.err = 'Unknown algorithm';
      return result;
    }

    // Parse URI

    if (typeof uri === 'string') {
      uri = hawk.utils.parseUri(uri);
    }

    // Calculate signature

    var artifacts = {
      ts: timestamp,
      nonce: options.nonce || hawk.utils.randomString(6),
      method: method,
      resource: uri.relative,
      host: uri.hostname,
      port: uri.port,
      hash: options.hash,
      ext: options.ext,
      app: options.app,
      dlg: options.dlg,
    };

    result.artifacts = artifacts;

    // Calculate payload hash

    if (! artifacts.hash && options.hasOwnProperty('payload')) {
      artifacts.hash = hawk.crypto.calculatePayloadHash(
        options.payload,
        credentials.algorithm,
        options.contentType
      );
    }

    var mac = hawk.crypto.calculateMac('header', credentials, artifacts);

    // Construct header

    var hasExt =
      artifacts.ext !== null &&
      artifacts.ext !== undefined &&
      artifacts.ext !== ''; // Other falsey values allowed
    var header =
      'Hawk id="' +
      credentials.id +
      '", ts="' +
      artifacts.ts +
      '", nonce="' +
      artifacts.nonce +
      (artifacts.hash ? '", hash="' + artifacts.hash : '') +
      (hasExt
        ? '", ext="' + hawk.utils.escapeHeaderAttribute(artifacts.ext)
        : '') +
      '", mac="' +
      mac +
      '"';

    if (artifacts.app) {
      header +=
        ', app="' +
        artifacts.app +
        (artifacts.dlg ? '", dlg="' + artifacts.dlg : '') +
        '"';
    }

    result.field = header;

    return result;
  },

  // Validate server response

  /*
   request:    object created via 'new XMLHttpRequest()' after response received
   artifacts:  object recieved from header().artifacts
   options: {
   payload:    optional payload received
   required:   specifies if a Server-Authorization header is required. Defaults to 'false'
   }
   */

  authenticate: function(request, credentials, artifacts, options) {
    options = options || {};

    if (request.getResponseHeader('www-authenticate')) {
      // Parse HTTP WWW-Authenticate header

      var attrsAuth = hawk.utils.parseAuthorizationHeader(
        request.getResponseHeader('www-authenticate'),
        ['ts', 'tsm', 'error']
      );
      if (! attrsAuth) {
        return false;
      }

      if (attrsAuth.ts) {
        var tsm = hawk.crypto.calculateTsMac(attrsAuth.ts, credentials);
        if (tsm !== attrsAuth.tsm) {
          return false;
        }

        hawk.utils.setNtpOffset(
          attrsAuth.ts - Math.floor(new Date().getTime() / 1000)
        ); // Keep offset at 1 second precision
      }
    }

    // Parse HTTP Server-Authorization header

    if (
      ! request.getResponseHeader('server-authorization') &&
      ! options.required
    ) {
      return true;
    }

    var attributes = hawk.utils.parseAuthorizationHeader(
      request.getResponseHeader('server-authorization'),
      ['mac', 'ext', 'hash']
    );
    if (! attributes) {
      return false;
    }

    var modArtifacts = {
      ts: artifacts.ts,
      nonce: artifacts.nonce,
      method: artifacts.method,
      resource: artifacts.resource,
      host: artifacts.host,
      port: artifacts.port,
      hash: attributes.hash,
      ext: attributes.ext,
      app: artifacts.app,
      dlg: artifacts.dlg,
    };

    var mac = hawk.crypto.calculateMac('response', credentials, modArtifacts);
    if (mac !== attributes.mac) {
      return false;
    }

    if (! options.hasOwnProperty('payload')) {
      return true;
    }

    if (! attributes.hash) {
      return false;
    }

    var calculatedHash = hawk.crypto.calculatePayloadHash(
      options.payload,
      credentials.algorithm,
      request.getResponseHeader('content-type')
    );
    return calculatedHash === attributes.hash;
  },

  message: function(host, port, message, options) {
    // Validate inputs

    if (
      ! host ||
      typeof host !== 'string' ||
      ! port ||
      typeof port !== 'number' ||
      message === null ||
      message === undefined ||
      typeof message !== 'string' ||
      ! options ||
      typeof options !== 'object'
    ) {
      return null;
    }

    // Application time

    var timestamp =
      options.timestamp ||
      Math.floor(
        (hawk.utils.now() + (options.localtimeOffsetMsec || 0)) / 1000
      );

    // Validate credentials

    var credentials = options.credentials;
    if (
      ! credentials ||
      ! credentials.id ||
      ! credentials.key ||
      ! credentials.algorithm
    ) {
      // Invalid credential object
      return null;
    }

    if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
      return null;
    }

    // Calculate signature

    var artifacts = {
      ts: timestamp,
      nonce: options.nonce || hawk.utils.randomString(6),
      host: host,
      port: port,
      hash: hawk.crypto.calculatePayloadHash(message, credentials.algorithm),
    };

    // Construct authorization

    var result = {
      id: credentials.id,
      ts: artifacts.ts,
      nonce: artifacts.nonce,
      hash: artifacts.hash,
      mac: hawk.crypto.calculateMac('message', credentials, artifacts),
    };

    return result;
  },

  authenticateTimestamp: function(message, credentials, updateClock) {
    // updateClock defaults to true

    var tsm = hawk.crypto.calculateTsMac(message.ts, credentials);
    if (tsm !== message.tsm) {
      return false;
    }

    if (updateClock !== false) {
      hawk.utils.setNtpOffset(
        message.ts - Math.floor(new Date().getTime() / 1000)
      ); // Keep offset at 1 second precision
    }

    return true;
  },
};

hawk.crypto = {
  headerVersion: '1',

  algorithms: ['sha1', 'sha256'],

  calculateMac: function(type, credentials, options) {
    var normalized = hawk.crypto.generateNormalizedString(type, options);
    var hmac = new sjcl.misc.hmac(credentials.key, sjcl.hash.sha256);
    hmac.update(normalized);

    return sjcl.codec.base64.fromBits(hmac.digest());
  },

  generateNormalizedString: function(type, options) {
    var normalized =
      'hawk.' +
      hawk.crypto.headerVersion +
      '.' +
      type +
      '\n' +
      options.ts +
      '\n' +
      options.nonce +
      '\n' +
      (options.method || '').toUpperCase() +
      '\n' +
      (options.resource || '') +
      '\n' +
      options.host.toLowerCase() +
      '\n' +
      options.port +
      '\n' +
      (options.hash || '') +
      '\n';

    if (options.ext) {
      normalized += options.ext.replace('\\', '\\\\').replace('\n', '\\n');
    }

    normalized += '\n';

    if (options.app) {
      normalized += options.app + '\n' + (options.dlg || '') + '\n';
    }

    return normalized;
  },

  calculatePayloadHash: function(payload, algorithm, contentType) {
    var hash = new sjcl.hash.sha256();
    hash
      .update('hawk.' + hawk.crypto.headerVersion + '.payload\n')
      .update(hawk.utils.parseContentType(contentType) + '\n')
      .update(payload || '')
      .update('\n');

    return sjcl.codec.base64.fromBits(hash.finalize());
  },

  calculateTsMac: function(ts, credentials) {
    var hmac = new sjcl.misc.hmac(credentials.key, sjcl.hash.sha256);
    hmac.update('hawk.' + hawk.crypto.headerVersion + '.ts\n' + ts + '\n');

    return sjcl.codec.base64.fromBits(hmac.digest());
  },
};

hawk.utils = {
  storage: {
    // localStorage compatible interface
    _cache: {},
    setItem: function(key, value) {
      hawk.utils.storage._cache[key] = value;
    },
    getItem: function(key) {
      return hawk.utils.storage._cache[key];
    },
  },

  setStorage: function(storage) {
    var ntpOffset = hawk.utils.getNtpOffset() || 0;
    hawk.utils.storage = storage;
    hawk.utils.setNtpOffset(ntpOffset);
  },

  setNtpOffset: function(offset) {
    try {
      hawk.utils.storage.setItem('hawk_ntp_offset', offset);
    } catch (err) {
      console.error('[hawk] could not write to storage.');
      console.error(err);
    }
  },

  getNtpOffset: function() {
    return parseInt(hawk.utils.storage.getItem('hawk_ntp_offset') || '0', 10);
  },

  now: function() {
    return new Date().getTime() + hawk.utils.getNtpOffset();
  },

  escapeHeaderAttribute: function(attribute) {
    return attribute.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  },

  parseContentType: function(header) {
    if (! header) {
      return '';
    }

    return header
      .split(';')[0]
      .replace(/^\s+|\s+$/g, '')
      .toLowerCase();
  },

  parseAuthorizationHeader: function(header, keys) {
    if (! header) {
      return null;
    }

    var headerParts = header.match(/^(\w+)(?:\s+(.*))?$/); // Header: scheme[ something]
    if (! headerParts) {
      return null;
    }

    var scheme = headerParts[1];
    if (scheme.toLowerCase() !== 'hawk') {
      return null;
    }

    var attributesString = headerParts[2];
    if (! attributesString) {
      return null;
    }

    var attributes = {};
    var verify = attributesString.replace(
      /(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g,
      function($0, $1, $2) {
        // Check valid attribute names

        if (keys.indexOf($1) === -1) {
          return;
        }

        // Allowed attribute value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9

        if (
          $2.match(
            /^[ \w!#$%&'()*+,\-./:;<=>?@[\]^`{|}~]+$/
          ) === null
        ) {
          return;
        }

        // Check for duplicates

        if (attributes.hasOwnProperty($1)) {
          return;
        }

        attributes[$1] = $2;
        return '';
      }
    );

    if (verify !== '') {
      return null;
    }

    return attributes;
  },

  randomString: function(size) {
    var randomSource =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var len = randomSource.length;

    var result = [];
    for (var i = 0; i < size; ++i) {
      result[i] = randomSource[Math.floor(Math.random() * len)];
    }

    return result.join('');
  },

  baseIndexOf: function(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
      length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  },

  parseUri: function(input) {
    // Based on: parseURI 1.2.2
    // http://blog.stevenlevithan.com/archives/parseuri
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License

    var keys = [
      'source',
      'protocol',
      'authority',
      'userInfo',
      'user',
      'password',
      'hostname',
      'port',
      'resource',
      'relative',
      'pathname',
      'directory',
      'file',
      'query',
      'fragment',
    ];

    var uriRegex = /^(?:([^:/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?))?(((((?:[^?#/]*\/)*)([^?#]*))(?:\?([^#]*))?)(?:#(.*))?)/;
    var uriByNumber = uriRegex.exec(input);
    var uri = {};

    var i = 15;
    while (i--) {
      uri[keys[i]] = uriByNumber[i] || '';
    }

    if (uri.port === null || uri.port === '') {
      uri.port =
        uri.protocol.toLowerCase() === 'http'
          ? '80'
          : uri.protocol.toLowerCase() === 'https'
            ? '443'
            : '';
    }

    return uri;
  },
};

module.exports = hawk;
