/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Which WebAuthn ceremony produced the error. Determines user-facing message. */
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
  /** High-level grouping for Sentry routing and UI messaging strategy. */
  category: WebAuthnErrorCategory;
  /** Specific error type, useful for metrics and fine-grained UI messaging. */
  errorType: WebAuthnErrorType;
  /** FTL key for the user-facing error message. Operation-specific where messages differ. */
  userMessageKey: string;
  /** When true, the caller should report this error to Sentry. */
  logToSentry: boolean;
}

interface ErrorEntry {
  category: WebAuthnErrorCategory;
  errorType: WebAuthnErrorType;
  logToSentry: boolean;
  /** Per-operation FTL keys. Separate keys allow distinct user-facing copy per context. */
  messageKeys: Record<WebAuthnOperation, string>;
}

const ERROR_MAP: Readonly<Record<string, ErrorEntry>> = {
  NotAllowedError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.NotAllowed,
    logToSentry: false,
    messageKeys: {
      registration: 'passkey-registration-error-not-allowed',
      authentication: 'passkey-authentication-error-not-allowed',
    },
  },
  TimeoutError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.Timeout,
    logToSentry: false,
    messageKeys: {
      registration: 'passkey-registration-error-timeout',
      authentication: 'passkey-authentication-error-timeout',
    },
  },

  NotSupportedError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.NotSupported,
    logToSentry: false,
    messageKeys: {
      registration: 'passkey-registration-error-not-supported',
      authentication: 'passkey-authentication-error-not-supported',
    },
  },
  SecurityError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.Security,
    logToSentry: false,
    messageKeys: {
      registration: 'passkey-registration-error-security',
      authentication: 'passkey-authentication-error-security',
    },
  },
  // Registration: credential already exists on this authenticator for this RP.
  InvalidStateError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.InvalidState,
    logToSentry: false,
    messageKeys: {
      registration: 'passkey-registration-error-invalid-state',
      authentication: 'passkey-authentication-error-invalid-state',
    },
  },
  // Authenticator I/O failure (e.g., security key unplugged mid-ceremony).
  NotReadableError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.NotReadable,
    logToSentry: false,
    messageKeys: {
      registration: 'passkey-registration-error-not-readable',
      authentication: 'passkey-authentication-error-not-readable',
    },
  },

  // TypeError is not a DOMException — handled via instanceof in categorizeWebAuthnError.
  TypeError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Type,
    logToSentry: true,
    messageKeys: {
      registration: 'passkey-registration-error-unexpected',
      authentication: 'passkey-authentication-error-unexpected',
    },
  },
  // Malformed encoding in create()/get() options (invalid base64url, bad credential ID format).
  DataError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Data,
    logToSentry: true,
    messageKeys: {
      registration: 'passkey-registration-error-unexpected',
      authentication: 'passkey-authentication-error-unexpected',
    },
  },
  // Thrown by parseCreationOptionsFromJSON() / parseRequestOptionsFromJSON() for malformed options.
  EncodingError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Encoding,
    logToSentry: true,
    messageKeys: {
      registration: 'passkey-registration-error-unexpected',
      authentication: 'passkey-authentication-error-unexpected',
    },
  },
  // Registration has distinct copy: "not available with this device".
  ConstraintError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Constraint,
    logToSentry: true,
    messageKeys: {
      registration: 'passkey-registration-error-constraint',
      authentication: 'passkey-authentication-error-unexpected',
    },
  },
  OperationError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Operation,
    logToSentry: true,
    messageKeys: {
      registration: 'passkey-registration-error-unexpected',
      authentication: 'passkey-authentication-error-unexpected',
    },
  },
  // Thrown by our wrappers when the browser returns a null or unexpected credential type.
  UnknownError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Unknown,
    logToSentry: true,
    messageKeys: {
      registration: 'passkey-registration-error-unexpected',
      authentication: 'passkey-authentication-error-unexpected',
    },
  },
};

/**
 * Translates a raw error thrown by createCredential() or getCredential() into
 * a semantic, UI-safe error category with an operation-specific FTL message key.
 *
 * Never throws; unrecognized errors default to the 'unexpected' category.
 */
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
        userMessageKey: entry.messageKeys[operation],
        logToSentry: entry.logToSentry,
      };
    }
  }

  return {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Unknown,
    userMessageKey: `passkey-${operation}-error-unexpected`,
    logToSentry: true,
  };
}

/**
 * Categorizes a WebAuthn error and fires captureException when logToSentry is
 * true. Intended as the single call site in each flow's error handler.
 *
 * @param captureException — pass Sentry.captureException or equivalent.
 */
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
