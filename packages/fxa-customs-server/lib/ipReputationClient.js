/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');
const Hawk = require('@hapi/hawk');

// Non-CIDR IPv4 validation matching the constraints of the iprepd API.
function isValidIPv4(value) {
  if (typeof value !== 'string') return false;
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  return parts.every(
    (p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255
  );
}

function doRequest(reqOptions, bodyStr) {
  return new Promise((resolve, reject) => {
    // performance.now() gives float ms; Date.now()'s integer ms yields a 0ms
    // total for sub-millisecond localhost round-trips, breaking `total > 0`.
    const start = performance.now();
    const lib = reqOptions.protocol === 'https:' ? https : http;
    const req = lib.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const elapsed = performance.now() - start;
        const raw = Buffer.concat(chunks).toString();
        let body = null;
        try {
          body = raw ? JSON.parse(raw) : null;
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          body,
          timingPhases: { total: elapsed },
        });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    if (reqOptions.timeout) {
      req.setTimeout(reqOptions.timeout, () =>
        req.destroy(new Error('Request timeout'))
      );
    }
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

class IPReputationClient {
  constructor(config) {
    if (!config || !config.serviceUrl || !config.id || !config.key) {
      throw new Error('serviceUrl, id, and key are required');
    }
    this.baseUrl = config.serviceUrl.replace(/\/$/, '');
    this.credentials = { id: config.id, key: config.key, algorithm: 'sha256' };
    this.timeout = config.timeout || 30000;
  }

  _request(method, path, payload) {
    const fullUrl = `${this.baseUrl}${path}`;
    const parsed = new URL(fullUrl);
    const bodyStr = payload !== undefined ? JSON.stringify(payload) : null;

    const hawkOptions = { credentials: this.credentials };
    if (bodyStr) {
      hawkOptions.payload = bodyStr;
      hawkOptions.contentType = 'application/json';
    }

    const { header } = Hawk.client.header(fullUrl, method, hawkOptions);

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
      path: parsed.pathname + (parsed.search || ''),
      method,
      protocol: parsed.protocol,
      timeout: this.timeout,
      headers: { Authorization: header },
    };

    if (bodyStr) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    return doRequest(reqOptions, bodyStr);
  }

  get(ip) {
    if (!isValidIPv4(ip)) return Promise.reject(new Error('Invalid IP.'));
    return this._request('GET', `/type/ip/${ip}`).then((response) => {
      if (response.body) response.body.ip = ip;
      return response;
    });
  }

  remove(ip) {
    if (!isValidIPv4(ip)) return Promise.reject(new Error('Invalid IP.'));
    return this._request('DELETE', `/type/ip/${ip}`);
  }

  update(ip, reputation) {
    if (!isValidIPv4(ip)) return Promise.reject(new Error('Invalid IP.'));
    return this._request('PUT', `/type/ip/${ip}`, {
      reputation,
      object: ip,
      type: 'ip',
    });
  }

  sendViolation(ip, violationType) {
    if (!isValidIPv4(ip)) return Promise.reject(new Error('Invalid IP.'));
    return this._request('PUT', `/violations/type/ip/${ip}`, {
      violation: violationType,
      type: 'ip',
      object: ip,
    });
  }
}

module.exports = IPReputationClient;
