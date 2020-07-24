/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  hashing,
  ASN1toPEM,
  COSEKeyToECDHKey,
  verifySignature,
} = require("../utils");

/**
 * Parse attestation auth data
 * @param  {Buffer} buffer - authData buffer
 * @return  {Object}          - parsed authData struct
 */
const parseAttestation = (buffer) => {
  // The authData structure is a byte array of 37 bytes or more
  if (buffer.byteLength < 37)
    throw new Error('Authenticator Data must be at least 37 bytes long!');

  // rpIDHash is of 32 Bytes
  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  const flagsBuffer = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  const flagsInt = flagsBuffer[0];

  // flags is of 1 Bytes
  const flags = {
    // Test of User Presence
    up: !!(flagsInt & 0x01),
    // User Verification
    uv: !!(flagsInt & 0x04),
    // Attestation data
    at: !!(flagsInt & 0x40),
    // Extension data
    ed: !!(flagsInt & 0x80),
    flagsInt,
  };

  // CounterBuffer is of 4 Bytes
  const counterBuffer = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  const counter = counterBuffer.readUInt32BE(0);

  let aaguid;
  let credID;
  let COSEPublicKey;

  if (flags.at) {
    aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    const credIDLengthBuffer = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    const credIDLength = credIDLengthBuffer.readUInt16BE(0);
    credID = buffer.slice(0, credIDLength);
    buffer = buffer.slice(credIDLength);
    COSEPublicKey = buffer;
  }

  return {
    rpIdHash,
    flagsBuffer,
    flags,
    counter,
    counterBuffer,
    aaguid,
    credID,
    COSEPublicKey,
  };
};

exports.parseNoneKey = (authenticatorKey) => {
  const authenticatorData = parseAttestation(authenticatorKey.authData);

  if (!authenticatorData.flags.up) {
      throw new Error('User was not presented during authentication!');
  }

  const publicKey = COSEKeyToECDHKey(
      authenticatorData.COSEPublicKey
  );

  return {
      fmt: 'none',
      publicKey: publicKey.toString('base64'),
      counter: authenticatorData.counter,
      credID: authenticatorData.credID.toString('base64'),
  };
};

exports.validateNoneKey = (
  authenticatorDataBuffer,
  key,
  clientDataJSON,
  base64Signature
) => {
  const authenticatorData = parseAttestation(authenticatorDataBuffer);

  if (!authenticatorData.flags.up) {
    throw new Error('User was not presented during authentication!');
  }

  const clientDataHash = hashing(
    'sha256',
    Buffer.from(clientDataJSON, 'base64')
  );
  const sigBase = Buffer.concat([
    authenticatorData.rpIdHash,
    authenticatorData.flagsBuffer,
    authenticatorData.counterBuffer,
    clientDataHash,
  ]);

  const publicKey = ASN1toPEM(Buffer.from(key.publicKey, 'base64'));
  const signature = Buffer.from(base64Signature, 'base64');

  return verifySignature(signature, sigBase, publicKey, 'sha256');
};
