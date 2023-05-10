## Auth-server based errors that originate from backend service

auth-error-102 = Unknown account
auth-error-103 = Incorrect password
auth-error-105-2 = Invalid confirmation code
auth-error-110 = Invalid token
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = You’ve tried too many times. Please try again { $retryAfter }.
auth-error-138-2 = Unconfirmed session
auth-error-139 = Secondary email must be different than your account email
auth-error-155 = TOTP token not found
auth-error-183-2 = Invalid or expired confirmation code
auth-error-999 = Unexpected error
auth-error-1003 = Local storage or cookies are still disabled
auth-error-1008 = Your new password must be different
auth-error-1011 = Valid email required
