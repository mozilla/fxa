## Passkey error messages
## Surfaced when a WebAuthn ceremony (registration or sign-in) fails.

# Registration errors

# User cancelled or dismissed the browser prompt, or the authenticator could not satisfy the options
passkey-registration-error-not-allowed = Passkey setup failed or is unavailable. Try again or choose another method.

# Shown on NotAllowedError when the account already has passkeys (excludeCredentials was sent).
# Firefox collapses user-cancel and duplicate-authenticator into the same error, but duplicate is
# the far more likely cause when the user has existing passkeys, so we state it plainly.
passkey-registration-error-not-allowed-existing = Passkey setup isn’t available with this device. Either the device has already been registered or the setup process was cancelled.

# The ceremony timed out before the user responded
passkey-registration-error-timeout = Passkey setup was canceled. Try again.

passkey-registration-canceled-v2 = Passkey setup timed out or was cancelled.
# Link label appended after passkey-registration-canceled-v2, opens a SUMO support article.
passkey-registration-canceled-link = Learn more

# Browser or platform does not support passkeys or the requested options (e.g., user verification, discoverable credential).
passkey-registration-error-not-supported-v2 = Your browser or device doesn’t support passkeys.
# Link label appended after passkey-registration-error-not-supported-v2, opens a SUMO support article.
passkey-registration-error-not-supported-link = Learn more

# Generic fallback shown when passkey setup fails for an indeterminate reason.
# Keep the tone neutral; do not imply the device is unsupported or that the user cancelled.
# "method" here means an alternative way to create the passkey (e.g. another password manager or security key), not a different account or sign-in option.
passkey-registration-error-could-not-complete = Passkey setup couldn’t be completed. Try a different method or device.
# Link label appended after passkey-registration-error-could-not-complete, opens a SUMO support article.
passkey-registration-error-could-not-complete-link = Learn more

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

# Shown as a warning (not error) banner when a passkey sign-in is cancelled, no passkey is
# available on this device, or the authenticator can't satisfy the request. Copy stays neutral and
# points the user to another way to sign in.
passkey-authentication-trouble-heading = Couldn’t sign in with a passkey
# Shown when a passkey sign-in doesn't complete. "Try again" means retry signing in with the
# passkey; "another sign-in option" means one of the other sign-in methods offered alongside it.
passkey-authentication-trouble-description = Try again or use another sign-in option.
# Label for the support link in the passkey sign-in trouble message; opens a SUMO article about
# using passkeys.
passkey-authentication-trouble-link = How to use passkeys

# User cancelled or dismissed the browser prompt, or no passkey is available / verification failed
passkey-authentication-error-not-allowed = Sign-in with passkey failed or is unavailable. Try again or choose another method.

# User already registered a device
passkey-authentication-error-not-allowed-existing = Passkey setup isn’t available with this device. Please try again or choose another method.

# The ceremony timed out before the user responded
passkey-authentication-error-timeout = Passkey request timed out. Please try again.
# Shown in a warning (not error) banner when the passkey sign-in ceremony times out.
passkey-authentication-error-timeout-v2 = Passkey sign-in timed out. Try again.

# Browser or platform does not support passkeys
passkey-authentication-error-not-supported-v2 = Your browser or device doesn’t support passkeys.

# RP ID / origin mismatch, or insecure context (e.g., embedded iframe)
passkey-authentication-error-security = Passkeys can’t be used on this page. Check you’re on the correct secure site and try again.

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
