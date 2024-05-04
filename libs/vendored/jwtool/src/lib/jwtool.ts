/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'crypto';
import * as fs from 'fs';
import fetch from 'node-fetch';

import { jwk2pem, pem2jwk } from '@fxa/shared/pem-jwk';

const JWT_STRING = /^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/;

function base64url(str: string | Buffer): string {
  const base64 = Buffer.from(str).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sign(jwt: crypto.JsonWebKey, pem: string): string {
  const header = base64url(JSON.stringify(jwt.header));
  const payload = base64url(JSON.stringify(jwt.payload));
  const signed = header + '.' + payload;
  const s = crypto.createSign('RSA-SHA256');
  s.update(signed);
  const sig = base64url(s.sign(pem));
  return signed + '.' + sig;
}

function decode(str: string) {
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

function verify(str: string, pem: string) {
  const jwt = decode(str);
  if (!jwt) {
    return false;
  }
  const signed = str.split('.', 2).join('.');
  const v = crypto.createVerify('RSA-SHA256');
  v.update(signed);
  return v.verify(pem, jwt.signature) ? jwt.payload : false;
}

function addExtras(obj: any, extras: any) {
  extras = extras || {};
  Object.keys(extras).forEach((key) => {
    obj[key] = extras[key];
  });
  return obj;
}

class JWK {
  protected jwk: crypto.JsonWebKey;
  protected pem: string;

  constructor(jwk: crypto.JsonWebKey, pem?: string) {
    this.jwk = jwk || (pem && pem2jwk(pem));
    this.pem = pem || jwk2pem(jwk);
  }

  static fromPEM(pem: string, extras?: any): PublicJWK | PrivateJWK {
    const obj = pem2jwk(pem, extras);
    if (obj.d) {
      return new PrivateJWK(obj, pem);
    }
    return new PublicJWK(obj, pem);
  }

  static fromObject(obj: any, extras?: any): PublicJWK | PrivateJWK {
    obj = addExtras(obj, extras);
    if (obj.d) {
      return new PrivateJWK(obj);
    }
    return new PublicJWK(obj);
  }

  static fromFile(filename: string, extras?: any): PublicJWK | PrivateJWK {
    const file = fs.readFileSync(filename, 'utf8');
    if (file[0] === '{') {
      return JWK.fromObject(JSON.parse(file), extras);
    }
    return JWK.fromPEM(file, extras);
  }

  toJSON() {
    return this.jwk;
  }
}

export class PrivateJWK extends JWK {
  signSync(data?: any): string {
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

  async sign(data?: any): Promise<string> {
    return Promise.resolve(this.signSync(data));
  }
}

export class PublicJWK extends JWK {
  verifySync(str: string): any {
    return verify(str, this.pem);
  }

  async verify(str: string): Promise<any> {
    return Promise.resolve(this.verifySync(str));
  }
}

export class JWTVerificationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'JWTVerificationError';
    this.message = msg;
  }
}

async function getJwkSet(jku: string) {
  try {
    const res = await fetch(jku, {
      redirect: 'error',
    });
    const body = await res.text();
    const json = JSON.parse(body);
    const set: Record<string, PublicJWK> = {};
    json.keys.forEach((key: any) => {
      set[key.kid] = new PublicJWK(key);
    });
    return set;
  } catch (e) {
    throw new JWTVerificationError('bad jku');
  }
}

export class JWTool {
  trusted: string[];
  jwkSets: Record<string, Record<string, PublicJWK>>;

  constructor(trusted: string[]) {
    this.trusted = trusted;
    this.jwkSets = {};
  }

  static JWK = JWK;
  static PublicJWK = PublicJWK;
  static PrivateJWK = PrivateJWK;
  static JWTVerificationError = JWTVerificationError;
  static unverify = decode;
  static verify = verify;
  static sign = sign;

  async fetch(jku: string, kid: string): Promise<PublicJWK> {
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

  async verify(str: string, defaults?: any): Promise<any> {
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
