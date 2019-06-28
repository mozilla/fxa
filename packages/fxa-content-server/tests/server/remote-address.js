/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable sorting/sort-object-props */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const remoteAddress = proxyquire(path.resolve('server/lib/remote-address'), {
  './configuration': {
    get(key) {
      if (key === 'clientAddressDepth') {
        return 3;
      }
    },
  },
});

registerSuite('remote-address', {
  'interface is correct': () => {
    assert.isFunction(remoteAddress);
    assert.lengthOf(remoteAddress, 1);
  },

  'returns correct result with three forwarded addresses': () => {
    const result = remoteAddress({
      connection: {},
      headers: {
        'x-forwarded-for': ' 194.12.187.0 , 127.0.0.1,wibble,127.0.0.1',
      },
    });
    assert.deepEqual(result, {
      addresses: ['194.12.187.0', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.0',
    });
  },

  'returns correct result with two forwarded addresses': () => {
    const result = remoteAddress({
      connection: {},
      headers: {
        'x-forwarded-for': '63.245.221.32, 127.0.0.1',
      },
    });
    assert.deepEqual(result, {
      addresses: ['63.245.221.32', '127.0.0.1'],
      clientAddress: '63.245.221.32',
    });
  },

  'returns correct result with four forwarded addresses': () => {
    const result = remoteAddress({
      connection: {},
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.1, 127.0.0.1, 127.0.0.1',
      },
    });
    assert.deepEqual(result, {
      addresses: ['127.0.0.1', '194.12.187.1', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.1',
    });
  },

  'returns correct result with three forwarded addresses and request.ip': () => {
    const result = remoteAddress({
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.0, 127.0.0.1',
      },
      ip: '127.0.0.1',
    });
    assert.deepEqual(result, {
      addresses: ['127.0.0.1', '194.12.187.0', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.0',
    });
  },

  'returns correct result with three forwarded addresses and request.connection.remoteAddress': () => {
    const result = remoteAddress({
      connection: {
        remoteAddress: '127.0.0.1',
      },
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.0, 127.0.0.1',
      },
    });
    assert.deepEqual(result, {
      addresses: ['127.0.0.1', '194.12.187.0', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.0',
    });
  },

  'returns correct result with three forwarded addresses and request.ip and request.connection.remoteAddress': () => {
    const result = remoteAddress({
      connection: {
        remoteAddress: '127.0.0.1',
      },
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.0, 127.0.0.1',
      },
      ip: '192.168.1.254',
    });
    assert.deepEqual(result, {
      addresses: ['127.0.0.1', '194.12.187.0', '127.0.0.1', '192.168.1.254'],
      clientAddress: '194.12.187.0',
    });
  },

  'ignores bad request.connection.remoteAddress': () => {
    const result = remoteAddress({
      connection: {
        remoteAddress: 'wibble',
      },
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    });
    assert.deepEqual(result, {
      addresses: ['127.0.0.1'],
      clientAddress: '127.0.0.1',
    });
  },

  'ignores bad request.ip': () => {
    const result = remoteAddress({
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
      ip: 'wibble',
    });
    assert.deepEqual(result, {
      addresses: ['127.0.0.1'],
      clientAddress: '127.0.0.1',
    });
  },
});
