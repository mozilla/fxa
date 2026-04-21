## UnitRowPasskey

passkey-row-header = Passkeys
passkey-row-enabled = Enabled
passkey-row-not-set = Not set
passkey-row-action-create = Create
passkey-row-description = Make sign in easier and more secure by using your phone or other supported device to get into your account.
# External link to a support article about passkeys.
passkey-row-info-link-2 = Learn more
# Shown as a warning banner when the user has registered the maximum number of passkeys.
# Variables:
#   $count (Number) - the maximum number of passkeys allowed (defaults to 10 allowed)
passkey-row-max-limit-banner =
    { $count ->
       *[other] You’ve used all { $count } passkeys. Delete a passkey to create a new one.
    }
# Tooltip shown on the disabled Create button when the passkey limit is reached
passkey-row-max-limit-disabled-reason = You’ve reached the maximum number of passkeys.

## Error / limit messages

# Shown as an error banner when the user's browser or device does not support passkeys (WebAuthn Level 3).
passkey-row-webauthn-not-supported = Your browser or device doesn’t support passkeys.

##
