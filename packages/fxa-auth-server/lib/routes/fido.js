/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const memory = require('../fido2/memory');
const {
  generateRegistrationChallenge,
  generateLoginChallenge,
  parseRegistrationRequest,
  parseLoginRequest,
  verifyAuthenticator,
} = require('../fido2/index');
const isA = require('joi');

module.exports = () => {
  const routes = [
    {
      method: 'POST',
      path: '/fido/registration-challenge',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: isA.string(),
            id: isA.string().optional(),
          },
        },
      },
      handler: async function (request) {
        const { id, email } = request.payload;

        const challengeRes = generateRegistrationChallenge({
          relyingParty: { name: 'Mozilla' },
          user: { id, name: email },
        });

        memory.create({
          id,
          email,
          challenge: challengeRes.challenge,
        });

        return challengeRes;
      },
    },
    {
      method: 'POST',
      path: '/fido/register',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            credentials: isA.object(),
          },
        },
      },
      handler: async function (request) {
        const credentials = request.payload;
        const { key, challenge } = parseRegistrationRequest(credentials);
        const user = memory.findByChallenge(challenge);
        if (!user) {
          console.log('Not Found!');
        }

        memory.addKeyToUser(user, key);

        return { loggedIn: true };
      },
    },
    {
      method: 'POST',
      path: '/fido/login',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: isA.string(),
          },
        },
      },
      handler: function (request) {
        try{const { email } = request.payload;
        const user = memory.findByEmail(email);
        console.log(user);
        if (!user) {
          console.log("User Not Found!");
        }
        const assertChallenge = generateLoginChallenge(user.key);
        memory.updateUserChallenge(user, assertChallenge.challenge);

        return assertChallenge;
      }catch(err){
        console.log(err);
        throw err;
      }
      },
    },
    {
      method: 'POST',
      path: '/fido/login-challenge',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            credentials: isA.object(),
          },
        },
      },
      handler: function (request) {
        try{const { challenge, keyId } = parseLoginRequest(request.payload);
        if (!challenge) {
          console.log("No Challenge!");
        }

        const user = memory.findByChallenge(challenge);
        if (!user || !user.key || user.key.credID !== keyId) {
          console.log("Couldn't authenticate!");
        }

        const loggedIn = verifyAuthenticator(request.payload, user.key);

        return { loggedIn };
      }catch(err){
        console.log(err);
        throw err;
      }
      },
    },
  ];
  return routes;
};
