/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { hexToUint8, uint8ToBase64, uint8ToHex } from './utils';

const encoder = () => new TextEncoder();
const NAMESPACE = 'identity.mozilla.com/picl/v1/';

export async function deriveHawkCredentials(token: string, context: string) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    hexToUint8(token),
    'HKDF',
    false,
    ['deriveBits']
  );
  const keyMaterial = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt: new Uint8Array(0),
      // @ts-ignore
      info: encoder().encode(`${NAMESPACE}${context}`),
      hash: 'SHA-256',
    },
    baseKey,
    32 * 3 * 8
  );
  const id = new Uint8Array(keyMaterial, 0, 32);
  const authKey = new Uint8Array(keyMaterial, 32, 32);
  const bundleKey = new Uint8Array(keyMaterial, 64);

  return {
    id: uint8ToHex(id),
    key: authKey,
    bundleKey: uint8ToHex(bundleKey),
  };
}

// The following is adapted from https://github.com/hapijs/hawk/blob/master/lib/browser.js

/*
 HTTP Hawk Authentication Scheme
 Copyright (c) 2012-2013, Eran Hammer <eran@hueniverse.com>
 MIT Licensed
 */

function parseUri(input: string) {
  const parts = input.match(
    /^([^:]+)\:\/\/(?:[^@/]*@)?([^\/:]+)(?:\:(\d+))?([^#]*)(?:#.*)?$/
  );
  if (!parts) {
    return { host: '', port: '', resource: '' };
  }

  const scheme = parts[1].toLowerCase();
  const uri = {
    host: parts[2],
    port:
      parts[3] || (scheme === 'http' ? '80' : scheme === 'https' ? '443' : ''),
    resource: parts[4],
  };

  return uri;
}

function randomString(size: number) {
  const randomSource =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const len = randomSource.length;

  const result: string[] = [];
  for (let i = 0; i < size; ++i) {
    result[i] = randomSource[Math.floor(Math.random() * len)];
  }

  return result.join('');
}

function generateNormalizedString(type: string, options: any) {
  let normalized =
    'hawk.1.' +
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
    normalized += options.ext.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
  }

  normalized += '\n';

  if (options.app) {
    normalized += options.app + '\n' + (options.dlg || '') + '\n';
  }

  return normalized;
}

async function calculatePayloadHash(
  payload: string = '',
  contentType: string = ''
) {
  const data = encoder().encode(`hawk.1.payload\n${contentType}\n${payload}\n`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return uint8ToBase64(new Uint8Array(hash));
}

async function calculateMac(type: string, credentials: any, options: any) {
  const normalized = generateNormalizedString(type, options);
  const key = await crypto.subtle.importKey(
    'raw',
    credentials.key,
    {
      name: 'HMAC',
      hash: 'SHA-256',
      length: 256,
    },
    true,
    ['sign']
  );
  const hmac = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder().encode(normalized)
  );
  return uint8ToBase64(new Uint8Array(hmac));
}

export async function hawkHeader(
  method: string,
  uri: string,
  options: {
    credentials: {
      id: string;
      key: Uint8Array;
    };
    payload?: string;
    timestamp?: number;
    nonce?: string;
    contentType?: string;
    localtimeOffsetMsec?: number;
  }
) {
  const timestamp =
    options.timestamp ||
    Math.floor((Date.now() + (options.localtimeOffsetMsec || 0)) / 1000);
  const parsedUri = parseUri(uri);
  const hash = await calculatePayloadHash(options.payload, options.contentType);
  const artifacts = {
    ts: timestamp,
    nonce: options.nonce || randomString(6),
    method,
    resource: parsedUri.resource,
    host: parsedUri.host,
    port: parsedUri.port,
    hash,
  };
  const mac = await calculateMac('header', options.credentials, artifacts);
  const header =
    'Hawk id="' +
    options.credentials.id +
    '", ts="' +
    artifacts.ts +
    '", nonce="' +
    artifacts.nonce +
    (artifacts.hash ? '", hash="' + artifacts.hash : '') +
    '", mac="' +
    mac +
    '"';
  return header;
}

export async function header(
  method: string,
  uri: string,
  token: string,
  kind: string,
  options: {
    payload?: string;
    timestamp?: number;
    nonce?: string;
    contentType?: string;
    localtimeOffsetMsec?: number;
  }
) {
  const credentials = await deriveHawkCredentials(token, kind);
  const authorization = await hawkHeader(method, uri, {
    credentials,
    ...options,
  });
  return new Headers({ authorization });
}
