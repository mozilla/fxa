/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import PasswordModel from 'models/password_strength/password_strength_balloon';
import sinon from 'sinon';

let model;

describe('models/password_strength/password_strength_balloon', () => {
  beforeEach(() => {
    model = new PasswordModel({
      email: 'testuser@testuser.com',
    });

    sinon.spy(model, '_getCommonPasswordList');
    sinon.spy(model, 'isValid');

    return model.fetch();
  });

  it('`fetch` fetches the password list', () => {
    assert.isTrue(model._getCommonPasswordList.calledOnce);
  });

  it('has the expected defaults', () => {
    assert.deepEqual(model.toJSON(), {
      email: 'testuser@testuser.com',
      hasUserTakenAction: false,
      isVisible: false,
      password: null,
    });
  });

  describe('validate', () => {
    function testPasswordCausesValidationError(password, expectedError) {
      const err = model.validate({ password });
      assert.isTrue(AuthErrors.is(err, expectedError));
    }

    it('no error if no password entered and user has taken no action', () => {
      const err = model.validate({ password: '' });
      assert.isUndefined(err);
    });

    it('does not error with `JUA7MYM8ni3cgU`', () => {
      // JUA7MYM8ni3cgU was a false positive with the bloomfilter based
      // dictionary.
      const err = model.validate({ password: 'JUA7MYM8ni3cgU' });
      assert.isUndefined(err);
    });

    it('catches if no password entered but user has taken some action', () => {
      const err = model.validate({ hasUserTakenAction: true, password: '' });
      assert.isTrue(AuthErrors.is(err, 'PASSWORD_REQUIRED'));
    });

    it('catches if password is too short', () => {
      testPasswordCausesValidationError('passwor', 'PASSWORD_TOO_SHORT');
    });

    [
      'asdftesTusEr@Testuser.Com!@%$', // contains the full email
      'TESTUSER!@%%ASDF', // local part at the beginning
      '!@#TESTUSER!@%%F', // local part not at the beginning
      'TESTUSER@testuser', // substring of email at the beginning
      '123TESTUSER', // local part comprises over 50% of password
      '12345678TESTUSER', // local part is 50% of password
    ].forEach(password => {
      it(`catches ${password} as too similar to email`, () => {
        testPasswordCausesValidationError(password, 'PASSWORD_SAME_AS_EMAIL');
      });
    });

    [
      'tes12345', // local part < 50%, at the beginning
      '123456789TESTUSER', // local part < 50%, not at the beginning
    ].forEach(password => {
      it(`allows ${password}, not similar enough to email`, () => {
        assert.isUndefined(model.validate({ password }));
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
      'SUMOFirefox',
    ].forEach(password => {
      it(`considers '${password}' common`, () => {
        testPasswordCausesValidationError(password, 'PASSWORD_TOO_COMMON');
      });
    });

    it('sets `hasUserTakenAction` to true when `password` set to ``', () => {
      model.set('password', '');
      assert.isTrue(model.get('hasUserTakenAction'));
    });

    it('sets `hasUserTakenAction` to true when `password` changes', () => {
      model.set('password', 'p');
      assert.isTrue(model.get('hasUserTakenAction'));
    });

    it('calls `isValid` whenever the password changes', () => {
      assert.isFalse(model.isValid.called);
      model.set('password', 'p');
      assert.isTrue(model.isValid.calledOnce);
    });
  });
});
