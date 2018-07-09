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
      hasSubmit: false,
      isCommon: false,
      isSameAsEmail: false,
      isSubmitting: false,
      isTooShort: false,
      isValid: false,
      password: ''
    });
  });

  describe('updateForPassword', () => {
    it('catches if password is too short', () => {
      model.set('password', 'passwor', { silent: true });
      return model.updateForPassword().then(() => {
        assert.deepEqual(model.toJSON(), {
          email: 'testuser@testuser.com',
          hasEnteredPassword: true,
          hasSubmit: false,
          isCommon: false,
          isSameAsEmail: false,
          isSubmitting: false,
          isTooShort: true,
          isValid: false,
          password: 'passwor',
        });
      });
    });

    [
      'asdftesTusEr@Testuser.Com!@%$', // contains the full email
      'TESTUSER!@%%ASDF',              // local part at the beginning
      '!@#TESTUSER!@%%F',              // local part not at the beginning
      'TESTUSER@testuser',             // substring of email at the beginning
      '123TESTUSER',                   // local part comprises over 50% of password
      '12345678TESTUSER',              // local part is 50% of password
    ].forEach((password) => {
      it(`catches ${password} as too similar to email`, () => {
        model.set('password', password, { silent: true });
        return model.updateForPassword()
          .then(() => {
            assert.deepEqual(model.toJSON(), {
              email: 'testuser@testuser.com',
              hasEnteredPassword: true,
              hasSubmit: false,
              isCommon: false,
              isSameAsEmail: true,
              isSubmitting: false,
              isTooShort: false,
              isValid: false,
              password,
            });
          });
      });
    });

    [
      'tes12345',             // local part < 50%, at the beginning
      '123456789TESTUSER',    // local part < 50%, not at the beginning
    ].forEach((password) => {
      it(`catches ${password} as too similar to email`, () => {
        model.set('password', password, { silent: true });
        return model.updateForPassword()
          .then(() => {
            assert.deepEqual(model.toJSON(), {
              email: 'testuser@testuser.com',
              hasEnteredPassword: true,
              hasSubmit: false,
              isCommon: false,
              isSameAsEmail: false,
              isSubmitting: false,
              isTooShort: false,
              isValid: true,
              password,
            });
          });
      });
    });

    [
      'password',
      '12firefox account34',
      'firefox accounts',
      'FirefoxAccounts',
      'firefox sync',
      'Firefox   SYNC',
      'mozilla123',
      '123mozilla', // mozilla doesn't have to be at the start, but comprises over half the password
      'Mozilla.com',
      'mozilla.org',
      'firefox.com',
      'firefox.org',
      'lockbox2018',
      'fxaccounts',
      'addonsMozilla',
      'SUMOFirefox'
    ].forEach((password) => {
      it(`considers '${password}' common`, () => {
        model.set('password', password, { silent: true });
        return model.updateForPassword()
          .then(() => {
            assert.deepEqual(model.toJSON(), {
              email: 'testuser@testuser.com',
              hasEnteredPassword: true,
              hasSubmit: false,
              isCommon: true,
              isSameAsEmail: false,
              isSubmitting: false,
              isTooShort: false,
              isValid: false,
              password,
            });
          });
      });
    });

    it('`hasEnteredPassword` remains true after entering then deleting password', () => {
      model.set({
        hasEnteredPassword: true,
        password: ''
      }, { silent: false });
      return model.updateForPassword()
        .then(() => {
          assert.deepEqual(model.toJSON(), {
            email: 'testuser@testuser.com',
            hasEnteredPassword: true,
            hasSubmit: false,
            isCommon: false,
            isSameAsEmail: false,
            isSubmitting: false,
            isTooShort: true,
            isValid: false,
            password: '',
          });
        });
    });

    it('sets `isValid: true` if all criteria are met', () => {
      const password = '15asdgljk325sadglkasdgklasdjlg';
      model.set('password', password, { silent: true });
      return model.updateForPassword()
        .then(() => {
          assert.deepEqual(model.toJSON(), {
            email: 'testuser@testuser.com',
            hasEnteredPassword: true,
            hasSubmit: false,
            isCommon: false,
            isSameAsEmail: false,
            isSubmitting: false,
            isTooShort: false,
            isValid: true,
            password
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

  it('updating isSubmitting changes `hasSubmit` to true', () => {
    model.set('isSubmitting', true);
    assert.isTrue(model.get('hasSubmit'));
  });
});
