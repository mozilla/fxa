/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const RequestMocks = require('../mocks/request');

function AccountHelper(client, mail, respond) {
  this.client = client;
  this.mail = mail;
  this.respond = respond;
}
AccountHelper.prototype.newVerifiedAccount = function(options) {
  var username = 'testHelp1';
  var domain = '@restmail.net';

  if (options && options.domain) {
    domain = options.domain;
  }

  if (options && options.username) {
    username = options.username;
  }

  var user = username + new Date().getTime();
  var email = user + domain;
  var password = 'iliketurtles';
  var respond = this.respond;
  var mail = this.mail;
  var client = this.client;
  var uid;
  var result = {
    input: {
      user: user,
      email: email,
      password: password,
    },
  };

  return respond(client.signUp(email, password), RequestMocks.signUp)
    .then(function(res) {
      uid = res.uid;
      result.signUp = res;

      return respond(mail.wait(user), RequestMocks.mail);
    })
    .then(function(emails) {
      var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

      return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
    })

    .then(function(res) {
      result.verifyCode = res;

      return respond(
        client.signIn(email, password, { keys: true }),
        RequestMocks.signInWithKeys
      );
    })
    .then(function(res) {
      result.signIn = res;

      return result;
    });
};

AccountHelper.prototype.newUnverifiedAccount = function(options) {
  var username = 'testHelp2';
  var domain = '@restmail.net';

  if (options && options.domain) {
    domain = options.domain;
  }

  if (options && options.username) {
    username = options.username;
  }

  var user = username + new Date().getTime();
  var email = user + domain;
  var password = 'iliketurtles';
  var respond = this.respond;
  var client = this.client;
  var result = {
    input: {
      user: user,
      email: email,
      password: password,
    },
  };

  return respond(client.signUp(email, password), RequestMocks.signUp)
    .then(function(res) {
      result.signUp = res;

      return respond(
        client.signIn(email, password, { keys: true }),
        RequestMocks.signInWithKeys
      );
    })
    .then(function(res) {
      result.signIn = res;

      return result;
    });
};

AccountHelper.prototype.newUnconfirmedAccount = async function(options) {
  let username = 'testHelp3';
  let domain = '@restmail.net';

  const user = username + new Date().getTime();
  const email = user + domain;
  const password = 'iliketurtles';
  const respond = this.respond;
  const client = this.client;

  const signUp = await respond(
    client.signUp(email, password, options),
    RequestMocks.signUp
  );

  return {
    input: {
      user: user,
      email: email,
      password: password,
    },
    signUp,
  };
};

module.exports = AccountHelper;
