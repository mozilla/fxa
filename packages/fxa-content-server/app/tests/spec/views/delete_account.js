/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  'sinon',
  'views/delete_account',
  'lib/fxa-client',
  'lib/promise',
  'models/reliers/relier',
  'models/user',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, $, sinon, View, FxaClient, p,
    Relier, User, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/delete_account', function () {
    var view;
    var routerMock;
    var email;
    var password = 'password';
    var fxaClient;
    var relier;
    var user;

    beforeEach(function () {
      routerMock = new RouterMock();
      relier = new Relier();
      fxaClient = new FxaClient();
      user = new User();

      view = new View({
        router: routerMock,
        fxaClient: fxaClient,
        user: user,
        relier: relier
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        email = TestHelpers.createEmail();
        sinon.stub(view.fxaClient, 'isSignedIn', function () {
          return true;
        });

        sinon.stub(view, 'currentAccount', function () {
          return {
            email: email
          };
        });

        return view.render()
          .then(function () {
            $('body').append(view.el);
          });
      });

      describe('isValid', function () {
        it('returns true if password is filled out', function () {
          $('form input[type=password]').val(password);

          assert.equal(view.isValid(), true);
        });

        it('returns false if password is too short', function () {
          $('form input[type=password]').val('passwor');

          assert.equal(view.isValid(), false);
        });

        it('displays user email in session', function () {
          assert.equal($('.prefill').text(), email);
        });
      });

      describe('showValidationErrors', function () {
        it('shows an error if the password is invalid', function (done) {
          view.$('[type=email]').val('testuser@testuser.com');
          view.$('[type=password]').val('passwor');

          view.on('validation_error', function (which, msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });
      });

      describe('submit', function () {
        it('deletes the users account, redirect to signup', function () {
          $('form input[type=email]').val(email);
          $('form input[type=password]').val(password);

          sinon.stub(view.fxaClient, 'deleteAccount', function () {
            return p();
          });

          sinon.stub(user, 'removeAccount', function () {
          });

          return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'signup');
                assert.isTrue(view.fxaClient.deleteAccount
                  .calledWith(email, password));
                assert.isTrue(user.removeAccount.calledWith({
                  email: email
                }));
              });
        });
      });

    });
  });
});


