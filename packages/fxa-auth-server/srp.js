const crypto = require('crypto'),
      bigint = require('bigint'),
      assert = require('assert'),
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
 * compute the intermediate value x as a hash of three buffers:
 * salt, identity, and password.  And a colon.  FOUR buffers.
 *
 *      x = H(s | H(I | ":" | P))
 *
 * params:
 *         s (buffer)       salt
 *         I (buffer)       user identity
 *         P (buffer)       user password
 */
var getx = exports.getx = function getx(s, I, P, alg) {
  assert(Buffer.isBuffer(s), "Type error: salt (s) must be a buffer");
  assert(Buffer.isBuffer(I), "Type error: identity (I) must be a buffer");
  assert(Buffer.isBuffer(P), "Type error: password (P) must be a buffer");
  alg = alg || ALG;
  var hashIP = crypto.createHash(alg)
    .update(Buffer.concat([I, new Buffer(':'), P]))
    .digest('binary');
  var hashX = crypto.createHash(alg)
    .update(s)
    .update(hashIP)
    .digest('hex');
  return bigint(hashX, 16);
};

/*
 * The verifier is calculated as described in Section 3 of [SRP-RFC].
 * We give the algorithm here for convenience.
 *
 * The verifier (v) is computed based on the salt (s), user name (I),
 * password (P), and group parameters (N, g).
 *
 *         x = H(s | H(I | ":" | P))
 *         v = g^x % N
 *
 * params:
 *         s (buffer)       salt
 *         I (buffer)       user identity
 *         P (buffer)       user password
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
 * and k = H(N | PAD(g)).
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
 *         s (buffer)       salt (read from server)
 *         I (buffer)       user identity (read from user)
 *         P (buffer)       user password (read from user)
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
var getK = exports.getK = function getK(S, N, alg) {
  alg = alg || ALG;
  var S_pad = new Buffer(pad(S, N));
  return bigint(
    crypto
      .createHash(alg)
      .update(S_pad)
      .digest('hex'), 16);
};

var getM = exports.getM = function getM(A, B, S, N) {
  return bigint(
    crypto
      .createHash('sha256')
      .update(pad(A, N))
      .update(pad(B, N))
      .update(pad(S, N))
      .digest('hex'), 16);
}

/*
 * SRP Group Parameters
 * http://tools.ietf.org/html/rfc5054#appendix-A
 *
 * The 1024-, 1536-, and 2048-bit groups are taken from software
 * developed by Tom Wu and Eugene Jhong for the Stanford SRP
 * distribution, and subsequently proven to be prime.  The larger primes
 * are taken from [MODP], but generators have been calculated that are
 * primitive roots of N, unlike the generators in [MODP].
 *
 * The 1024-bit and 1536-bit groups MUST be supported.
 */

