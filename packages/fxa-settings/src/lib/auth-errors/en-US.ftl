## Auth-server based errors that originate from backend service

auth-error-102 = Unknown account
auth-error-103 = Incorrect password
auth-error-105 = Invalid verification code
auth-error-110 = Invalid token
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. This text is localized
#                          by our server based on accept language in request. Our timestamp
#                          formatting library (momentjs) will automatically add the word `in`
#                          as part of the string.
#                           (for example: "in 15 minutes")
auth-error-114 = You've tried too many times. Please try again { $retryAfter }.
auth-error-138 = Unverified session
auth-error-155 = TOTP token not found
auth-error-1008 = Your new password must be different
