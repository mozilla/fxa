## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Enter confirmation code<span> for your { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction = Enter the code that was sent to { $email } within 5 minutes.
signin-token-code-input-label-v2 = Enter 6-digit code
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirm
signin-token-code-code-expired = Code expired?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Email new code.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Confirmation code required
signin-token-code-resend-error = Something went wrong. A new code could not be sent.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.
