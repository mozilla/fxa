/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Derive relier-specific encryption keys from account master keys.
 */

'use strict';

define([
  'sjcl',
  'p-promise',
  'lib/hkdf',
  'lib/base64url',
  'lib/constants'
], function (sjcl, p, hkdf, base64url, Constants) {

  var KEY_CLASS_TAG_A = 'kAr';
  var KEY_CLASS_TAG_B = 'kBr';

  /**
   * Given the account master keys, the user id and the relier id, generate
   * the matching relier-specific derived class-A and class-B keys.
   *
   * Input arguments:
   *    keys:       object with properties 'kA' and 'kB' giving the account
   *                keys as hex strings.
   *    uid:        string identifying the user who owns the keys.
   *    clientId:   string identifying the relier for whom keys should
   *                be derived.
   *
   * Output:
   *    A promise that will resolve with an object having 'kAr' and 'kBr'
   *    properties, giving relier-specific keys derived from 'kA' and 'kB'
   *    respectively.  Each key is represented as a JWK object.
   */
  function deriveRelierKeys(keys, uid, clientId) {
    var relierKeys = {};
    return p()
      .then(function () {
        if (! keys.kA) {
          throw new Error('Cant derive relier keys: missing kA');
        }
        if (! keys.kB) {
          throw new Error('Cant derive relier keys: missing kB');
        }
        if (! uid) {
          throw new Error('Cant derive relier keys: missing uid');
        }
        if (! clientId) {
          throw new Error('Cant derive relier keys: missing rid');
        }
        return generateDerivedKey({
          inputKey: keys.kA,
          keyClassTag: KEY_CLASS_TAG_A,
          uid: uid,
          clientId: clientId
        });
      }).then(function (kAr) {
        relierKeys[KEY_CLASS_TAG_A] = kAr;
        return generateDerivedKey({
          inputKey: keys.kB,
          keyClassTag: KEY_CLASS_TAG_B,
          uid: uid,
          clientId: clientId
        });
      }).then(function (kBr) {
        relierKeys[KEY_CLASS_TAG_B] = kBr;
        return relierKeys;
      });
  }

  /**
   * Given master key material, the name of the key class in question,
   * the user id and the relier id, generate the appropriate derived key
   * as a JWK object.
   *
   * The key is produced by HKDF-deriving 64 bytes with relier-specific
   * HKDF context info.  The first 32 bytes are used as an opaque key id
   * and the second 32 bytes are the actual key material.
   *
   * Input options:
   *    inputKey:     hex string giving the master key material.
   *    keyClassTag:  string identifying the type of key to derive; this
   *                  forms part of the HKDF context info and is included
   *                  in the key id.
   *    uid:          string identifying the user who owns the keys.
   *    clientId:     string identifying the relier for whom the key is
   *                  being derived; this forms part of the HKDF context
   *                  info to ensure unique keys for each relier.
   *
   * Output:
   *    A promise that will resolve with a JWK object representing the
   *    derived key.
   */
  function generateDerivedKey(options) {
    var key = sjcl.codec.hex.toBits(options.inputKey);
    var salt = sjcl.codec.hex.toBits('');
    var contextInfo = sjcl.codec.utf8String.toBits(
       Constants.RELIER_KEYS_CONTEXT_INFO_PREFIX +
       options.keyClassTag + ':' + options.clientId
    );
    return hkdf(key, contextInfo, salt, Constants.RELIER_KEYS_LENGTH * 2)
      .then(function (out) {
        var keySizeBits = Constants.RELIER_KEYS_LENGTH * 8;
        var keyId = sjcl.bitArray.bitSlice(out, 0, keySizeBits);
        var keyBytes = sjcl.bitArray.bitSlice(out, keySizeBits, keySizeBits * 2);
        return {
          kid: options.keyClassTag + '-' + base64url.encode(keyId),
          k: base64url.encode(keyBytes),
          kty: 'oct',
          rid: options.clientId,
          uid: options.uid
        };
      });
  }

  return {
    deriveRelierKeys: deriveRelierKeys,
    generateDerivedKey: generateDerivedKey
  };
});
