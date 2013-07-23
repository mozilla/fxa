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
