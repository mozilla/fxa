export enum MysqlErrors {
  // http://dev.mysql.com/doc/refman/5.5/en/error-messages-server.html
  ER_DUP_ENTRY = 1062,
  ER_TOO_MANY_CONNECTIONS = 1040,
  ER_LOCK_WAIT_TIMEOUT = 1205,
  ER_LOCK_TABLE_FULL = 1206,
  ER_LOCK_DEADLOCK = 1213,
  ER_LOCK_ABORTED = 1689,
  // custom mysql errors
  ER_DELETE_PRIMARY_EMAIL = 2100,
  ER_EXPIRED_TOKEN_VERIFICATION_CODE = 2101,
  ER_SIGNAL_NOT_FOUND = 1643,
}

export function convertError(error: Error & { errno: number }) {
  const e: any = new Error();
  // Return an error that looks like the old db-mysql version (for now)
  switch (error.errno) {
    case MysqlErrors.ER_DUP_ENTRY:
      e.errno = 101;
      e.statusCode = 409;
      break;
    case MysqlErrors.ER_SIGNAL_NOT_FOUND:
      e.errno = 116;
      e.statusCode = 404;
      break;
    default:
      e.errno = error.errno;
      e.statusCode = 500;
  }
  return e as Error & { errno: number; statusCode: number };
}
