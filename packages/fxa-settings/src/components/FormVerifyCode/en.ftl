## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-firefox-account }"
# can stand alone as "{ -product-firefox-account }"
signin-token-code-heading = Enter confirmation code<span> for your { -product-firefox-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction = Enter the code that was sent to { $email } within 5 minutes.
signin-token-code-input-label =
  .label = Enter 6-digit code
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirm
signin-token-code-code-expired = Code expired?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Email new code.
signin-token-code-required-error = Confirmation code required
