## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
signin-recovery-code-heading-w-default-service = Enter backup authentication code <span>to continue to account settings</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
signin-recovery-code-heading-w-custom-service = Enter backup authentication code <span>to continue to { $serviceName }</span>
signin-recovery-code-instruction = Please enter a backup authentication code that was provided to you during two step authentication setup.
signin-recovery-code-input-label = Enter 10-digit backup authentication code
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirm
# Link to return to signin with two-step authentication code (security code)
signin-recovery-code-back-link = Back
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Are you locked out?
