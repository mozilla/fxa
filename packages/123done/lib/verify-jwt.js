'use strict';

const { JWTool } = require('./jwtool');

async function verifyJwt(jku, token) {
  const verifier = new JWTool([jku]);
  // Little bit of a hack to find a default kid.
  await verifier.fetch(jku).catch(function () {
    /* that preloaded the keyset, ignore inevitable failure */
  });
  const defaults = { jku };
  const kids = Object.keys(verifier.jwkSets[jku]);
  if (kids.length === 1) {
    defaults.kid = kids[0];
  }
  return verifier.verify(token, defaults);
}

module.exports = { verifyJwt };
