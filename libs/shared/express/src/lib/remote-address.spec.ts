/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request } from 'express';
import { remoteAddress as remoteAddressFactory } from './remote-address';

const remoteAddress = remoteAddressFactory(3);
const call = (request: object) => remoteAddress(request as Request);

describe('remote-address', () => {
  it('has the correct interface', () => {
    expect(typeof remoteAddress).toBe('function');
    expect(remoteAddress).toHaveLength(1);
  });

  it('returns correct result with three forwarded addresses', () => {
    const result = call({
      socket: {},
      headers: {
        'x-forwarded-for': ' 194.12.187.0 , 127.0.0.1,wibble,127.0.0.1',
      },
    });
    expect(result).toEqual({
      addresses: ['194.12.187.0', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.0',
    });
  });

  it('returns correct result with two forwarded addresses', () => {
    const result = call({
      socket: {},
      headers: {
        'x-forwarded-for': '63.245.221.32, 127.0.0.1',
      },
    });
    expect(result).toEqual({
      addresses: ['63.245.221.32', '127.0.0.1'],
      clientAddress: '63.245.221.32',
    });
  });

  it('returns correct result with four forwarded addresses', () => {
    const result = call({
      socket: {},
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.1, 127.0.0.1, 127.0.0.1',
      },
    });
    expect(result).toEqual({
      addresses: ['127.0.0.1', '194.12.187.1', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.1',
    });
  });

  it('returns correct result with three forwarded addresses and request.ip', () => {
    const result = call({
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.0, 127.0.0.1',
      },
      ip: '127.0.0.1',
    });
    expect(result).toEqual({
      addresses: ['127.0.0.1', '194.12.187.0', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.0',
    });
  });

  it('returns correct result with three forwarded addresses and request.socket.remoteAddress', () => {
    const result = call({
      socket: {
        remoteAddress: '127.0.0.1',
      },
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.0, 127.0.0.1',
      },
    });
    expect(result).toEqual({
      addresses: ['127.0.0.1', '194.12.187.0', '127.0.0.1', '127.0.0.1'],
      clientAddress: '194.12.187.0',
    });
  });

  it('returns correct result with three forwarded addresses and request.ip and request.socket.remoteAddress', () => {
    const result = call({
      socket: {
        remoteAddress: '127.0.0.1',
      },
      headers: {
        'x-forwarded-for': '127.0.0.1, 194.12.187.0, 127.0.0.1',
      },
      ip: '192.168.1.254',
    });
    expect(result).toEqual({
      addresses: ['127.0.0.1', '194.12.187.0', '127.0.0.1', '192.168.1.254'],
      clientAddress: '194.12.187.0',
    });
  });

  it('ignores bad request.socket.remoteAddress', () => {
    const result = call({
      socket: {
        remoteAddress: 'wibble',
      },
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    });
    expect(result).toEqual({
      addresses: ['127.0.0.1'],
      clientAddress: '127.0.0.1',
    });
  });

  it('ignores bad request.ip', () => {
    const result = call({
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
      ip: 'wibble',
    });
    expect(result).toEqual({
      addresses: ['127.0.0.1'],
      clientAddress: '127.0.0.1',
    });
  });
});
