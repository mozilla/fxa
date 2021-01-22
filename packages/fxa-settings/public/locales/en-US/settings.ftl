# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# Application

app-default-title = Firefox Accounts
app-page-title = { $title } | Firefox Accounts

## Settings Nav

nav-settings = Settings
nav-profile = Profile
nav-security = Security
nav-connected-services = Connected Services
nav-paid-subs = Paid Subscriptions
nav-email-comm = Email Communications

## Password change page
pw-change-header =
 .title = Change Password

pw-change-stay-safe = Stay safe — don't reuse passwords. Your password:
pw-change-least-8-chars = Must be at least 8 characters
pw-change-not-contain-email = Must not be your email address
pw-change-must-match = New password matches confirmation
pw-change-cancel-button = Cancel
pw-change-save-button = Save
pw-change-forgot-password-link = Forgot password?

pw-change-current-password =
 .label = Enter current password
pw-change-new-password =
 .label = Enter new password
pw-change-confirm-password =
 .label = Confirm new password

## Delete account page
delete-account-header =
 .title = Delete Account

delete-account-step-1-2 = Step 1 of 2
delete-account-step-2-2 = Step 2 of 2

delete-account-confirm-title = You've connected your Firefox account to Mozilla products that keep you secure and productive on the web:

mozilla-vpn = Mozilla VPN
firefox-lockwise = Firefox Lockwise
firefox-monitor = Firefox Monitor

delete-account-acknowledge = Please acknowledge that by deleting your account:

delete-account-chk-box-1 =
 .label = Any paid subscriptions you have will be cancelled
delete-account-chk-box-2 =
 .label = Any may lose saved information and features within Mozilla products
delete-account-chk-box-3 =
 .label = Reactivating with this email may not restore your saved information
delete-account-chk-box-4 =
 .label = Any extensions and themes that you published to addons.mozilla.org will be deleted

delete-account-close-button = Close
delete-account-continue-button = Continue

delete-account-password-input =
 .label = Enter password

delete-account-cancel-button = Cancel
delete-account-delete-button = Delete Account

## Display name page
display-name-input =
 .label = Enter display name
submit-display-name = Save
cancel-display-name = Cancel

## Two Step Authentication

tfa-title = Two Step Authentication

tfa-step-1-3 = Step 1 of 3
tfa-step-2-3 = Step 2 of 3
tfa-step-3-3 = Step 3 of 3

tfa-button-continue = Continue
tfa-button-cancel = Cancel
tfa-button-finish = Finish

tfa-incorrect-totp = Incorrect two-step authentication code
tfa-cannot-retrieve-code = There was a problem retrieving your code.
tfa-cannot-verify-code = There was a problem verifiying your recovery code.
tfa-incorrect-recovery-code = Incorrect recovery code
tfa-enabled = Two-step authentication enabled

tfa-scan-this-code = Scan this QR code using one of <linkExternal>these
  authentication apps</linkExternal>.

# Image alt text on QR code. $secret is a long alphanumeric string.
tfa-qa-code-alt = Use the code { $secret } to set up two-step authentication in
  supported applications.
tfa-button-cant-scan-qr = Can't scan code?

# When the user cannot use a QR code.
tfa-enter-secret-key = Enter this secret key into your authenticator app:

tfa-enter-totp = Now enter the security code from the authentication app.
tfa-input-enter-totp =
 .label = Enter security code
tfa-save-these-codes = Save these one-time use codes in a safe place for when
  you don’t have your mobile device.

tfa-enter-code-to-confirm = Please enter one of your recovery codes now to
  confirm you've saved it. You'll need a code if you lose your device and want
  to access your account.
tfa-enter-recovery-code =
 .label = Enter a recovery code

## Backend failure based errors
auth-error-998 = System unavailable, try again soon
auth-error-999 = Unexpected error

