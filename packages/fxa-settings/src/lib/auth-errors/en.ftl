## Auth-server based errors that originate from backend service

auth-error-102 = Unknown account
auth-error-103 = Incorrect password
auth-error-105-2 = Invalid confirmation code
auth-error-110 = Invalid token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = You’ve tried too many times. Please try again later.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = You’ve tried too many times. Please try again { $retryAfter }.
auth-error-125 = The request was blocked for security reasons
auth-error-129 = Invalid phone number
auth-error-138-2 = Unconfirmed session
auth-error-139 = Secondary email must be different than your account email
auth-error-155 = TOTP token not found
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Backup authentication code not found
auth-error-159 = Invalid account recovery key
auth-error-183-2 = Invalid or expired confirmation code
auth-error-202 = Feature not enabled
auth-error-203 = System unavailable, try again soon
auth-error-206 = Can not create password, password already set
auth-error-214 = Recovery phone number already exists
auth-error-215 = Recovery phone number does not exist
auth-error-216 = Text message limit reached
auth-error-218 = Unable to remove recovery phone, missing backup authentication codes.
auth-error-219 = This phone number has been registered with too many accounts. Please try a different number.
auth-error-999 = Unexpected error
auth-error-1001 = Login attempt cancelled
auth-error-1002 = Session expired. Sign in to continue.
auth-error-1003 = Local storage or cookies are still disabled
auth-error-1008 = Your new password must be different
auth-error-1010 = Valid password required
auth-error-1011 = Valid email required
auth-error-1018 = Your confirmation email was just returned. Mistyped email?
auth-error-1020 = Mistyped email? firefox.com isn’t a valid email service
auth-error-1031 = You must enter your age to sign up
auth-error-1032 = You must enter a valid age to sign up
auth-error-1054 = Invalid two-step authentication code
auth-error-1056 = Invalid backup authentication code
auth-error-1062 = Invalid redirect
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Mistyped email? { $domain } isn’t a valid email service
auth-error-1066 = Email masks can’t be used to create an account.
auth-error-1067 = Mistyped email?
