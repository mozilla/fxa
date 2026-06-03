## Passkey error messages
## Surfaced when a WebAuthn ceremony (registration or sign-in) fails.

# Registration errors

# Shown on NotAllowedError when the account already has passkeys (excludeCredentials was sent).
# Firefox collapses user-cancel and duplicate-credential into the same error; when existing
# passkeys are present we lean toward the duplicate interpretation. Chrome surfaces the same
# case as InvalidStateError, which uses passkey-registration-error-invalid-state.
passkey-registration-error-not-allowed-existing-v2 = Passkey setup couldn’t be completed. The passkey may already be registered. Try another device or method.
# Link label appended after passkey-registration-error-not-allowed-existing-v2, opens a SUMO support article.
passkey-registration-error-not-allowed-existing-link = Learn more

# NotAllowedError catch-all: cancel, dismiss, UV failure, no suitable authenticator, etc.
# Also surfaced for AbortError on non-spec-compliant browsers.
passkey-registration-error-not-allowed-v2 = Passkey setup couldn’t be completed.
passkey-registration-error-not-allowed-link = Learn more

# TimeoutError, on browsers that surface it distinctly from NotAllowedError.
passkey-registration-error-timeout-v2 = Passkey setup timed out.
passkey-registration-error-timeout-link = Learn more

# User clicked the in-page Cancel link while the ceremony was still pending
passkey-registration-canceled = Passkey setup was canceled. Try again.

# Browser or platform does not support passkeys or the requested options (e.g., user verification, discoverable credential).
passkey-registration-error-not-supported-v3 = This device couldn’t complete the passkey setup. Try another device or method.
# Link label appended after passkey-registration-error-not-supported-v2, opens a SUMO support article.
passkey-registration-error-not-supported-link = Learn more

# RP ID / origin mismatch, or insecure context (e.g., embedded iframe, wrong domain)
passkey-registration-error-security-v2 = There’s a problem with the secure setup of this page. Try again later.

# A credential for this RP already exists on the authenticator (excludeCredentials match)
passkey-registration-error-invalid-state = This passkey is already registered. Use it to sign in or add a different passkey.

# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-registration-error-not-readable = We couldn’t access the authenticator. Try again or choose another method.

# Attestation constraints or device-specific restrictions can't be met
passkey-registration-error-constraint = Passkey setup isn’t available with this device. Try another method or device.

# Catch-all for unexpected errors during registration (TypeError, DataError, EncodingError, OperationError, UnknownError)
passkey-registration-error-unexpected = Passkey setup failed. Try again or choose another method.

# Authentication errors

# User cancelled or dismissed the browser prompt, or no passkey is available / verification failed
passkey-authentication-error-not-allowed = Sign-in with passkey failed or is unavailable. Try again or choose another method.

# User already registered a device
passkey-authentication-error-not-allowed-existing = Passkey setup isn’t available with this device. Please try again or choose another method.

# The ceremony timed out before the user responded
passkey-authentication-error-timeout = Passkey request timed out. Please try again.

# Browser or platform does not support passkeys
passkey-authentication-error-not-supported-v3 = This device couldn’t complete sign-in with a passkey. Try another sign-in method.

# RP ID / origin mismatch, or insecure context (e.g., embedded iframe)
passkey-authentication-error-security-v2 = There’s a problem with the secure setup of this page. Try again later.

# Unexpected credential state during authentication
passkey-authentication-error-invalid-state = Something went wrong with your passkey. Try again or use another sign-in method.

# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-authentication-error-not-readable = We couldn’t access the authenticator. Try again or use another sign-in method.

# Catch-all for unexpected errors during authentication (TypeError, DataError, EncodingError, ConstraintError, OperationError, UnknownError)
passkey-authentication-error-unexpected = Something went wrong. Try again or choose another sign-in method.

# Server returned 404 PASSKEY_NOT_FOUND — the assertion was for a credential
# that no longer exists on the account (e.g., the user deleted the passkey
# from their account but the authenticator still has the credential).
passkey-authentication-error-not-found = Passkey not recognized. Use another sign-in method.
