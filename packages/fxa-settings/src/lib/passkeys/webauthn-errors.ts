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
  /** WebAuthn L3 §5.1.3.1, §5.1.4.3 — anti-fingerprinting catch-all. */
  NotAllowed = 'NotAllowedError',
  /** WebAuthn L3 §5.6, §5.1.4.3 — ceremony cancelled via AbortController. */
  Abort = 'AbortError',
  /** Not in WebAuthn L3 exceptions list; some browsers surface it distinctly. */
  Timeout = 'TimeoutError',
  /** WebAuthn L3 §5.1.3.1 — pubKeyCredParams unsupported by authenticator. */
  NotSupported = 'NotSupportedError',
  /** WebAuthn L3 §5.1.3.1, §5.1.4.3 — effective domain / rp.id invalid. */
  Security = 'SecurityError',
  /** WebAuthn L3 §5.1.3.1 — registration only: excludeCredentials match. */
  InvalidState = 'InvalidStateError',
  /** Not in WebAuthn L3 exceptions list; authenticator I/O failure. */
  NotReadable = 'NotReadableError',
  /** WebAuthn L3 §5.1.3 — invalid options. Developer/integration bug. */
  Type = 'TypeError',
  /** Authenticator constraint failure (attestation / device restrictions). */
  Constraint = 'ConstraintError',
  /** Catch-all DOMException for unexpected ceremony failures. */
  Data = 'DataError',
  Encoding = 'EncodingError',
  Operation = 'OperationError',
  Unknown = 'UnknownError',
  // Synthetic — set by the categorizer for NotAllowedError +
  // hadExcludeCredentials=true (Firefox collapses InvalidStateError into
  // NotAllowedError on registration).
  AlreadyRegistered = 'AlreadyRegistered',
}

/**
 * Reason value reported in Glean `*_submit_frontend_error` events. The
 * taxonomy in FXA-13475 collapses the larger DOMException set to five
 * buckets, so error-shape changes inside the same bucket don't fragment
 * the metric.
 */
export type WebAuthnGleanReason =
  | 'not_allowed'
  | 'abort'
  | 'not_supported'
  | 'security'
  | 'timeout'
  | 'not_readable'
  | 'unexpected'
  | 'already_registered';

/**
 * Superset of `WebAuthnGleanReason` used by the passkey sign-in submit
 * events. Adds `no_passkey_found` for the server-side errno path that
 * never reaches a WebAuthn ceremony.
 */
export type PasskeySignInGleanReason = WebAuthnGleanReason | 'no_passkey_found';

export interface CategorizedWebAuthnError {
  category: WebAuthnErrorCategory;
  errorType: WebAuthnErrorType;
  ftlId: string;
  fallbackText: string;
  logToSentry: boolean;
  gleanReason: WebAuthnGleanReason;
}

