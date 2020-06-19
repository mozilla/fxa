const {
  hashing,
  ASN1toPEM,
  COSEKeyToECDHKey,
  verifySignature,
} = require('../util');

/**
 * Data is a rawBuffer structure:
 * rpIDHash - 32 Bytes
 * flags - 1 Bytes
 * counter - 4 Bytes
 * aaguid - 16 Bytes
 * credIDLength - 2 Bytes
 * credID - x Bytes
 * COSE PublicKey - 77 Bytes
 *
 * flags:
 * up - Test of User Presence
 * uv - User Verification
 * at - Attestation data
 * et - Extension data
 */
const parseAttestation = (buffer) => {
  if (buffer.byteLength < 37)
    throw new Error('Authenticator Data must be at least 37 bytes long!');

  const rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  const flagsBuffer = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  const flagsInt = flagsBuffer[0];

  const flags = {
    up: !!(flagsInt & 0x01),
    uv: !!(flagsInt & 0x04),
    at: !!(flagsInt & 0x40),
    ed: !!(flagsInt & 0x80),
    flagsInt,
  };

  const counterBuffer = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  const counter = counterBuffer.readUInt32BE(0);

  let aaguid = undefined;
  let credID = undefined;
  let COSEPublicKey = undefined;
  const attestationMinLength = 16 + 2 + 16 + 77; //aaguid + credIdLength + credID + publicKey;

  if (flags.at) {
    if (buffer.byteLength < attestationMinLength)
      throw new Error(
        `It seems as the Attestation Data flag is set, but the remaining data is smaller then ${attestationMinLength} bytes. You might have set AT flag for the assertion response.`
      );

    aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    const credIDLengthBuffer = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    const credIDLength = credIDLengthBuffer.readUInt16BE(0);
    credID = buffer.slice(0, credIDLength);
    buffer = buffer.slice(credIDLength);
    COSEPublicKey = buffer;
  }

  if (buffer.byteLength)
    throw new Error('Failed to decode authData! Leftover bytes been detected!');

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
 * Parse None Key from clientDataJSON
 */
exports.parseNoneKey = (authenticatorKey, clientDataJSON) => {
  const authenticatorData = parseAttestation(authenticatorKey.authData);

  if (!authenticatorData.flags.up)
    throw new Error('User was not presented during authentication!');

  const publicKey = COSEKeyToECDHKey(authenticatorData.COSEPublicKey);

  return {
    fmt: 'none',
    publicKey: publicKey.toString('base64'),
    counter: authenticatorData.counter,
    credID: authenticatorData.credID.toString('base64'),
  };
};

/**
 * Validate None Key
 */
exports.validateNoneKey = (
  authenticatorDataBuffer,
  key,
  clientDataJSON,
  base64Sig
) => {
  const authenticatorData = parseAttestation(authenticatorDataBuffer);

  if (!authenticatorData.flags.up)
    throw new Error('User was not presented during authentication!');

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
  const signature = Buffer.from(base64Sig, 'base64');

  return verifySignature(signature, sigBase, publicKey);
};
