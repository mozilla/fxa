/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Rebuilds `v1-envelope-fixture.json`, for a deliberate format change only.
 *
 * DO NOT RUN THIS TO FIX A FAILING TEST. `golden-envelope.test.ts` is the only
 * test here that can detect the wire format moving; regenerating deletes the
 * signal along with the failure.
 *
 * Nothing below imports from the module under test — a generator that called
 * `sealKb` would agree with it by construction and pin nothing. The secret
 * material is reused from the existing fixture, so only what the format change
 * moved changes. The HPKE sender key is ephemeral, so the last two fields
 * differ on every run regardless.
 *
 *   node generate-v1-envelope-fixture.mjs > next.json
 *   mv next.json v1-envelope-fixture.json
 */

import {
  AEAD_AES_256_GCM,
  CipherSuite,
  KDF_HKDF_SHA512,
  KEM_DHKEM_P521_HKDF_SHA512,
} from 'hpke';
import { readFileSync } from 'node:fs';

const HPKE_INFO_LABEL = 'fxa-passkey-kb-wrap-v1';
const KEY_WRAP_AAD_LABEL = 'fxa-passkey-skr-wrap-v1';
const KEY_WRAP_KDF_INFO = 'fxa-passkey-skr-wrap-key-v1';

const previous = JSON.parse(
  readFileSync(new URL('./v1-envelope-fixture.json', import.meta.url), 'utf8')
);

const hex = (value) => Uint8Array.from(Buffer.from(value, 'hex'));
const toHex = (bytes) => Buffer.from(bytes).toString('hex');
const ascii = (text) => Uint8Array.from(text, (char) => char.charCodeAt(0));
const cat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, part) => n + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

/** Big-endian two-byte length prefix, matching the module's framing. */
const framed = (bytes) =>
  cat(Uint8Array.of((bytes.length >> 8) & 0xff, bytes.length & 0xff), bytes);

const binding = cat(
  framed(hex(previous.uid)),
  framed(new Uint8Array(Buffer.from(previous.credentialId, 'base64url')))
);

// The skR wrap, under AES-256-GCM with a key derived from prfOut by HKDF.
const ikm = await crypto.subtle.importKey(
  'raw',
  hex(previous.prfOut),
  'HKDF',
  false,
  ['deriveKey']
);
const wrapKey = await crypto.subtle.deriveKey(
  {
    name: 'HKDF',
    hash: 'SHA-512',
    salt: new Uint8Array(0),
    info: ascii(KEY_WRAP_KDF_INFO),
  },
  ikm,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt']
);
const prfWrappedSkR = new Uint8Array(
  await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: hex(previous.keyWrapIv),
      additionalData: cat(ascii(KEY_WRAP_AAD_LABEL), binding),
    },
    wrapKey,
    hex(previous.skRRaw)
  )
);

// The HPKE layer: kB sealed to the stored pkR, with no aad.
const suite = new CipherSuite(
  KEM_DHKEM_P521_HKDF_SHA512,
  KDF_HKDF_SHA512,
  AEAD_AES_256_GCM
);
const { encapsulatedSecret, ciphertext } = await suite.Seal(
  await suite.DeserializePublicKey(hex(previous.pkR)),
  hex(previous.kB),
  { info: cat(ascii(HPKE_INFO_LABEL), binding) }
);

process.stdout.write(
  `${JSON.stringify(
    {
      _comment: previous._comment,
      kB: previous.kB,
      prfOut: previous.prfOut,
      uid: previous.uid,
      credentialId: previous.credentialId,
      binding: toHex(binding),
      keyWrapIv: previous.keyWrapIv,
      pkR: previous.pkR,
      skRRaw: previous.skRRaw,
      prfWrappedSkR: toHex(prfWrappedSkR),
      hpkeEncapsulatedSecret: toHex(encapsulatedSecret),
      hpkeSealedKb: toHex(ciphertext),
    },
    null,
    2
  )}\n`
);
