/* Pattern captured from blog post: https://spin.atomicobject.com/2018/02/23/error-either-typescript/
 */

export type Result<T> = T | Error;

export function isError<T>(result: Result<T>): result is Error {
  return result instanceof Error;
}

export function isSuccess<T>(result: Result<T>): result is T {
  return !isError(result);
}
