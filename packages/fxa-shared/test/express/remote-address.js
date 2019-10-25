/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const remoteAddress = require('../../express/remote-address')(3);

describe('remote-address', () => {
  it('has the correct interface', () => {
    assert.isFunction(remoteAddress);
    assert.lengthOf(remoteAddress, 1);
  });

  it('returns correct result with three forwarded addresses', () => {
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
  });

  it('returns correct result with two forwarded addresses', () => {
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
  });

  it('returns correct result with four forwarded addresses', () => {
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
  });

  it('returns correct result with three forwarded addresses and request.ip', () => {
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
  });

  it('returns correct result with three forwarded addresses and request.connection.remoteAddress', () => {
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
  });

  it('returns correct result with three forwarded addresses and request.ip and request.connection.remoteAddress', () => {
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
  });

  it('ignores bad request.connection.remoteAddress', () => {
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
  });

  it('ignores bad request.ip', () => {
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
  });
});
