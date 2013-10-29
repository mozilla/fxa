module.exports = function (
  config,
  log,
  error,
  AuthToken,
  SessionToken,
  KeyFetchToken,
  AccountResetToken,
  SrpToken,
  ForgotPasswordToken) {

  var backend = config.db.backend
  if (backend === 'mysql') {
    return require('./mysql')(
      config.mysql,
      log,
      error,
      AuthToken,
      SessionToken,
      KeyFetchToken,
      AccountResetToken,
      SrpToken,
      ForgotPasswordToken
    )
  }
  else {
    return require('./heap')(
      log,
      error,
      AuthToken,
      SessionToken,
      KeyFetchToken,
      AccountResetToken,
      SrpToken,
      ForgotPasswordToken
    )
  }
}
