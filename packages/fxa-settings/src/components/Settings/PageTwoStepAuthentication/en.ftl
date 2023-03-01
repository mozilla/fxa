## Two Step Authentication

tfa-title = Two-step authentication

tfa-step-1-3 = Step 1 of 3
tfa-step-2-3 = Step 2 of 3
tfa-step-3-3 = Step 3 of 3

tfa-button-continue = Continue
tfa-button-cancel = Cancel
tfa-button-finish = Finish

tfa-incorrect-totp = Incorrect two-step authentication code
tfa-cannot-retrieve-code = There was a problem retrieving your code.
tfa-cannot-verify-code-4 = There was a problem confirming your backup authentication code
tfa-incorrect-recovery-code-1 = Incorrect backup authentication code
tfa-enabled = Two-step authentication enabled

tfa-scan-this-code = Scan this QR code using one of <linkExternal>these
  authentication apps</linkExternal>.

# This is the image alt text for a QR code.
# Variables:
#   $secret (String) - a long alphanumeric string that does not require translation
# DEV NOTE: Set image alt text per fluent/react documentation, do not use the below as an example
tfa-qa-code-alt = Use the code { $secret } to set up two-step authentication in supported applications.
tfa-qa-code =
  .alt = { tfa-qa-code-alt }
tfa-button-cant-scan-qr = Can’t scan code?

# When the user cannot use a QR code.
tfa-enter-secret-key = Enter this secret key into your authenticator app:

tfa-enter-totp-v2 = Now enter the authentication code from the authentication app.
tfa-input-enter-totp-v2 =
 .label = Enter authentication code
tfa-save-these-codes-1 = Save these one-time use backup authentication codes in a safe place for when
  you don’t have your mobile device.

tfa-enter-code-to-confirm-1 = Please enter one of your backup authentication codes now to
  confirm you’ve saved it. You’ll need a code to login if you don’t have access to your
  mobile device.
tfa-enter-recovery-code-1 =
 .label = Enter a backup authentication code

##
