/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type WebAuthnOperation = 'registration' | 'authentication';

/**
 * High-level grouping that drives Sentry logging and UI messaging strategy.
 *
 *   user_action     — User cancelled, dismissed, or let the prompt time out.
 *                     Expected outcomes; do not log to Sentry.
 *   device_platform — Browser or authenticator cannot satisfy the request.
 *                     Do not log to Sentry.
 *   unexpected      — Error we do not expect in a correct integration.
 *                     Log to Sentry for investigation.
 */
export enum WebAuthnErrorCategory {
  UserAction = 'user_action',
  DevicePlatform = 'device_platform',
  Unexpected = 'unexpected',
}

export enum WebAuthnErrorType {
  NotAllowed = 'NotAllowedError',
  Timeout = 'TimeoutError',
  NotSupported = 'NotSupportedError',
  Security = 'SecurityError',
  InvalidState = 'InvalidStateError',
  NotReadable = 'NotReadableError',
  Type = 'TypeError',
  Constraint = 'ConstraintError',
  Data = 'DataError',
  Encoding = 'EncodingError',
  Operation = 'OperationError',
  Unknown = 'UnknownError',
}

export interface CategorizedWebAuthnError {
  category: WebAuthnErrorCategory;
  errorType: WebAuthnErrorType;
  ftlId: string;
  fallbackText: string;
  logToSentry: boolean;
}

interface ErrorEntry {
  category: WebAuthnErrorCategory;
  errorType: WebAuthnErrorType;
  logToSentry: boolean;
  ftlId: Record<WebAuthnOperation, string>;
  fallbackText: Record<WebAuthnOperation, string>;
}

const UNEXPECTED_FALLBACK: Record<WebAuthnOperation, string> = {
  registration: 'Passkey setup failed. Try again or choose another method.',
  authentication:
    'Something went wrong. Try again or choose another sign-in method.',
};

const UNEXPECTED_FTL_ID: Record<WebAuthnOperation, string> = {
  registration: 'passkey-registration-error-unexpected',
  authentication: 'passkey-authentication-error-unexpected',
};

export const ERROR_MAP: Record<string, ErrorEntry> = {
  NotAllowedError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.NotAllowed,
    logToSentry: false,
    ftlId: {
      registration: 'passkey-registration-error-not-allowed',
      authentication: 'passkey-authentication-error-not-allowed',
    },
    fallbackText: {
      registration:
        'Passkey setup failed or is unavailable. Try again or choose another method.',
      authentication:
        'Sign-in with passkey failed or is unavailable. Try again or choose another method.',
    },
  },
  TimeoutError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.Timeout,
    logToSentry: false,
    ftlId: {
      registration: 'passkey-registration-error-timeout',
      authentication: 'passkey-authentication-error-timeout',
    },
    fallbackText: {
      registration: 'Passkey setup was canceled. Try again.',
      authentication: 'Passkey request timed out. Please try again.',
    },
  },

  NotSupportedError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.NotSupported,
    logToSentry: false,
    ftlId: {
      registration: 'passkey-registration-error-not-supported',
      authentication: 'passkey-authentication-error-not-supported',
    },
    fallbackText: {
      registration: `Passkeys aren’t supported here. Try another method or device.`,
      authentication: `Passkeys aren’t supported. Try another method or device.`,
    },
  },
  SecurityError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.Security,
    logToSentry: false,
    ftlId: {
      registration: 'passkey-registration-error-security',
      authentication: 'passkey-authentication-error-security',
    },
    fallbackText: {
      registration: `Passkeys can’t be set up on this page. Use the secure site and try again.`,
      authentication: `Passkeys can’t be used on this page. Check you’re on the correct secure site and try again.`,
    },
  },
  InvalidStateError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.InvalidState,
    logToSentry: false,
    ftlId: {
      registration: 'passkey-registration-error-invalid-state',
      authentication: 'passkey-authentication-error-invalid-state',
    },
    fallbackText: {
      registration:
        'This passkey is already registered. Use it to sign in or add a different passkey.',
      authentication:
        'Something went wrong with your passkey. Try again or use another sign-in method.',
    },
  },
  NotReadableError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.NotReadable,
    logToSentry: false,
    ftlId: {
      registration: 'passkey-registration-error-not-readable',
      authentication: 'passkey-authentication-error-not-readable',
    },
    fallbackText: {
      registration: `We couldn’t access the authenticator. Try again or choose another method.`,
      authentication: `We couldn’t access the authenticator. Try again or use another sign-in method.`,
    },
  },

  TypeError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Type,
    logToSentry: true,
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  DataError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Data,
    logToSentry: true,
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  EncodingError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Encoding,
    logToSentry: true,
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  ConstraintError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Constraint,
    logToSentry: true,
    ftlId: {
      registration: 'passkey-registration-error-constraint',
      authentication: 'passkey-authentication-error-unexpected',
    },
    fallbackText: {
      registration: `Passkey setup isn’t available with this device. Try another method or device.`,
      authentication: UNEXPECTED_FALLBACK.authentication,
    },
  },
  OperationError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Operation,
    logToSentry: true,
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  UnknownError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Unknown,
    logToSentry: true,
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
};

/** Never throws; unrecognized errors default to the 'unexpected' category. */
export function categorizeWebAuthnError(
  error: unknown,
  operation: WebAuthnOperation
): CategorizedWebAuthnError {
  const name =
    error instanceof TypeError
      ? 'TypeError'
      : error instanceof DOMException
        ? error.name
        : null;

  if (name !== null) {
    const entry = ERROR_MAP[name];
    if (entry) {
      return {
        category: entry.category,
        errorType: entry.errorType,
        ftlId: entry.ftlId[operation],
        fallbackText: entry.fallbackText[operation],
        logToSentry: entry.logToSentry,
      };
    }
  }

  return {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Unknown,
    ftlId: UNEXPECTED_FTL_ID[operation],
    fallbackText: UNEXPECTED_FALLBACK[operation],
    logToSentry: true,
  };
}

/** Categorizes and reports to Sentry when logToSentry is true. */
export function handleWebAuthnError(
  error: unknown,
  operation: WebAuthnOperation,
  captureException: (error: unknown) => void
): CategorizedWebAuthnError {
  const categorized = categorizeWebAuthnError(error, operation);
  if (categorized.logToSentry) {
    captureException(error);
  }
  return categorized;
}
