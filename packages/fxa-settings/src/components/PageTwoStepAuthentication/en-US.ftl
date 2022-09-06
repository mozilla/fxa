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
tfa-cannot-verify-code-3 = There was a problem confirming your backup authentication code
tfa-incorrect-recovery-code = Incorrect backup authentication code
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

tfa-enter-totp = Now enter the security code from the authentication app.
tfa-input-enter-totp =
 .label = Enter security code
tfa-save-these-codes = Save these one-time use backup authentication codes in a safe place for when
  you don’t have your mobile device.

<<<<<<< HEAD
tfa-enter-code-to-confirm = Please enter one of your backup authentication codes now to
  confirm you’ve saved it. You’ll need a code if you lose your device and want
  to access your account.
tfa-enter-recovery-code =
=======
tfa-enter-code-to-confirm-1 = Please enter one of your backup authentication codes now to
  confirm you’ve saved it. You’ll need a code to login if you don’t have access to your
  mobile device.
tfa-enter-recovery-code-1 =
>>>>>>> 782bda91e4 (Update text on 2fa enter code to confirm screen)
 .label = Enter a backup authentication code

##
