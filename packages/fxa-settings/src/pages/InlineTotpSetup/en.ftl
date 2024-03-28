## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Cancel setup
inline-totp-setup-continue-button = Continue

# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Add a layer of security to your account by requiring authentication codes from one of <authenticationAppsLink>these authentication apps</authenticationAppsLink>.

#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Enable two-step authentication <span>to continue to account settings</span>

# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Enable two-step authentication <span>to continue to { $serviceName }</span>

inline-totp-setup-ready-button = Ready

# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scan authentication code <span>to continue to { $serviceName }</span>

# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Enter code manually <span>to continue to { $serviceName }</span>

# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scan authentication code <span>to continue to account settings</span>

# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Enter code manually <span>to continue to account settings</span>

# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Type this secret key into your authentication app. <toggleToQRButton>Scan QR code instead?</toggleToQRButton>

# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scan the QR code in your authentication app and then enter the authentication code it provides. <toggleToManualModeButton>Can’t scan code?</toggleToManualModeButton>

# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Once complete, it will begin generating authentication codes for you to enter.

# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Authentication code
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Authentication code required
tfa-qr-code-alt = Use the code { $code } to set up two-step authentication in supported applications.
