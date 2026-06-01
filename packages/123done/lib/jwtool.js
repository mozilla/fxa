/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Vendored from the shared FxA lib (@fxa/vendored/jwtool) so 123done stays
// self-contained and deployable without the monorepo.

'use strict';

const crypto = require('crypto');
const fs = require('fs');

const { jwk2pem, pem2jwk } = require('./pem-jwk');

const JWT_STRING = /^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/;

function base64url(str) {
  const base64 = Buffer.from(str).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sign(jwt, pem) {
  const header = base64url(JSON.stringify(jwt.header));
  const payload = base64url(JSON.stringify(jwt.payload));
  const signed = header + '.' + payload;
  const s = crypto.createSign('RSA-SHA256');
  s.update(signed);
  const sig = base64url(s.sign(pem));
  return signed + '.' + sig;
}

function decode(str) {
  const match = JWT_STRING.exec(str);
  if (!match) {
    return null;
  }
  try {
    return {
      header: JSON.parse(Buffer.from(match[1], 'base64').toString()),
      payload: JSON.parse(Buffer.from(match[2], 'base64').toString()),
      signature: Buffer.from(match[3], 'base64'),
    };
  } catch (e) {
    return null;
  }
}

function verify(str, pem) {
  const jwt = decode(str);
  if (!jwt) {
    return false;
  }
  const signed = str.split('.', 2).join('.');
  const v = crypto.createVerify('RSA-SHA256');
  v.update(signed);
  return v.verify(pem, jwt.signature) ? jwt.payload : false;
}

function addExtras(obj, extras) {
  extras = extras || {};
  Object.keys(extras).forEach((key) => {
    obj[key] = extras[key];
  });
  return obj;
}

class JWK {
  constructor(jwk, pem) {
    this.jwk = jwk || (pem && pem2jwk(pem));
    this.pem = pem || jwk2pem(jwk);
  }

  toJSON() {
    return this.jwk;
  }
}

class PrivateJWK extends JWK {
  signSync(data) {
    const payload = data || {};
    payload.iss = this.jwk.iss;
    return sign(
      {
        header: {
          alg: 'RS256',
          jku: this.jwk.jku,
          kid: this.jwk.kid,
        },
        payload: payload,
      },
      this.pem
    );
  }

  async sign(data) {
    return Promise.resolve(this.signSync(data));
  }
}

class PublicJWK extends JWK {
  verifySync(str) {
    return verify(str, this.pem);
  }

  async verify(str) {
    return Promise.resolve(this.verifySync(str));
  }
}

// Attached after the subclasses are defined so the factories can reference them.
JWK.fromPEM = function (pem, extras) {
  const obj = pem2jwk(pem, extras);
  if (obj.d) {
    return new PrivateJWK(obj, pem);
  }
  return new PublicJWK(obj, pem);
};

JWK.fromObject = function (obj, extras) {
  obj = addExtras(obj, extras);
  if (obj.d) {
    return new PrivateJWK(obj);
  }
  return new PublicJWK(obj);
};

JWK.fromFile = function (filename, extras) {
  const file = fs.readFileSync(filename, 'utf8');
  if (file[0] === '{') {
    return JWK.fromObject(JSON.parse(file), extras);
  }
  return JWK.fromPEM(file, extras);
};

class JWTVerificationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'JWTVerificationError';
    this.message = msg;
  }
}

async function getJwkSet(jku) {
  try {
    const res = await fetch(jku, {
      redirect: 'error',
    });
    const body = await res.text();
    const json = JSON.parse(body);
    const set = {};
    json.keys.forEach((key) => {
      set[key.kid] = new PublicJWK(key);
    });
    return set;
  } catch (e) {
    throw new JWTVerificationError('bad jku');
  }
}

class JWTool {
  constructor(trusted) {
    this.trusted = trusted;
    this.jwkSets = {};
  }

  async fetch(jku, kid) {
    let set = this.jwkSets[jku];
    if (set && set[kid]) {
      return set[kid];
    }
    set = await getJwkSet(jku);
    this.jwkSets[jku] = set;
    if (!set[kid]) {
      throw new JWTVerificationError('unknown kid');
    }
    return set[kid];
  }

  async verify(str, defaults) {
    defaults = defaults || {};
    let jwt = decode(str);
    if (!jwt) {
      throw new JWTVerificationError('malformed');
    }

    const jku = jwt.header.jku || defaults.jku;
    const kid = jwt.header.kid || defaults.kid;
    if (!this.trusted.includes(jku)) {
      throw new JWTVerificationError('untrusted');
    }
    const jwk = await this.fetch(jku, kid);
    jwt = await jwk.verify(str);
    if (!jwt) {
      throw new JWTVerificationError('invalid');
    }
    return jwt;
  }
}

JWTool.JWK = JWK;
JWTool.PublicJWK = PublicJWK;
JWTool.PrivateJWK = PrivateJWK;
JWTool.JWTVerificationError = JWTVerificationError;
JWTool.unverify = decode;
JWTool.verify = verify;
JWTool.sign = sign;

module.exports = {
  JWK,
  PublicJWK,
  PrivateJWK,
  JWTVerificationError,
  JWTool,
};
