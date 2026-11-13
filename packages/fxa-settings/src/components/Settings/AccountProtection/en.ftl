## AccountProtection
## Settings card recommending optional ways to protect the account. Only lists what the account
## can still set up. With one option left, it shows that option on its own.

# Variables:
#   $count (Number) - how many options are listed, always 2 or more
account-protection-heading = { $count ->
    [one] { $count } way to protect your account
   *[other] { $count } ways to protect your account
  }
account-protection-show = Show
account-protection-hide = Hide
# Shown under the heading, so it describes the whole list.
account-protection-note = Optional. Together, these help keep others out and help you get back in if you lose access.

account-protection-passkey = Create a passkey
account-protection-passkey-action = Create
account-protection-two-step-auth = Turn on two-step authentication
account-protection-two-step-auth-action = Turn on
account-protection-recovery-key = Create an account recovery key
account-protection-recovery-key-action = Create

account-protection-featured-passkey-heading = Sign in faster with a passkey
account-protection-featured-passkey-description = Use your fingerprint, face or device PIN.
account-protection-featured-passkey-action = Create passkey
account-protection-featured-two-step-auth-heading = Add a second step to sign in
account-protection-featured-two-step-auth-description = Use a code from an authenticator app when you sign in with your password.
account-protection-featured-two-step-auth-action = Turn on
account-protection-featured-recovery-key-heading = Keep your synced data safe
account-protection-featured-recovery-key-description = An account recovery key restores it if you forget your password.
account-protection-featured-recovery-key-action = Create key
# Accessible name for the button that hides the single-option card.
account-protection-dismiss = Dismiss