interface ErrorEntry {
  category: WebAuthnErrorCategory;
  errorType: WebAuthnErrorType;
  logToSentry: boolean;
  gleanReason: Record<WebAuthnOperation, WebAuthnGleanReason>;
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

const AUTHENTICATOR_ALREADY_REGISTERED_FTL_ID: Record<
  WebAuthnOperation,
  string
> = {
  registration: 'passkey-registration-error-not-allowed-existing',
  authentication: 'passkey-authentication-error-not-allowed-existing',
};

const AUTHENTICATOR_ALREADY_REGISTERED_FALLBACK: Record<
  WebAuthnOperation,
  string
> = {
  registration: `Passkey setup isn’t available with this device. Either the device has already been registered or the setup process was cancelled.`,
  authentication: `Passkey setup isn’t available with this device. Please try again or choose another method.`,
};

/** Helper for entries whose Glean bucket is the same on both operations. */
const samePerOp = <T extends WebAuthnGleanReason>(
  reason: T
): Record<WebAuthnOperation, T> => ({
  registration: reason,
  authentication: reason,
});

export const ERROR_MAP: Record<string, ErrorEntry> = {
  // WebAuthn L3 §5.1.3.1, §5.1.4.3 — anti-fingerprinting catch-all:
  // cancel, dismiss, UV failure, no suitable authenticator, etc.
  // TimeoutError is keyed separately when surfaced distinctly.
  NotAllowedError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.NotAllowed,
    logToSentry: false,
    gleanReason: samePerOp('not_allowed'),
    ftlId: {
      registration: 'passkey-registration-error-not-allowed-v2',
      authentication: 'passkey-authentication-error-not-allowed',
    },
    fallbackText: {
      registration: 'Passkey setup couldn’t be completed.',
      authentication:
        'Sign-in with passkey failed or is unavailable. Try again or choose another method.',
    },
  },
  // WebAuthn L3 §5.6, §5.1.4.3 — ceremony cancelled via AbortController.
  // The in-page Cancel button is filtered upstream by PagePasskeyAdd's
  // wasCanceled guard. Causes reaching here are nebulous: tab close,
  // extensions or other code injecting their own AbortController, a
  // concurrent ceremony aborting the in-flight one, or older Safari/iOS
  // throwing AbortError where modern browsers throw NotAllowedError.
  // Route to the same broad copy as NotAllowed.
  AbortError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.Abort,
    logToSentry: false,
    gleanReason: samePerOp('abort'),
    ftlId: {
      registration: 'passkey-registration-error-not-allowed-v2',
      authentication: 'passkey-authentication-error-not-allowed',
    },
    fallbackText: {
      registration: 'Passkey setup couldn’t be completed.',
      authentication:
        'Sign-in with passkey failed or is unavailable. Try again or choose another method.',
    },
  },
  // Not in WebAuthn L3 exceptions list. Only surfaces on browsers that
  // distinguish TimeoutError from NotAllowedError; when it fires the
  // cause is unambiguous, so we use timeout-specific copy.
  TimeoutError: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.Timeout,
    logToSentry: false,
    gleanReason: samePerOp('timeout'),
    ftlId: {
      registration: 'passkey-registration-error-timeout-v2',
      authentication: 'passkey-authentication-error-timeout',
    },
    fallbackText: {
      registration: 'Passkey setup timed out.',
      authentication: 'Passkey request timed out. Please try again.',
    },
  },

  // WebAuthn L3 §5.1.3.1 — pubKeyCredParams unsupported by authenticator
  // (no public-key type entry, or no supported signature algorithm).
  NotSupportedError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.NotSupported,
    // Logged to Sentry — could indicate a config bug (wrong pubKeyCredParams)
    // rather than a genuine runtime authenticator limitation.
    logToSentry: true,
    gleanReason: samePerOp('not_supported'),
    ftlId: {
      registration: 'passkey-registration-error-not-supported-v3',
      authentication: 'passkey-authentication-error-not-supported-v3',
    },
    fallbackText: {
      registration: `This device couldn’t complete the passkey setup. Try another device or method.`,
      authentication: `This device couldn’t complete sign-in with a passkey. Try another sign-in method.`,
    },
  },
  // WebAuthn L3 §5.1.3.1, §5.1.4.3 — effective domain / rp.id invalid.
  SecurityError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.Security,
    // Logged to Sentry — almost always a deployment misconfiguration
    // (rp.id or effective domain mismatch).
    logToSentry: true,
    gleanReason: samePerOp('security'),
    ftlId: {
      registration: 'passkey-registration-error-security-v2',
      authentication: 'passkey-authentication-error-security-v2',
    },
    fallbackText: {
      registration: `There’s a problem with the secure setup of this page. Try again later.`,
      authentication: `There’s a problem with the secure setup of this page. Try again later.`,
    },
  },
  // WebAuthn L3 §5.1.3.1 — registration only: authenticator recognized
  // an excludeCredentials entry (duplicate-credential). Authentication
  // context isn't spec-defined for this error name.
  InvalidStateError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.InvalidState,
    logToSentry: false,
    gleanReason: {
      registration: 'already_registered',
      authentication: 'unexpected',
    },
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
  // Not in WebAuthn L3 exceptions list. Authenticator I/O failure
  // (e.g. security key disconnected mid-ceremony).
  NotReadableError: {
    category: WebAuthnErrorCategory.DevicePlatform,
    errorType: WebAuthnErrorType.NotReadable,
    logToSentry: false,
    gleanReason: samePerOp('not_readable'),
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
    gleanReason: samePerOp('unexpected'),
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  DataError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Data,
    logToSentry: true,
    gleanReason: samePerOp('unexpected'),
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  EncodingError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Encoding,
    logToSentry: true,
    gleanReason: samePerOp('unexpected'),
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  ConstraintError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Constraint,
    logToSentry: true,
    gleanReason: samePerOp('unexpected'),
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
    gleanReason: samePerOp('unexpected'),
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  UnknownError: {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Unknown,
    logToSentry: true,
    gleanReason: samePerOp('unexpected'),
    ftlId: UNEXPECTED_FTL_ID,
    fallbackText: UNEXPECTED_FALLBACK,
  },
  AuthenticatorAlreadyRegistered: {
    category: WebAuthnErrorCategory.UserAction,
    errorType: WebAuthnErrorType.AlreadyRegistered,
    logToSentry: false,
    gleanReason: samePerOp('already_registered'),
    ftlId: AUTHENTICATOR_ALREADY_REGISTERED_FTL_ID,
    fallbackText: AUTHENTICATOR_ALREADY_REGISTERED_FALLBACK,
  },
};

