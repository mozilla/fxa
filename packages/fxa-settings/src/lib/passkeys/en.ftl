## Passkey error messages
## Surfaced when a WebAuthn ceremony (registration or sign-in) fails.

# Registration errors

# User cancelled or dismissed the browser prompt, or the authenticator could not satisfy the options
passkey-registration-error-not-allowed = Passkey setup failed or is unavailable. Try again or choose another method.

# The ceremony timed out before the user responded
passkey-registration-error-timeout = Passkey setup was canceled. Try again.

# Browser or platform does not support passkeys or the requested options (e.g., UV, discoverable credential)
passkey-registration-error-not-supported = Passkeys aren’t supported here. Try another method or device.

# RP ID / origin mismatch, or insecure context (e.g., embedded iframe, wrong domain)
passkey-registration-error-security = Passkeys can’t be set up on this page. Use the secure site and try again.

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

# The ceremony timed out before the user responded
passkey-authentication-error-timeout = Passkey request timed out. Please try again.

# Browser or platform does not support passkeys
passkey-authentication-error-not-supported = Passkeys aren’t supported. Try another method or device.

# RP ID / origin mismatch, or insecure context (e.g., embedded iframe)
passkey-authentication-error-security = Passkeys can’t be used on this page. Check you’re on the correct secure site and try again.

# Unexpected credential state during authentication
passkey-authentication-error-invalid-state = Something went wrong with your passkey. Try again or use another sign-in method.

# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-authentication-error-not-readable = We couldn’t access the authenticator. Try again or use another sign-in method.

# Catch-all for unexpected errors during authentication (TypeError, DataError, EncodingError, ConstraintError, OperationError, UnknownError)
passkey-authentication-error-unexpected = Something went wrong. Try again or choose another sign-in method.