exports.params = {

  1024: {
    N: bigint('EEAF0AB9 ADB38DD6 9C33F80A FA8FC5E8 60726187 75FF3C0B 9EA2314C'
             +'9C256576 D674DF74 96EA81D3 383B4813 D692C6E0 E0D5D8E2 50B98BE4'
             +'8E495C1D 6089DAD1 5DC7D7B4 6154D6B6 CE8EF4AD 69B15D49 82559B29'
             +'7BCF1885 C529F566 660E57EC 68EDBC3C 05726CC0 2FD4CBF4 976EAA9A'
             +'FD5138FE 8376435B 9FC61D2F C0EB06E3', 16),
    g: bigint(2)},

  1536: {
    N: bigint('9DEF3CAF B939277A B1F12A86 17A47BBB DBA51DF4 99AC4C80 BEEEA961'
             +'4B19CC4D 5F4F5F55 6E27CBDE 51C6A94B E4607A29 1558903B A0D0F843'
             +'80B655BB 9A22E8DC DF028A7C EC67F0D0 8134B1C8 B9798914 9B609E0B'
             +'E3BAB63D 47548381 DBC5B1FC 764E3F4B 53DD9DA1 158BFD3E 2B9C8CF5'
             +'6EDF0195 39349627 DB2FD53D 24B7C486 65772E43 7D6C7F8C E442734A'
             +'F7CCB7AE 837C264A E3A9BEB8 7F8A2FE9 B8B5292E 5A021FFF 5E91479E'
             +'8CE7A28C 2442C6F3 15180F93 499A234D CF76E3FE D135F9BB', 16),
    g: bigint(2)},

  2048: {
    N: bigint('AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294'
             +'3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D'
             +'CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB'
             +'D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74'
             +'7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A'
             +'436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D'
             +'5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73'
             +'03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6'
             +'94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F'
             +'9E4AFF73'.split(/\s/).join(''), 16),
    g: bigint(2)},

  3072: {
    N: bigint('FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
             +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
             +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
             +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
             +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
             +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
             +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
             +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
             +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
             +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
             +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
             +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
             +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
             +'E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF', 16),
    g: bigint(5)},

  4096: {
    N: bigint('FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
             +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
             +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
             +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
             +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
             +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
             +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
             +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
             +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
             +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
             +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
             +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
             +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
             +'E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26'
             +'99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB'
             +'04DE8EF9 2E8EFC14 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2'
             +'233BA186 515BE7ED 1F612970 CEE2D7AF B81BDD76 2170481C D0069127'
             +'D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9 34063199'
             +'FFFFFFFF FFFFFFFF', 16),
    g: bigint(5)},

  6244: {
    N: bigint('FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
             +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
             +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
             +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
             +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
             +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
             +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
             +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
             +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
             +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
             +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
             +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
             +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
             +'E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26'
             +'99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB'
             +'04DE8EF9 2E8EFC14 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2'
             +'233BA186 515BE7ED 1F612970 CEE2D7AF B81BDD76 2170481C D0069127'
             +'D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9 34028492'
             +'36C3FAB4 D27C7026 C1D4DCB2 602646DE C9751E76 3DBA37BD F8FF9406'
             +'AD9E530E E5DB382F 413001AE B06A53ED 9027D831 179727B0 865A8918'
             +'DA3EDBEB CF9B14ED 44CE6CBA CED4BB1B DB7F1447 E6CC254B 33205151'
             +'2BD7AF42 6FB8F401 378CD2BF 5983CA01 C64B92EC F032EA15 D1721D03'
             +'F482D7CE 6E74FEF6 D55E702F 46980C82 B5A84031 900B1C9E 59E7C97F'
             +'BEC7E8F3 23A97A7E 36CC88BE 0F1D45B7 FF585AC5 4BD407B2 2B4154AA'
             +'CC8F6D7E BF48E1D8 14CC5ED2 0F8037E0 A79715EE F29BE328 06A1D58B'
             +'B7C5DA76 F550AA3D 8A1FBFF0 EB19CCB1 A313D55C DA56C9EC 2EF29632'
             +'387FE8D7 6E3C0468 043E8F66 3F4860EE 12BF2D5B 0B7474D6 E694F91E'
             +'6DCC4024 FFFFFFFF FFFFFFFF', 16),
    g: bigint(5)},

  8192: {
    N: bigint('FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
             +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
             +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
             +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
             +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
             +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
             +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
             +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
             +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
             +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
             +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
             +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
             +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
             +'E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26'
             +'99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB'
             +'04DE8EF9 2E8EFC14 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2'
             +'233BA186 515BE7ED 1F612970 CEE2D7AF B81BDD76 2170481C D0069127'
             +'D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9 34028492'
             +'36C3FAB4 D27C7026 C1D4DCB2 602646DE C9751E76 3DBA37BD F8FF9406'
             +'AD9E530E E5DB382F 413001AE B06A53ED 9027D831 179727B0 865A8918'
             +'DA3EDBEB CF9B14ED 44CE6CBA CED4BB1B DB7F1447 E6CC254B 33205151'
             +'2BD7AF42 6FB8F401 378CD2BF 5983CA01 C64B92EC F032EA15 D1721D03'
             +'F482D7CE 6E74FEF6 D55E702F 46980C82 B5A84031 900B1C9E 59E7C97F'
             +'BEC7E8F3 23A97A7E 36CC88BE 0F1D45B7 FF585AC5 4BD407B2 2B4154AA'
             +'CC8F6D7E BF48E1D8 14CC5ED2 0F8037E0 A79715EE F29BE328 06A1D58B'
             +'B7C5DA76 F550AA3D 8A1FBFF0 EB19CCB1 A313D55C DA56C9EC 2EF29632'
             +'387FE8D7 6E3C0468 043E8F66 3F4860EE 12BF2D5B 0B7474D6 E694F91E'
             +'6DBE1159 74A3926F 12FEE5E4 38777CB6 A932DF8C D8BEC4D0 73B931BA'
             +'3BC832B6 8D9DD300 741FA7BF 8AFC47ED 2576F693 6BA42466 3AAB639C'
             +'5AE4F568 3423B474 2BF1C978 238F16CB E39D652D E3FDB8BE FC848AD9'
             +'22222E04 A4037C07 13EB57A8 1A23F0C7 3473FC64 6CEA306B 4BCBC886'
             +'2F8385DD FA9D4B7F A2C087E8 79683303 ED5BDD3A 062B3CF5 B3A278A6'
             +'6D2A13F8 3F44F82D DF310EE0 74AB6A36 4597E899 A0255DC1 64F31CC5'
             +'0846851D F9AB4819 5DED7EA1 B1D510BD 7EE74D73 FAF36BC3 1ECFA268'
             +'359046F4 EB879F92 4009438B 481C6CD7 889A002E D5EE382B C9190DA6'
             +'FC026E47 9558E447 5677E9AA 9E3050E2 765694DF C81F56E8 80B96E71'
             +'60C980DD 98EDD3DF FFFFFFFF FFFFFFFF', 16),
    g: bigint(19)}
};


