/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('views/mixins/password-strength-mixin', function () {
    // has a dot at the end
    var EVENT_NAME_PREFIX = 'experiment.pw_strength.';
    var view;
    var View = BaseView.extend({
      // nothing to extend
    });

    Cocktail.mixin(
      View,
      PasswordStrengthMixin
    );

    describe('isPasswordStengthCheckEnabled', function () {
      it('calls able to make the choice', function () {
        var ableMock = {
          choose: sinon.spy(function () {
            return true;
          })
        };

        view = new View({
          able: ableMock,
          metrics: {
            isCollectionEnabled: function () {
              return true;
            },
            logViewEvent: sinon.spy()
          },
          user: {
            get: function () {
              return 'userid';
            }
          },
          window: {
            location: {
              search: '?passwordStrengthCheck=true'
            }
          }
        });

        sinon.spy(view, 'logViewEvent');
        assert.isTrue(view.isPasswordStrengthCheckEnabled());
        assert.isTrue(
          ableMock.choose.calledWith('passwordStrengthCheckEnabled', {
            forcePasswordStrengthCheck: 'true',
            isMetricsEnabledValue: true,
            uniqueUserId: 'userid'
          })
        );
        assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'enabled'));
      });
    });

    describe('disabled', function () {
      it('does not attempt to check password', function () {
        view = new View();
        sinon.spy(view, 'logViewEvent');

        sinon.stub(view, 'isPasswordStrengthCheckEnabled', function () {
          return false;
        });

        sinon.spy(view, 'getPasswordStrengthChecker');
        return view.checkPasswordStrength('password')
          .then(function (status) {
            assert.equal(status, 'DISABLED');
            assert.isFalse(view.getPasswordStrengthChecker.called);
          });
      });
    });

    describe('enabled', function () {
      beforeEach(function () {
        view = new View();
        sinon.spy(view, 'logViewEvent');
        sinon.stub(view, 'isPasswordStrengthCheckEnabled', function () {
          return true;
        });
      });

      it('logs `too_short` when password is short', function () {
        return view.checkPasswordStrength('hello')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'too_short'));
          });
      });

      it('logs `missing_password` when no password is passed', function () {
        return view.checkPasswordStrength('')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'missing_password'));
          });
      });

      it('logs `all_letters_or_numbers` when password is all numbers', function () {
        return view.checkPasswordStrength('123456789')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'all_letters_or_numbers'));
          });
      });

      it('logs `all_letters_or_numbers` when password is all letters', function () {
        return view.checkPasswordStrength('dragondrag')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'all_letters_or_numbers'));
          });
      });

      it('logs `long_enough` when password is >= 12 chars', function () {
        return view.checkPasswordStrength('imsuperlongandstrong')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'long_enough'));
          });
      });

      it('logs `bloomfilter_used` and `bloomfilter_hit` when password is in Bloom filter', function () {
        return view.checkPasswordStrength('charlie2')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'bloomfilter_used'));
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'bloomfilter_hit'));
          });
      });

      it('logs `bloomfilter_used` and `bloomfilter_miss` when checked against Bloom filter but not present', function () {
        return view.checkPasswordStrength('pO09kskAs')
          .then(function () {
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'bloomfilter_used'));
            assert.isTrue(view.logViewEvent.calledWith(EVENT_NAME_PREFIX + 'bloomfilter_miss'));
          });
      });
    });
  });
});