## Auth-server based errors that originate from backend service
auth-error-101 = Account already exists
auth-error-102 = Unknown account
auth-error-120 = Incorrect email case
auth-error-103 = Incorrect password
auth-error-104 = Unverified account
auth-error-105 = Invalid verification code
auth-error-106 = Invalid JSON in request body
auth-error-109 = Invalid request signature
auth-error-110 = Invalid token
auth-error-111 = Invalid timestamp in request signature
auth-error-112 = Missing content-length header
auth-error-113 = Request body too large
auth-error-114 = You've tried too many times. Try again later.
auth-error-115 = Invalid nonce in request signature
auth-error-125 = The request was blocked for security reasons
auth-error-126 = Your account has been locked for security reasons
auth-error-127 = Invalid authorization code
auth-error-129 = Invalid phone number
auth-error-130 = Cannot send to this country
auth-error-131 = SMS ID invalid
auth-error-132 = Could not send a message to this number
auth-error-133 = Your email was just returned
auth-error-134 = Your email was just returned. Mistyped email?
auth-error-135 = Unable to deliver email
auth-error-136 = This email was already verified by another user
auth-error-138 = Unverified session
auth-error-139 = Secondary email must be different than your account email
auth-error-140 = Account already exists
auth-error-141 = Account already exists
auth-error-142 = Primary account email required for sign-in
auth-error-144 = Address in use by another account
auth-error-145 = Primary account email required for reset
auth-error-146 = Invalid signin code
auth-error-147 = Can not change primary email to an unverified email
auth-error-148 = Can not change primary email to an email that does not belong to this account
auth-error-149 = This email can not currently be used to login
auth-error-150 = Can not change primary email to an email that does not belong to this account
auth-error-151 = Failed to send email
auth-error-152 = Valid code required
auth-error-153 = This verification code has expired
auth-error-154 = A TOTP token already exists for this account
auth-error-155 = TOTP token not found
auth-error-156 = Recovery code not found
auth-error-157 = Unavailable device command
auth-error-158 = Recovery key not found
auth-error-159 = Invalid recovery key
auth-error-160 = This request requires two step authentication enabled on your account.
auth-error-165 = Failed due to a conflicting request, please try again.
auth-error-170 = This request requires two step authentication enabled on your account.
auth-error-176 = Unknown customer for subscription.
auth-error-177 = Unknown subscription.
auth-error-178 = Unknown plan for subscription.
auth-error-179 = Invalid payment token for subscription.
auth-error-180 = Subscription has already been cancelled
auth-error-181 = Update was rejected, please try again
auth-error-183 = Invalid or expired verification code
auth-error-188 = You have reached the maximum allowed secondary emails
auth-error-189 = This email already exists on your account
auth-error-190 = Could not update Ecosystem Anon ID because precondition failed.
auth-error-201 = Server busy, try again soon
auth-error-202 = Feature not enabled
auth-error-203 = System unavailable, try again soon
auth-error-204 = System unavailable, try again soon
auth-error-116 = This endpoint is no longer supported

# Auth based errors surfaced to users, ie through settings UI
auth-error-1001 = Login attempt cancelled
auth-error-1002 = Session expired. Sign in to continue.
auth-error-1003 = Cookies are still disabled
auth-error-1004 = Passwords do not match
auth-error-1005 = Working…
auth-error-1006 = Could not get Privacy Notice
auth-error-1007 = Could not get Terms of Service
auth-error-1008 = Your new password must be different
auth-error-1009 = Must be at least 8 characters
auth-error-1010 = Valid password required
auth-error-1011 = Valid email required
auth-error-1013 = A usable image was not found
auth-error-1014 = Could not initialize camera
auth-error-1015 = Valid URL required
auth-error-1017 = Unexpected error
auth-error-1018 = Your verification email was just returned. Mistyped email?
auth-error-1019 = Valid email required
auth-error-1020 = Enter a valid email address. firefox.com does not offer email.
auth-error-1021 = Unexpected error
auth-error-1022 = Firefox Accounts can only be placed into an IFRAME on approved sites
auth-error-1023 = Valid email required
auth-error-1025 = The link you clicked to verify your email is expired.
auth-error-1026 = Verification link damaged
auth-error-1027 = Unexpected error
auth-error-1028 = The image dimensions must be at least 100x100px
auth-error-1029 = Signup is coming soon to Firefox for iOS
auth-error-1031 = You must enter your age to sign up
auth-error-1032 = You must enter a valid age to sign up
auth-error-1033 = Unexpected error
auth-error-1034 = Account no longer exists.
auth-error-1039 = Server busy, try again soon
auth-error-1040 = The link you clicked to verify your email is expired.
auth-error-1041 = That confirmation link was already used, and can only be used once.
auth-error-1042 = This is a required field
auth-error-1043 = Authorization code required
auth-error-1044 = Invalid authorization code
auth-error-1045 = Link damaged
auth-error-1050 = Account has no uid
auth-error-1051 = Browser not configured to accept WebChannel messages from this domain
auth-error-1052 = That confirmation link was already used, and can only be used once.
auth-error-1053 = Two-step authentication code required
auth-error-1054 = Invalid two-step authentication code
auth-error-1055 = Recovery code required
auth-error-1056 = Invalid recovery code
auth-error-1057 = Password must not be your email address
auth-error-1058 = Password is too common
auth-error-1059 = Recovery key required
auth-error-1060 = Please enter verification code
auth-error-1062 = Invalid redirect
auth-error-1065 = The image file size is too large to be uploaded.

