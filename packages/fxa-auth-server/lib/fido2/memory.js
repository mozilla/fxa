/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const userByChallenge = {};

const getUserList = () => {
  return Object.values(userByChallenge);
};

const findByEmail = (email) => {
  return getUserList().find((user) => user.email === email);
};

const findByChallenge = (challenge) => {
  return userByChallenge[challenge];
};

const create = (user) => {
  userByChallenge[user.challenge] = user;
};

const addKeyToUser = (user, key) => {
  userByChallenge[user.challenge] = {
    ...user,
    key,
  };
};

const updateUserChallenge = (user, challenge) => {
  delete userByChallenge[user.challenge];

  userByChallenge[challenge] = {
    ...user,
    challenge,
  };
};

module.exports = {
  create,
  findByEmail,
  findByChallenge,
  addKeyToUser,
  updateUserChallenge,
};
