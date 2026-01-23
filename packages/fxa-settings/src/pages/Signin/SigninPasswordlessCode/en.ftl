# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

## SigninPasswordlessCode page
## Users are prompted to enter a code sent to their email for passwordless authentication.

signin-passwordless-code-heading = Enter confirmation code

# { $email } - email address to which the code was sent
signin-passwordless-code-instruction = Enter the 8-digit code that was sent to <email>{ $email }</email> within 10 minutes.

signin-passwordless-code-input-label = Enter 8-digit code

signin-passwordless-code-confirm-button = Confirm

signin-passwordless-code-required-error = Confirmation code required

signin-passwordless-code-expired = Code expired?

# { $seconds } - countdown timer showing seconds until user can request a new code
signin-passwordless-code-resend-countdown = Email new code in { $seconds } seconds

signin-passwordless-code-resend-link = Email new code.

signin-passwordless-code-resend-error = Something went wrong. A new code could not be sent.

## SignupPasswordlessCode page
## Users are prompted to enter a code sent to their email to create a new account without a password.

signup-passwordless-code-heading = Create your account

# { $email } - email address to which the code was sent
signup-passwordless-code-instruction = Enter the 8-digit code that was sent to <email>{ $email }</email> to create your account.

## Error messages

# Shown when a user with 2FA enabled tries to use passwordless flow
# They are redirected to password signin instead
signin-passwordless-totp-required = Two-step authentication is enabled on your account. Please sign in with your password.
