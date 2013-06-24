const crypto = require('crypto'),
      bigint = require('bigint'),
      ALG = 'sha256';

/*
 * If a conversion is explicitly specified with the operator PAD(),
 * the integer will first be implicitly converted, then the resultant
 * byte-string will be left-padded with zeros (if necessary) until its
 * length equals the implicitly-converted length of N.
 *
 * params:
 *         n (bigint)       Number to pad
 *         N (bigint)       N
 *
 * returns: buffer
 */
var pad = exports.pad = function pad(n, N) {
  // a Put padding is specified in bytes
  var N_bytes = Math.ceil(N.bitLength() / 8);
  var n_bytes = Math.ceil(n.bitLength() / 8);
  var padding = N_bytes - n_bytes;
  if (padding < 0) {
    throw("Negative padding.  Very uncomfortable.");
  }
  var b = n.toBuffer();
  var result = new Buffer(padding + b.length);
  result.fill(0, 0, padding);
  b.copy(result, padding);
  return result;
};

/*
 * compute the intermediate value x as a hash of three strings:
 * salt, identity, and password.  And a colon.  FOUR strings.
 *
 *      x = SHA1(s | SHA1(I | ":" | P))
 *
 * params:
 *         s (str or buf)   salt
 *         I (string)       user identity
 *         P (string)       user password
 */
var getx = exports.getx = function getx(s, I, P, alg) {
  alg = alg || ALG;
  var hashIP = crypto.createHash(alg).update(I + ':' + P).digest('binary');
  var hashX = crypto.createHash(alg).update(s).update(hashIP).digest('hex');
  return bigint(hashX, 16);
};

/*
 * The verifier is calculated as described in Section 3 of [SRP-RFC].
 * We give the algorithm here for convenience.
 *
 * The verifier (v) is computed based on the salt (s), user name (I),
 * password (P), and group parameters (N, g).  The computation uses the
 * [SHA1] hash algorithm:
 *
 *         x = SHA1(s | SHA1(I | ":" | P))
 *         v = g^x % N
 *
 * params:
 *         s (str or buf)   salt
 *         I (string)       user identity
 *         P (string)       user password
 *         N (bigint)       group parameter N
 *         g (bigint)       generator
 *         alg (string)     default = ALG
 *
 * returns: bigint
 */
var getv = exports.getv = function getv(s, I, P, N, g, alg) {
  alg = alg || ALG;
  return g.powm(getx(s, I, P, alg), N);
};

/*
 * calculate the SRP-6 multiplier
 *
 * params:
 *         N (bigint)       group parameter N
 *         g (bigint)       generator
 *         alg (string)     default = ALG
 *
 * returns: bigint
 */
var getk = exports.getk = function getk(N, g, alg) {
  alg = alg || ALG;
  return bigint(
    crypto
      .createHash(alg)
      .update(N.toBuffer())
      .update(pad(g, N))
      .digest('hex'), 16);
};

/*
 * Generate a random key
 *
 * params:
 *         bytes (int)      length of key (default=32)
 *         callback (func)  function to call with err,key
 *
 * returns: bigint
 */
var genKey = exports.genKey = function genKey(bytes, callback) {
  // bytes is optional
  if (arguments.length < 2) {
    callback = bytes;
    bytes = 32;
  }
  if (typeof callback !== 'function') {
    throw("Callback required");
  }
  crypto.randomBytes(bytes, function(err, buf) {
    if (err) return callback (err);
    return callback(null, bigint.fromBuffer(buf));
  });
};

/*
 * The server key exchange message also contains the server's public
 * value (B).  The server calculates this value as B = k*v + g^b % N,
 * where b is a random number that SHOULD be at least 256 bits in length
 * and k = SHA1(N | PAD(g)).
 *
 * Note: as the tests imply, the entire expression is mod N.
 *
 * params:
 *         v (bigint)       verifier
 *         g (bigint)       generator
 */
var getB = exports.getB = function getB(v, g, b, N, alg) {
  alg = alg || ALG;
  var k = getk(N, g, alg);
  var r = k.mul(v).add(g.powm(b, N)).mod(N);
  return r;
};

/*
 * The client key exchange message carries the client's public value
 * (A).  The client calculates this value as A = g^a % N, where a is a
 * random number that SHOULD be at least 256 bits in length.
 *
 * Note: for this implementation, we take that to mean 256/8 bytes.
 */
var getA = exports.getA = function getA(g, a, N) {
  if (Math.ceil(a.bitLength() / 8) < 256/8) {
    console.warn("getA: client key length", a.bitLength(), "is less than the recommended 256");
  }
  return g.powm(a, N);
};

/*
 * Random scrambling parameter u
 *
 * params:
 *         A (bigint)       client ephemeral public key
 *         B (bigint)       server ephemeral public key
 *         N (bigint)       group parameter N
 */
var getu = exports.getu = function getu(A, B, N, alg) {
  alg = alg || ALG;
  return bigint(
      crypto
          .createHash(alg)
          .update(pad(A, N))
          .update(pad(B, N))
          .digest('hex'), 16);
};

/*
 * The TLS premaster secret as calculated by the client
 *
 * params:
 *         s (str or buf)   salt (read from server)
 *         I (string)       user identity (read from user)
 *         P (string)       user password (read from user)
 *         N (bigint)       group parameter N (known in advance)
 *         g (bigint)       generator for N (known in advance)
 *         a (bigint)       ephemeral private key (generated for session)
 *         B (bigint)       server ephemeral public key (read from server)
 *
 * returns: bigint
 */
var client_getS = exports.client_getS = function client_getS(s, I, P, N, g, a, B, alg) {
  var A = getA(g, a, N);
  var u = getu(A, B, N, alg);
  var k = getk(N, g, alg);
  var x = getx(s, I, P, alg);
  return B.sub(k.mul(g.powm(x, N))).powm(a.add(u.mul(x)), N).mod(N);
};

/*
 * The TLS premastersecret as calculated by the server
 *
 * params:
 *         s (bigint)       salt (stored on server)
 *         v (bigint)       verifier (stored on server)
 *         N (bigint)       group parameter N (known in advance)
 *         g (bigint)       generator for N (known in advance)
 *         A (bigint)       ephemeral client public key (read from client)
 *         b (bigint)       server ephemeral private key (generated for session)
 *
 * returns: bigint
 */
var server_getS = exports.server_getS = function server_getS(s, v, N, g, A, b, alg) {
  var k = getk(N, g, alg);
  var B = getB(v, g, b, N, alg);
  var u = getu(A, B, N, alg);
  return A.mul(v.powm(u, N)).powm(b, N).mod(N);
};

/*
 * Compute the shared session key K from S
 *
 * params:
 *         S (bigint)       Session key
 *
 * returns: bigint
 */
var getK = exports.getK = function getK(S, alg) {
  alg = alg || ALG;
  return bigint(
    crypto
      .createHash(alg)
      .update(S.toBuffer())
      .digest('hex'), 16);
};