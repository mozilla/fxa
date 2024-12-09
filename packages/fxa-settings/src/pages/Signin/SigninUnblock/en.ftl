## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Authorize this sign-in
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Check your email for the authorization code sent to { $email }.
signin-unblock-code-input = Enter authorization code
signin-unblock-submit-button = Continue
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Authorization code required
signin-unblock-code-incorrect-length = Authorization code must contain 8 characters
signin-unblock-code-incorrect-format-2 = Authorization code can only contain letters and/or numbers
signin-unblock-resend-code-button = Not in inbox or spam folder? Resend
signin-unblock-support-link = Why is this happening?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.
