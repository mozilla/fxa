# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

## SigninPasswordlessCode page
## Users are prompted to enter a code sent to their email for passwordless authentication.

signin-passwordless-code-heading = Enter confirmation code

signin-passwordless-code-subheading = Sign-in only takes a single step when you use this code. 

# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationMinutes (Number) - the expiration time in minutes
signin-passwordless-code-instruction = { $expirationMinutes ->
    [one] Enter the code that was sent to <email>{ $email }</email> within { $expirationMinutes } minute.
    *[other] Enter the code that was sent to <email>{ $email }</email> within { $expirationMinutes } minutes.
  }

signin-passwordless-code-input-label-v2 = Enter 6-digit code

signin-passwordless-code-confirm-button = Confirm

signin-passwordless-code-required-error = Confirmation code required

signin-passwordless-code-expired = Code expired?

# { $seconds } - countdown timer showing seconds until user can request a new code
signin-passwordless-code-resend-countdown = { $seconds ->
    [one] Email new code in { $seconds } second
    *[other] Email new code in { $seconds } seconds 
  } 

signin-passwordless-code-resend-link = Email new code.

signin-passwordless-code-resend-error = Something went wrong. A new code could not be sent.

signin-passwordless-code-other-account-link = Use a different account

## SignupPasswordlessCode page
## Users are prompted to enter a code sent to their email to create a new account without a password.

signup-passwordless-code-subheading = Sign-up only takes a single step when you use this code. 

## Error messages

# Shown when a user with 2FA enabled tries to use passwordless flow
# They are redirected to password signin instead
signin-passwordless-totp-required = Two-step authentication is enabled on your account. Please sign in with your password.

# Browser tab title for the page where the user enters the confirmation code emailed to them to sign in to their account.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signin-passwordless-code-page-title = Sign in with email code

# Browser tab title for the page where the user enters the confirmation code emailed to them to sign up for an account.
# Shown in the browser tab, followed by “– Mozilla accounts”. Keep it short, since tabs cut off long titles.
signup-passwordless-code-page-title = Sign up with email code
