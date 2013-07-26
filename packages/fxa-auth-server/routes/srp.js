/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (SrpSession, AuthBundle) {

  function srpStart(type, account, request) {
    var reply = request.reply.bind(request)
    SrpSession
      .start(type, account)
      .done(reply, reply)
  }

  function srpFinish(request) {
    var reply = request.reply.bind(request)
    SrpSession
      .finish(request.payload.srpToken, request.payload.A, request.payload.M)
      .then(
        function (srpSession) {
          return AuthBundle[srpSession.type](srpSession.K, srpSession.uid)
        }
      )
      .done(reply, reply)
  }

  return {
    start: srpStart,
    finish: srpFinish
  }
}
