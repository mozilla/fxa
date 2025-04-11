import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { interpolate, getLocalizedErrorMessage } from '../../lib/error-utils';
import { AuthError } from '../../lib/oauth';

export function getLocalizedEmailValidationErrorMessage(
  error: AuthError,
  ftlMsgResolver: FtlMsgResolver,
  email?: string
): string {
  if (error.errno === AuthUiErrors.INVALID_EMAIL_DOMAIN.errno) {
    const [, domain] = email ? email.split('@') : [''];
    return ftlMsgResolver.getMsg(
      'auth-error-1064',
      interpolate(AuthUiErrors.INVALID_EMAIL_DOMAIN.message, { domain }),
      { domain }
    );
  }
  return getLocalizedErrorMessage(ftlMsgResolver, error);
}
