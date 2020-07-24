/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsrsasign = require('jsrsasign');

const {
  hashing,
  verifySignature,
  ASN1toPEM,
  COSEKeyToECDHKey,
} = require('../utils');

/**
 * Get certificate information using jsrsasign lib
 * @param  {String} certPEM - PEM certificate
 * @return  {Object}                 - Cert Details
 */
const getCertInfo = (certPEM) => {
  const subjectCertificate = new jsrsasign.X509();
  // read PEM formatted X.509 certificate
  subjectCertificate.readCertPEM(certPEM);
  // get string of subject field of certificate
  const subjectString = subjectCertificate.getSubjectString();
  const subjectPart = subjectString.slice(1).split('/');

  const subject = {};
  for (const field of subjectPart) {
    const kv = field.split('=');
    subject[kv[0]] = kv[1];
  }
  // format version (number)
  const version = subjectCertificate.version;
  // get BasicConstraints extension value as object in the certificate
  // this method will get basic constraints extension value as object with following paramters
  // cA - CA flag whether CA or not
  const basicConstraints = !!subjectCertificate.getExtBasicConstraints().cA;

  return {
    subject,
    version,
    basicConstraints,
  };
};

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

/**
 *  Verifies full attestation: attestation that chains to the manufacturer
 */
const verifyFullAttestation = (authenticatorKey, sigBaseBuffer, sigBuffer) => {
  const authenticatorData = parseAttestation(authenticatorKey.authData);

  const publicKey = COSEKeyToECDHKey(authenticatorData.COSEPublicKey);

  const Cert = ASN1toPEM(authenticatorKey.attStmt.x5c[0]);
  const certInfo = getCertInfo(Cert);

  if (certInfo.subject.OU !== 'Authenticator Attestation') {
    throw new Error(
      'Batch certificate OU must be set strictly to "Authenticator Attestation"!'
    );
  }
  if (!certInfo.subject.CN) {
    throw new Error('Batch certificate CN must not be empty');
  }
  if (!certInfo.subject.O) {
    throw new Error('Batch certificate CN must not be empty!');
  }
  if (!certInfo.subject.C || certInfo.subject.C.length !== 2) {
    throw new Error(
      'Batch certificate C MUST be set to two character ISO 3166 code!'
    );
  }
  if (certInfo.basicConstraints) {
    throw new Error('Batch certificate basic constraints CA MUST be false!');
  }
  if (certInfo.version !== 3) {
    throw new Error('Batch certificate version MUST be 3(ASN1 2)!');
  }

  const signatureValid = verifySignature(
    sigBuffer,
    sigBaseBuffer,
    Cert,
    'sha256'
  );

  if (signatureValid) {
    return publicKey;
  }

  return undefined;
};

exports.parsePackedKey = (authenticatorKey, clientDataJSON) => {
  const authenticatorData = parseAttestation(authenticatorKey.authData);

  const clientDataHash = hashing(
    'sha256',
    Buffer.from(clientDataJSON, 'base64')
  );
  const sigBaseBuffer = Buffer.concat([
    authenticatorKey.authData,
    clientDataHash,
  ]);

  const sigBuffer = authenticatorKey.attStmt.sig;
  let publicKey;

  if (authenticatorKey.attStmt.x5c) {
    publicKey = verifyFullAttestation(
      authenticatorKey,
      sigBaseBuffer,
      sigBuffer
    );
  } else if (authenticatorKey.attStmt.ecdaaKeyId) {
    throw new Error('ECDAA is not supported yet!');
  } else {
    throw new Error('Surrogate is not supported yet!');
  }

  if (!publicKey) {
    return undefined;
  }

  return {
    fmt: 'packed',
    publicKey: publicKey.toString('base64'),
    counter: authenticatorData.counter,
    credID: authenticatorData.credID.toString('base64'),
  };
};

exports.validatePackedKey = (
  authenticatorDataBuffer,
  key,
  clientDataJSON,
  base64Sig
) => {
  const authenticatorData = parseAttestation(authenticatorDataBuffer);

  if (!authenticatorData.flags.up) {
    throw new Error('User was not presented during authentication');
  }

  const clientDataHash = hashing(
    'sha256',
    Buffer.from(clientDataJSON, 'base64')
  );

  const sigBaseBuffer = Buffer.concat([
    authenticatorDataBuffer,
    clientDataHash,
  ]);

  const publicKey = ASN1toPEM(Buffer.from(key.publicKey, 'base64'));
  const sigBuffer = Buffer.from(base64Sig, 'base64');

  return verifySignature(sigBuffer, sigBaseBuffer, publicKey, 'sha256');
};
