const crypto = require('crypto');
const cbor = require('cbor');

/**
 *  U2F PRESENCE CONSTANT
 */
exports.U2F_REGISTER = 0x01;

/**
 * Returns digest of the given data using algo (SHA256)
 * @param  {Buffer} data - data to hash
 * @param  {String} algo - hashing algo
 * @return  {Buffer}        - the hash
 */
exports.hashing = (algo, data) => {
  return crypto.createHash(algo).update(data).digest();
};

/**
 * Convert binary certificate or public key to an OpenSSL-compatible PEM text format
 * @param  {Buffer} publicKeyBuffer - Cert or Public Key Buffer
 * @return  {String}                          - PEM
 */
exports.ASN1toPEM = (publicKeyBuffer) => {
  if (!Buffer.isBuffer(publicKeyBuffer)) {
    throw new Error('ASN1toPEM: publicKeyBuffer must be Buffer!');
  }
  let type;
  if (publicKeyBuffer.length === 65 && publicKeyBuffer[0] === 0x04) {
    publicKeyBuffer = Buffer.concat([
      Buffer.from(
        '3059301306072a8648ce3d020106082a8648ce3d030107034200',
        'hex'
      ),
      publicKeyBuffer,
    ]);
    type = 'PUBLIC KEY';
  } else {
    type = 'CERTIFICATE';
  }

  const b64cert = publicKeyBuffer.toString('base64');
  const PEMKeyMatch = b64cert.match(/.{1,64}/g);

  if (!PEMKeyMatch) {
    throw new Error('Invalid Key');
  }

  const PEMKey = PEMKeyMatch.join('\n');

  return `-----BEGIN ${type}-----\n` + PEMKey + `\n----END ${type}-----\n`;
};

/**
 * Takes COSE public key and converts it to raw Public Key Cryptography Standards ECDH(Elliptic-curve Diffie–Hellman) key
 * @param  {Buffer} cosePublicKey - COSE encoded public key
 * @return  {Buffer}                       - raw PKCS encoded public key
 */
exports.COSEKeyToECDHKey = (cosePublicKey) => {
  const coseStruct = cbor.decodeAllSync(cosePublicKey)[0];
  const tag = Buffer.from([0x04]);
  const x = coseStruct.get(-2);
  const y = coseStruct.get(-3);

  return Buffer.concat([tag, x, y]);
};

/**
 * Takes signature, data, PEM public key , and algo and tries to verify signature
 * @param  {Buffer} signature
 * @param  {Buffer} data
 * @param  {String} publicKey - PEM encoded public key
 * @param  {String} algo - hashing algo
 * @return  {Boolean}
 */
exports.verifySignature = (signature, data, publicKey, algo) => {
  return crypto.createVerify(algo).update(data).verify(publicKey, signature);
};

/**
 * Gives base64 encoded buffer of the given length
 * @param  {Number} length - length of the buffer
 * @return  {String}             - base64 random buffer
 */
exports.randomBase64Buff = (length = 32) => {
  const buff = crypto.randomBytes(length, function (err, buf) {
    if (err) throw err;
  });
  return buff.toString('base64');
};

/**
 * Parse base64 from the browser
 * @param  {String} keyID - key id to parse
 * @return  {String}           - base64 buffer
 */
exports.parseBrowserBuffer = (keyID) => {
  const buffer = Buffer.from(keyID, 'base64');
  return buffer.toString('base64');
};

/**
 * Convert raw base64-encoded string to multiline PEM
 * @param  {String} str - base64 string
 * @return  {String}      - PEM
 */
exports.base64ToPem = (str, type = 'CERTIFICATE') => {
  const split = str.match(/.{1,65}/g).join('\n'); // split into 65-character lines
  return `-----BEGIN ${type}-----\n${split}\n-----END ${type}-----\n`;
};

/**
 * Convert multiline PEM to raw base64-encoded string
 * @param  {String} pem - multiline pem
 * @return  {String}      - base64 encoded string
 */
exports.pemToBase64 = (pem) => {
  return pem.replace(/-----(BEGIN|END) [A-Z ]+-----/g, '').replace(/\n/g, '');
};
