const assert = require('assert');

const keys = require('./lib/keys');
const jwt = require('jsonwebtoken');

async function run() {
  const k1 = await keys.generatePrivateKey('RS256');
  const k2 = await keys.generatePrivateKey('ES256');
  const k3 = await keys.generatePrivateKey('ES256');

  const k1PrivatePEM = await keys.jwk2pem(k1, true);
  const k2PrivatePEM = await keys.jwk2pem(k2, true);
  const k3PrivatePEM = await keys.jwk2pem(k3, true);

  const k1PublicPEM = await keys.jwk2pem(await keys.extractPublicKey(k1));
  const k2PublicPEM = await keys.jwk2pem(await keys.extractPublicKey(k2));
  const k3PublicPEM = await keys.jwk2pem(await keys.extractPublicKey(k3));

  const tok1 = jwt.sign({ hello: 'world' }, k1PrivatePEM, {
    algorithm: 'RS256',
  });
  assert.ok(jwt.verify(tok1, k1PublicPEM, { algorithms: ['RS256', 'ES256'] }));
  assert.throws(() => {
    jwt.verify(tok1, k2PublicPEM, { algorithms: ['RS256', 'ES256'] });
  });
  assert.throws(() => {
    jwt.verify(tok1, k3PublicPEM, { algorithms: ['RS256', 'ES256'] });
  });

  const tok2 = jwt.sign({ hello: 'world' }, k2PrivatePEM, {
    algorithm: 'ES256',
  });
  assert.ok(jwt.verify(tok2, k2PublicPEM, { algorithms: ['RS256', 'ES256'] }));
  assert.throws(() => {
    jwt.verify(tok2, k1PublicPEM, { algorithms: ['RS256', 'ES256'] });
  });
  assert.throws(() => {
    jwt.verify(tok2, k3PublicPEM, { algorithms: ['RS256', 'ES256'] });
  });

  const tok3 = jwt.sign({ hello: 'world' }, k3PrivatePEM, {
    algorithm: 'ES256',
  });
  assert.ok(jwt.verify(tok3, k3PublicPEM, { algorithms: ['RS256', 'ES256'] }));
  assert.throws(() => {
    jwt.verify(tok3, k1PublicPEM, { algorithms: ['RS256', 'ES256'] });
  });
  assert.throws(() => {
    jwt.verify(tok3, k2PublicPEM, { algorithms: ['RS256', 'ES256'] });
  });

  console.log(k3);
  console.log(tok3);
}

run().then(() => {
  console.log('OK!');
});
