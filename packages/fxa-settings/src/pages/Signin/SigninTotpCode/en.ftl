## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.
## The "security code" here refers to the code provided by an authentication app.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
signin-totp-code-heading-w-default-service = Enter security code <span>to continue to account settings</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
signin-totp-code-heading-w-custom-service = Enter security code <span>to continue to { $serviceName }</span>
signin-totp-code-instruction = Open your authentication app and enter the security code it provides.
signin-totp-code-input-label-v2 = Enter 6-digit code
# Form button to confirm if the security code entered by the user is valid
signin-totp-code-confirm-button = Confirm
signin-totp-code-other-account-link = Use a different account
signin-totp-code-recovery-code-link = Trouble entering code?
