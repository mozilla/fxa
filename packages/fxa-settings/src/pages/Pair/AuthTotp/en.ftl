## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Enter authentication code <span>to continue to account settings</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Enter authentication code <span>to continue to { $serviceName }</span>
auth-totp-instruction = Open your authentication app and enter the authentication code it provides.
auth-totp-input-label = Enter 6-digit code
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirm
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Authentication code required
