## ModalMfaProtected

modal-mfa-protected-title = Enter confirmation code
modal-mfa-protected-subtitle = Help us make sure it’s you changing your account info
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction = { $expirationTime ->
    [one] Enter the code that was sent to <email>{ $email }</email> within { $expirationTime } minute.
    *[other] Enter the code that was sent to <email>{ $email }</email> within { $expirationTime } minutes.
  }
modal-mfa-protected-input-label = Enter 6-digit code
modal-mfa-protected-cancel-button = Cancel
modal-mfa-protected-confirm-button = Confirm

modal-mfa-protected-code-expired = Code expired?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Email new code.

##
