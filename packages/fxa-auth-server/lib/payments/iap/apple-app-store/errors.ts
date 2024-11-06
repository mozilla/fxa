/**
 * Error Codes representing an error that is temporary to Apple
 * and should be retried again without changes.
 * https://developer.apple.com/documentation/appstoreserverapi/error_codes
 */
export const APP_STORE_RETRY_ERRORS = [4040002, 4040004, 5000001, 4040006];

export class AppStoreRetryableError extends Error {
  public errorCode: number;
  public errorMessage: string;

  constructor(errorCode: number, errorMessage: string) {
    super(errorMessage);
    this.name = 'AppStoreRetryableError';
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
}
