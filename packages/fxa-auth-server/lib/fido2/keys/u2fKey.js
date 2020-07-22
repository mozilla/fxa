/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  U2F_REGISTER,
  hashing,
  ASN1toPEM,
  COSEKeyToECDHKey,
  verifySignature,
} = require('../utils');

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
  const flags = flagsBuffer[0];

  // CounterBuffer is of 4 Bytes
  const counterBuffer = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  const counter = counterBuffer.readUInt32BE(0);

  const aaguid = buffer.slice(0, 16);
  buffer = buffer.slice(16);
  const credIDLengthBuffer = buffer.slice(0, 2);
  buffer = buffer.slice(2);
  const credIDLength = credIDLengthBuffer.readUInt16BE(0);
  const credID = buffer.slice(0, credIDLength);
  buffer = buffer.slice(credIDLength);
  const COSEPublicKey = buffer;

  if (buffer.byteLength)
    throw new Error(
      'Failed to decode authData! Leftover bytes have been detected!'
    );

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

/**
 * Parse auth data from assertion response
 * @param  {Buffer} buffer - Auth data buffer
 * @return  {Object}           - Parsed authData struct
 */
const parseAssertion = (buffer) => {
  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  const flagsBuffer = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  const flags = flagsBuffer[0];
  const counterBuffer = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  const counter = counterBuffer.readUInt32BE(0);

  return {
    rpIdHash,
    flagsBuffer,
    flags,
    counter,
    counterBuffer,
  };
};

exports.parseU2FKey = (authenticatorKey, clientDataJSON) => {
  const authenticatorData = parseAttestation(authenticatorKey.authData);

  if (!(authenticatorData.flags & U2F_REGISTER)) {
    throw new Error('User was not presented during authentication!');
  }

  const clientDataHash = hashing(
    'sha256',
    Buffer.from(clientDataJSON, 'base64')
  );
  // A byte reserved for future use [1 byte] with the value 0x00
  // This will evolve into a byte that will allow RPs to track known-good applet version of U2F tokens from specific vendors
  const reserveByte = Buffer.from([0x00]);
  const publicKey = COSEKeyToECDHKey(authenticatorData.COSEPublicKey);

  const sigBase = Buffer.concat([
    reserveByte,
    authenticatorData.rpIdHash,
    clientDataHash,
    authenticatorData.credID,
    publicKey,
  ]);

  const PEMCert = ASN1toPEM(authenticatorKey.attStmt.x5c[0]);
  const signature = authenticatorKey.attStmt.sig;
  const verified = verifySignature(signature, sigBase, PEMCert, 'sha256');

  if (verified) {
    return {
      fmt: 'fido-u2f',
      publicKey: publicKey.toString('base64'),
      counter: authenticatorData.counter,
      credID: authenticatorData.credID.toString('base64'),
    };
  }

  return undefined;
};

exports.validateU2FKey = (
  authenticatorDataBuffer,
  key,
  clientDataJSON,
  base64Signature
) => {
  const authenticatorData = parseAssertion(authenticatorDataBuffer);

  if (!(authenticatorData.flags & U2F_REGISTER)) {
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
