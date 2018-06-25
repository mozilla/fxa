/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import PasswordModel from 'models/password_strength/password_strength_balloon';

let model;

describe('models/password_strength/password_strength_balloon', () => {
  beforeEach(() => {
    model = new PasswordModel({
      email: 'testuser@testuser.com'
    });
  });

  it('has the expected defaults', () => {
    assert.deepEqual(model.toJSON(), {
      email: 'testuser@testuser.com',
      hasEnteredPassword: false,
      isCommon: false,
      isSameAsEmail: false,
      isTooShort: true,
      isValid: false
    });
  });

  describe('updateForPassword', () => {
    it('catches if password is too short', () => {
      return model.updateForPassword('passwor').then(() => {
        assert.deepEqual(model.toJSON(), {
          email: 'testuser@testuser.com',
          hasEnteredPassword: true,
          isCommon: false,
          isSameAsEmail: false,
          isTooShort: true,
          isValid: false
        });
      });
    });

    [
      'asdftesTusEr@Testuser.Com!@%$', // contains the full email
      'TESTUSER!@%%ASDF',              // local part at the beginning
      'TESTUSER@testuser',             // substring of email at the beginning
    ].forEach((password) => {
      it(`catches ${password} as too similar to email`, () => {
        return model.updateForPassword(password)
          .then(() => {
            assert.deepEqual(model.toJSON(), {
              email: 'testuser@testuser.com',
              hasEnteredPassword: true,
              isCommon: false,
              isSameAsEmail: true,
              isTooShort: false,
              isValid: false
            });
          });
      });
    });

    it('local part of email must be >= 4 characters in length to be banned', () => {
      model.set('email', 'tes@domain.com');
      assert.isFalse(model.isSameAsEmail('testuser'));
      model.set('email', 'test@domain.com');
      assert.isTrue(model.isSameAsEmail('testuser'));
    });

    [
      '!@#TESTUSER!@%%ASDF',              // local part not at the beginning
      '!%@TESTUSER@testuser',             // substring of email at the beginning
    ].forEach((password) => {
      it(`catches ${password} as too similar to email`, () => {
        return model.updateForPassword(password)
          .then(() => {
            assert.deepEqual(model.toJSON(), {
              email: 'testuser@testuser.com',
              hasEnteredPassword: true,
              isCommon: false,
              isSameAsEmail: false,
              isTooShort: false,
              isValid: true
            });
          });
      });
    });

    [
      'password',
      'firefox account',
      'firefox accounts',
      'FirefoxAccounts', 'firefox sync',
      'Firefox   SYNC',
      'Mozilla.com',
      'mozilla.org',
      'firefox.com',
      'firefox.org',
      'lockbox2018',
      'fxaccounts',
      'addonsMozilla',
      'SUMOFirefox'
    ].forEach((commonPassword) => {
      it(`considers '${commonPassword}' common`, () => {
        return model.updateForPassword(commonPassword)
          .then(() => {
            assert.deepEqual(model.toJSON(), {
              email: 'testuser@testuser.com',
              hasEnteredPassword: true,
              isCommon: true,
              isSameAsEmail: false,
              isTooShort: false,
              isValid: false
            });
          });
      });
    });

    it('`hasEnteredPassword` remains true after entering then deleting password', () => {
      return model.updateForPassword('p')
        .then(() => model.updateForPassword(''))
        .then(() => {
          assert.deepEqual(model.toJSON(), {
            email: 'testuser@testuser.com',
            hasEnteredPassword: true,
            isCommon: false,
            isSameAsEmail: false,
            isTooShort: true,
            isValid: false
          });
        });
    });

    it('sets `isValid: true` if all criteria are met', () => {
      return model.updateForPassword('15asdgljk325sadglkasdgklasdjlg')
        .then(() => {
          assert.deepEqual(model.toJSON(), {
            email: 'testuser@testuser.com',
            hasEnteredPassword: true,
            isCommon: false,
            isSameAsEmail: false,
            isTooShort: false,
            isValid: true
          });
        });
    });
  });

  describe('validate', () => {
    it('returns PASSWORD_REQUIRED if no password entered', () => {
      model.set('hasEnteredPassword', false);
      assert.isTrue(AuthErrors.is(model.validate(), 'PASSWORD_REQUIRED'));
    });

    it('returns PASSWORD_TOO_SHORT for isTooShort', () => {
      model.set({
        hasEnteredPassword: true,
        isCommon: false,
        isSameAsEmail: false,
        isTooShort: true,
      });
      assert.isTrue(AuthErrors.is(model.validate(), 'PASSWORD_TOO_SHORT'));
    });

    it('returns PASSWORD_SAME_AS_EMAIL for isSameAsEmail', () => {
      model.set({
        hasEnteredPassword: true,
        isCommon: false,
        isSameAsEmail: true,
        isTooShort: false,
      });
      assert.isTrue(AuthErrors.is(model.validate(), 'PASSWORD_SAME_AS_EMAIL'));
    });

    it('returns PASSWORD_TOO_COMMON for isCommon', () => {
      model.set({
        hasEnteredPassword: true,
        isCommon: true,
        isSameAsEmail: false,
        isTooShort: false,
      });
      assert.isTrue(AuthErrors.is(model.validate(), 'PASSWORD_TOO_COMMON'));
    });

    it('returns undefined if no problem', () => {
      model.set({
        hasEnteredPassword: true,
        isCommon: false,
        isSameAsEmail: false,
        isTooShort: false,
      });
      assert.isUndefined(model.validate());
    });
  });
});