/**
 * Extra ceremony context that refines error categorization. Currently used to
 * disambiguate NotAllowedError during registration: Firefox collapses user-cancel
 * and excludeCredentials-duplicate into the same DOMException, so we lean on
 * context to choose a more helpful user-facing message.
 */
export interface WebAuthnErrorContext {
  /**
   * True when the registration options included a non-empty excludeCredentials
   * list (i.e., the user already has passkeys registered for this account).
   */
  hadExcludeCredentials?: boolean;
}

/** Never throws; unrecognized errors default to the 'unexpected' category. */
export function categorizeWebAuthnError(
  error: unknown,
  operation: WebAuthnOperation,
  context?: WebAuthnErrorContext
): CategorizedWebAuthnError {
  const name = (() => {
    if (error instanceof TypeError) {
      return 'TypeError';
    }

    // There is a special error message when authentication is not allowed due to the authenticator already being
    // registered.
    if (
      error instanceof DOMException &&
      error.name === 'NotAllowedError' &&
      context?.hadExcludeCredentials === true
    ) {
      return 'AuthenticatorAlreadyRegistered';
    }

    // Otherise, just return the name of the name dom exception for look up.
    if (error instanceof DOMException) {
      return error.name;
    }

    return null;
  })();

  if (name !== null) {
    const entry = ERROR_MAP[name];
    if (entry) {
      return {
        category: entry.category,
        errorType: entry.errorType,
        ftlId: entry.ftlId[operation],
        fallbackText: entry.fallbackText[operation],
        logToSentry: entry.logToSentry,
        gleanReason: entry.gleanReason[operation],
      };
    }
  }

  return {
    category: WebAuthnErrorCategory.Unexpected,
    errorType: WebAuthnErrorType.Unknown,
    ftlId: UNEXPECTED_FTL_ID[operation],
    fallbackText: UNEXPECTED_FALLBACK[operation],
    logToSentry: true,
    gleanReason: 'unexpected',
  };
}

/** Categorizes and reports to Sentry when logToSentry is true. */
export function handleWebAuthnError(
  error: unknown,
  operation: WebAuthnOperation,
  captureException: (error: unknown) => void,
  context?: WebAuthnErrorContext
): CategorizedWebAuthnError {
  const categorized = categorizeWebAuthnError(error, operation, context);
  if (categorized.logToSentry) {
    captureException(error);
  }
  return categorized;
}
