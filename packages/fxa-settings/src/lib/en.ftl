# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Number ending in { $lastFourPhoneNumber }
# This error is shown when there is a particular kind of error at the very end of the 2FA flow
# and the user should begin it again. A system/device clock not being synced to the internet time is
# a common problem when using 2FA.
two-factor-auth-setup-token-verification-error = There was a problem enabling two-step authentication. Check that your device’s clock is set to update automatically and <a>start over</a>.
