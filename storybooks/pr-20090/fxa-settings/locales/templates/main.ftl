


-brand-mozilla = Mozilla
-brand-firefox = Firefox

-product-firefox-accounts = Firefox accounts

-product-mozilla-account = Mozilla account

-product-mozilla-accounts =
    { $capitalization ->
       *[lowercase] Mozilla accounts
        [uppercase] Mozilla Accounts
    }

-product-firefox-account = Firefox account

-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay

-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa

-app-store = App Store
-google-play = Google Play

app-general-err-heading = General application error
app-general-err-message = Something went wrong. Please try again later.

app-query-parameter-err-heading = Bad Request: Invalid Query Parameters


app-footer-mozilla-logo-label = { -brand-mozilla } logo
app-footer-privacy-notice = Website Privacy Notice
app-footer-terms-of-service = Terms of Service


app-default-title-2 = { -product-mozilla-accounts }

app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Opens in new window


app-loading-spinner-aria-label-loading = Loading…


app-logo-alt-3 =
  .alt = { -brand-mozilla } m logo


resend-code-success-banner-heading = A new code was sent to your email.
resend-link-success-banner-heading = A new link was sent to your email.

resend-success-banner-description = Add { $accountsEmail } to your contacts to ensure a smooth delivery.


brand-banner-dismiss-button-2 =
  .aria-label = Close banner

brand-prelaunch-title = { -product-firefox-accounts } will be renamed { -product-mozilla-accounts } on Nov 1

brand-prelaunch-subtitle = You’ll still sign in with the same username and password, and there are no other changes to the products that you use.

brand-postlaunch-title = We’ve renamed { -product-firefox-accounts } to { -product-mozilla-accounts }. You’ll still sign in with the same username and password, and there are no other changes to the products that you use.

brand-learn-more = Learn more

brand-close-banner =
  .alt = Close Banner

brand-m-logo =
  .alt = { -brand-mozilla } m logo


button-back-aria-label = Back
button-back-title = Back


recovery-key-download-button-v3 = Download and continue
  .title = Download and continue

recovery-key-pdf-heading = Account Recovery Key

recovery-key-pdf-download-date = Generated: { $date }

recovery-key-pdf-key-legend = Account Recovery Key

recovery-key-pdf-instructions = This key allows you to recover your encrypted browser data (including passwords, bookmarks, and history) if you forget your password. Store it in a place you’ll remember.

recovery-key-pdf-storage-ideas-heading = Places to store your key

recovery-key-pdf-support = Learn more about your account recovery key

recovery-key-pdf-download-error = Sorry, there was a problem downloading your account recovery key.


button-passkey-signin = Sign in with passkey

button-passkey-signin-loading = Securely signing in…



choose-newsletters-prompt-2 = Get more from { -brand-mozilla }:
choose-newsletters-option-latest-news =
  .label = Get our latest news and product updates
choose-newsletters-option-test-pilot =
  .label = Early access to test new products
choose-newsletters-option-reclaim-the-internet =
  .label = Action alerts to reclaim the internet


datablock-download =
  .message = Downloaded
datablock-copy =
  .message = Copied
datablock-print =
  .message = Printed


datablock-copy-success =
  { $count ->
      [one]  Code copied
      *[other] Codes copied
  }

datablock-download-success =
  { $count ->
      [one]  Code downloaded
      *[other] Codes downloaded
  }

datablock-print-success =
  { $count ->
      [one]  Code printed
      *[other] Codes printed
  }


datablock-inline-copy =
  .message = Copied


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimated)
device-info-block-location-region-country = { $region }, { $country } (estimated)
device-info-block-location-city-country = { $city }, { $country } (estimated)
device-info-block-location-country = { $country } (estimated)
device-info-block-location-unknown = Location unknown
device-info-browser-os = { $browserName } on { $genericOSName }
device-info-ip-address = IP address: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
  .label = Password
form-password-with-inline-criteria-signup-confirm-password-label =
  .label = Repeat password
form-password-with-inline-criteria-signup-submit-button = Create account

form-password-with-inline-criteria-reset-new-password =
  .label = New password
form-password-with-inline-criteria-confirm-password =
  .label = Confirm password
form-password-with-inline-criteria-reset-submit-button = Create new password

form-password-with-inline-criteria-set-password-new-password-label =
  .label = Password
form-password-with-inline-criteria-set-password-confirm-password-label =
  .label = Repeat password
form-password-with-inline-criteria-set-password-submit-button = Start syncing

form-password-with-inline-criteria-match-error = Passwords do not match
form-password-with-inline-criteria-sr-too-short-message = Password must contain at least 8 characters.
form-password-with-inline-criteria-sr-not-email-message = Password must not contain your email address.
form-password-with-inline-criteria-sr-not-common-message = Password must not be a commonly used password.
form-password-with-inline-criteria-sr-requirements-met = The entered password respects all password requirements.
form-password-with-inline-criteria-sr-passwords-match = Entered passwords match.


form-verify-code-default-error = This field is required


form-verify-totp-disabled-button-title-numeric = Enter { $codeLength }-digit code to continue

form-verify-totp-disabled-button-title-alphanumeric = Enter { $codeLength }-character code to continue


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } account recovery key
get-data-trio-title-backup-verification-codes = Backup authentication codes
get-data-trio-download-2 =
  .title = Download
  .aria-label = Download
get-data-trio-copy-2 =
  .title = Copy
  .aria-label = Copy
get-data-trio-print-2 =
  .title = Print
  .aria-label = Print



alert-icon-aria-label =
    .aria-label = Alert

icon-attention-aria-label =
    .aria-label = Attention

icon-warning-aria-label =
    .aria-label = Warning

authenticator-app-aria-label =
    .aria-label = Authenticator Application

backup-codes-icon-aria-label-v2 =
    .aria-label = Backup authentication codes enabled

backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Backup authentication codes disabled

backup-recovery-sms-icon-aria-label =
    .aria-label = Recovery SMS enabled

backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Recovery SMS disabled

canadian-flag-icon-aria-label =
    .aria-label = Canadian Flag

checkmark-icon-aria-label =
    .aria-label = Check

checkmark-success-icon-aria-label =
    .aria-label = Success

checkmark-enabled-icon-aria-label =
    .aria-label = Enabled

close-icon-aria-label =
    .aria-label = Close message

code-icon-aria-label =
    .aria-label = Code

error-icon-aria-label =
    .aria-label = Error

info-icon-aria-label =
    .aria-label = Information

usa-flag-icon-aria-label =
    .aria-label = United States Flag

icon-loading-arrow-aria-label =
    .aria-label = Loading

icon-passkey-aria-label =
    .aria-label = Passkey



hearts-broken-image-aria-label =
  .aria-label = A computer and a mobile phone and an image of a broken heart on each
hearts-verified-image-aria-label =
  .aria-label = A computer and a mobile phone and a tablet with a pulsing heart on each
signin-recovery-code-image-description =
  .aria-label = Document that contains hidden text.
signin-totp-code-image-label =
  .aria-label = A device with a hidden 6-digit code.
confirm-signup-aria-label =
  .aria-label = An envelope containing a link
security-shield-aria-label =
  .aria-label = Illustration to represent an account recovery key.
recovery-key-image-aria-label =
  .aria-label = Illustration to represent an account recovery key.
password-image-aria-label =
  .aria-label = An illustration to represent typing in a password.
lightbulb-aria-label =
  .aria-label = Illustration to represent creating a storage hint.
email-code-image-aria-label =
  .aria-label = Illustration to represent an email containing a code.
recovery-phone-image-description =
  .aria-label = Mobile device that receives a code by text message.
recovery-phone-code-image-description =
  .aria-label = Code received on a mobile device.
backup-recovery-phone-image-aria-label =
  .aria-label = Mobile device with SMS text message capabilities
backup-authentication-codes-image-aria-label =
  .aria-label = Device screen with codes
sync-clouds-image-aria-label =
  .aria-label = Clouds with a sync icon
confetti-falling-image-aria-label =
  .aria-label = Animated falling confetti


inline-recovery-key-setup-signed-in-firefox-2 = You’re signed in to { -brand-firefox }.
inline-recovery-key-setup-create-header = Secure your account
inline-recovery-key-setup-create-subheader = Got a minute to protect your data?
inline-recovery-key-setup-info = Create an account recovery key so you can restore your sync browsing data if you ever forget your password.
inline-recovery-key-setup-start-button = Create account recovery key
inline-recovery-key-setup-later-button = Do it later


input-password-hide = Hide password
input-password-show = Show password
input-password-hide-aria-2 = Your password is currently visible on screen.
input-password-show-aria-2 = Your password is currently hidden.
input-password-sr-only-now-visible = Your password is now visible on screen.
input-password-sr-only-now-hidden = Your password is now hidden.

input-phone-number-country-list-aria-label = Select country
input-phone-number-enter-number = Enter phone number
input-phone-number-country-united-states = United States
input-phone-number-country-canada = Canada

legal-back-button = Back


reset-pwd-link-damaged-header = Reset password link damaged

signin-link-damaged-header = Confirmation link damaged

report-signin-link-damaged-header = Link damaged

reset-pwd-link-damaged-message = The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.


link-expired-new-link-button = Receive new link


remember-password-text = Remember your password?
remember-password-signin-link = Sign in


primary-email-confirmation-link-reused = Primary email already confirmed

signin-confirmation-link-reused = Sign-in already confirmed

confirmation-link-reused-message = That confirmation link was already used, and can only be used once.


locale-toggle-select-label = Select language
locale-toggle-browser-default = Browser default

error-bad-request = Bad Request


password-info-balloon-why-password-info = You need this password to access any encrypted data you store with us.
password-info-balloon-reset-risk-info = A reset means potentially losing data like passwords and bookmarks.


password-strength-long-instruction = Pick a strong password you haven’t used on other sites. Ensure it meets the security requirements:
password-strength-short-instruction = Pick a strong password:
password-strength-inline-min-length = At least 8 characters
password-strength-inline-not-email = Not your email address
password-strength-inline-not-common = Not a commonly used password
password-strength-inline-confirmed-must-match = Confirmation matches the new password
password-strength-inline-passwords-match = Passwords match


account-recovery-notification-cta = Create
account-recovery-notification-header-value = Don’t lose your data if you forget your password
account-recovery-notification-header-description = Create an account recovery key to restore your sync browsing data if you ever forget your password.
recovery-phone-promo-cta = Add recovery phone
recovery-phone-promo-heading = Add extra protection to your account with a recovery phone
recovery-phone-promo-description = Now you can sign in with a one-time-password via SMS if you can’t use your two-step authenticator app.
recovery-phone-promo-info-link = Learn more about recovery and SIM swap risk
promo-banner-dismiss-button =
  .aria-label = Dismiss banner


ready-complete-set-up-instruction = Complete setup by entering your new password on your other { -brand-firefox } devices.
manage-your-account-button = Manage your account
ready-use-service = You’re now ready to use { $serviceName }
ready-use-service-default = You’re now ready to use account settings
ready-account-ready = Your account is ready!
ready-continue = Continue
sign-in-complete-header = Sign-in confirmed
sign-up-complete-header = Account confirmed
primary-email-verified-header = Primary email confirmed

flow-recovery-key-download-storage-ideas-heading-v2 = Places to store your key:
flow-recovery-key-download-storage-ideas-folder-v2 = Folder on secure device
flow-recovery-key-download-storage-ideas-cloud = Trusted cloud storage
flow-recovery-key-download-storage-ideas-print-v2 = Printed physical copy
flow-recovery-key-download-storage-ideas-pwd-manager = Password manager


flow-recovery-key-hint-header-v2 = Add a hint to help find your key
flow-recovery-key-hint-message-v3 = This hint should help you remember where you stored your account recovery key. We can show it to you during the password reset to recover your data.
flow-recovery-key-hint-input-v2 =
  .label = Enter a hint (optional)
flow-recovery-key-hint-cta-text = Finish

flow-recovery-key-hint-char-limit-error = The hint must contain fewer than 255 characters.
flow-recovery-key-hint-unsafe-char-error = The hint cannot contain unsafe unicode characters. Only letters, numbers, punctuation marks and symbols are allowed.


password-reset-warning-icon = Warning
password-reset-chevron-expanded = Collapse warning
password-reset-chevron-collapsed = Expand warning

password-reset-data-may-not-be-recovered = Your browser data may not be recovered
password-reset-previously-signed-in-device-2 = Have any device where you previously signed in?
password-reset-data-may-be-saved-locally-2 = Your browser data might be saved on that device. Reset your password, then sign in there to restore and sync your data.
password-reset-no-old-device-2 = Have a new device but don’t have access to any of your previous ones?
password-reset-encrypted-data-cannot-be-recovered-2 = We’re sorry, but your encrypted browser data on { -brand-firefox } servers can’t be recovered.

password-reset-warning-have-key = Have an account recovery key?
password-reset-warning-use-key-link = Use it now to reset your password and keep your data


alert-bar-close-message = Close message


avatar-your-avatar =
  .alt = Your avatar
avatar-default-avatar =
  .alt = Default avatar



bento-menu-title-3 = { -brand-mozilla } products
bento-menu-tagline = More products from { -brand-mozilla } that protect your privacy

bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } Browser for Desktop
bento-menu-firefox-mobile = { -brand-firefox } Browser for Mobile

bento-menu-made-by-mozilla = Made by { -brand-mozilla }


connect-another-fx-mobile = Get { -brand-firefox } on mobile or tablet
connect-another-find-fx-mobile-2 = Find { -brand-firefox } in the { -google-play } and { -app-store }.

connect-another-play-store-image-2 =
    .alt = Download { -brand-firefox } on { -google-play }
connect-another-app-store-image-3 =
    .alt = Download { -brand-firefox } on the { -app-store }



cs-heading = Connected Services
cs-description = Everything you are using and signed into.
cs-cannot-refresh = Sorry, there was a problem refreshing the list of connected
  services.
cs-cannot-disconnect = Client not found, unable to disconnect
cs-logged-out-2 = Logged out of { $service }

cs-refresh-button =
  .title = Refresh connected services

cs-missing-device-help = Missing or duplicate items?

cs-disconnect-sync-heading = Disconnect from Sync


cs-disconnect-sync-content-3 = Your browsing data will remain on <span>{ $device }</span>,
  but it will no longer sync with your account.
cs-disconnect-sync-reason-3 = What’s the main reason for disconnecting <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = The device is:
cs-disconnect-sync-opt-suspicious = Suspicious
cs-disconnect-sync-opt-lost = Lost or stolen
cs-disconnect-sync-opt-old = Old or replaced
cs-disconnect-sync-opt-duplicate = Duplicate
cs-disconnect-sync-opt-not-say = Rather not say


cs-disconnect-advice-confirm = Okay, got it
cs-disconnect-lost-advice-heading = Lost or stolen device disconnected
cs-disconnect-lost-advice-content-3 = Since your device was lost or stolen, to keep your information safe, you should change your { -product-mozilla-account } password in your account settings. You should also look for information from your device manufacturer about erasing your data remotely.
cs-disconnect-suspicious-advice-heading = Suspicious device disconnected
cs-disconnect-suspicious-advice-content-2 = If the disconnected device is indeed suspicious, to keep your information safe, you should change your { -product-mozilla-account } password in your account settings. You should also change any other passwords you saved in { -brand-firefox } by typing about:logins into the address bar.

cs-sign-out-button = Sign out



dc-heading = Data Collection and Use
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } browser
dc-subheader-content-2 = Allow { -product-mozilla-accounts } to send technical and interaction data to { -brand-mozilla }.
dc-subheader-ff-content = To review or update your { -brand-firefox } browser technical and interaction data settings, open { -brand-firefox } settings and navigate to Privacy and Security.
dc-opt-out-success-2 = Opt out successful. { -product-mozilla-accounts } won’t send technical or interaction data to { -brand-mozilla }.
dc-opt-in-success-2 = Thanks! Sharing this data helps us improve { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Sorry, there was a problem changing your data collection preference
dc-learn-more = Learn more


drop-down-menu-title-2 = { -product-mozilla-account } menu
drop-down-menu-signed-in-as-v2 = Signed in as
drop-down-menu-sign-out = Sign out

drop-down-menu-sign-out-error-2 = Sorry, there was a problem signing you out


flow-container-back = Back


flow-recovery-key-confirm-pwd-heading-v2 = Re-enter your password for security
flow-recovery-key-confirm-pwd-input-label = Enter your password
flow-recovery-key-confirm-pwd-submit-button = Create account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Create new account recovery key


flow-recovery-key-download-heading-v2 = Account recovery key created — Download and store it now
flow-recovery-key-download-info-v2 = This key allows you to recover your data if you forget your password. Download it now and store it somewhere you’ll remember — you won’t be able to return to this page later.
flow-recovery-key-download-next-link-v2 = Continue without downloading


flow-recovery-key-success-alert = Account recovery key created


flow-recovery-key-info-header = Create an account recovery key in case you forget your password
flow-recovery-key-info-header-change-key = Change your account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = We encrypt browsing data –– passwords, bookmarks, and more. It’s great for privacy, but you may lose your data if you forget your password.
flow-recovery-key-info-key-bullet-point-v2 = That’s why creating an account recovery key is so important –– you can use it to restore your data.
flow-recovery-key-info-cta-text-v3 = Get started
flow-recovery-key-info-cancel-link = Cancel


flow-setup-2fa-qr-heading = Connect to your authenticator app
flow-setup-2a-qr-instruction = <strong>Step 1:</strong> Scan this QR code using any authenticator app, like Duo or Google Authenticator.

flow-setup-2fa-qr-alt-text =
  .alt = QR code for setting up two-step authentication. Scan it, or choose “Can’t scan QR code?” to get a setup secret key instead.

flow-setup-2fa-cant-scan-qr-button = Can’t scan QR code?

flow-setup-2fa-manual-key-heading = Enter code manually
flow-setup-2fa-manual-key-instruction = <strong>Step 1:</strong> Enter this code in your preferred authenticator app.
flow-setup-2fa-scan-qr-instead-button = Scan QR code instead?

flow-setup-2fa-more-info-link = Learn more about authenticator apps
flow-setup-2fa-button = Continue

flow-setup-2fa-step-2-instruction = <strong>Step 2:</strong> Enter the code from your authenticator app.
flow-setup-2fa-input-label = Enter 6-digit code
flow-setup-2fa-code-error = Invalid or expired code. Check your authenticator app and try again.


flow-setup-2fa-backup-choice-heading = Choose a recovery method
flow-setup-2fa-backup-choice-description = This allows you to sign in if you can’t access your mobile device or authenticator app.

flow-setup-2fa-backup-choice-phone-title = Recovery phone
flow-setup-2fa-backup-choice-phone-badge = Easiest
flow-setup-2fa-backup-choice-phone-info = Get a recovery code via text message. Currently available in the USA and Canada.

flow-setup-2fa-backup-choice-code-title = Backup authentication codes
flow-setup-2fa-backup-choice-code-badge = Safest
flow-setup-2fa-backup-choice-code-info = Create and save one-time-use authentication codes.

flow-setup-2fa-backup-choice-learn-more-link = Learn about recovery and SIM swap risk



flow-setup-2fa-backup-code-confirm-heading = Enter backup authentication code

flow-setup-2fa-backup-code-confirm-confirm-saved = Confirm you saved your codes by entering one. Without these codes, you might not be able to sign in if you don’t have your authenticator app.

flow-setup-2fa-backup-code-confirm-code-input = Enter 10-character code

flow-setup-2fa-backup-code-confirm-button-finish = Finish



flow-setup-2fa-backup-code-dl-heading = Save backup authentication codes

flow-setup-2fa-backup-code-dl-save-these-codes = Keep these in a place you’ll remember. If you don’t have access to your authenticator app you’ll need to enter one to sign in.

flow-setup-2fa-backup-code-dl-button-continue = Continue


flow-setup-2fa-inline-complete-success-banner = Two-step authentication enabled
flow-setup-2fa-inline-complete-success-banner-description = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using your new two-step authentication.

flow-setup-2fa-inline-complete-backup-code = Backup authentication codes
flow-setup-2fa-inline-complete-backup-phone = Recovery phone

flow-setup-2fa-inline-complete-backup-code-info = { $count ->
  [one] { $count } code remaining
  *[other] { $count } codes remaining
}

flow-setup-2fa-inline-complete-backup-code-description = This is the safest recovery method if you can’t sign in with your mobile device or authenticator app.
flow-setup-2fa-inline-complete-backup-phone-description = This is the easiest recovery method if you can’t sign in with your authenticator app.

flow-setup-2fa-inline-complete-learn-more-link = How this protects your account

flow-setup-2fa-inline-complete-continue-button = Continue to { $serviceName }

flow-setup-2fa-prompt-heading = Set up two-step authentication

flow-setup-2fa-prompt-description = { $serviceName } requires you to set up two-step authentication to keep your account safe.

flow-setup-2fa-prompt-use-authenticator-apps = You can use any of <authenticationAppsLink>these authenticator apps</authenticationAppsLink> to proceed.

flow-setup-2fa-prompt-continue-button = Continue


flow-setup-phone-confirm-code-heading = Enter verification code

flow-setup-phone-confirm-code-instruction = A 6-digit code was sent to <span>{ $phoneNumber }</span> by text message. This code expires after 5 minutes.
flow-setup-phone-confirm-code-input-label = Enter 6-digit code
flow-setup-phone-confirm-code-button = Confirm
flow-setup-phone-confirm-code-expired = Code expired?
flow-setup-phone-confirm-code-resend-code-button = Resend code
flow-setup-phone-confirm-code-resend-code-success = Code sent
flow-setup-phone-confirm-code-success-message-v2 = Recovery phone added
flow-change-phone-confirm-code-success-message = Recovery phone changed


flow-setup-phone-submit-number-heading = Verify your phone number
flow-setup-phone-verify-number-instruction = You’ll get a text message from { -brand-mozilla } with a code to verify your number. Don’t share this code with anyone.

flow-setup-phone-submit-number-info-message-v2 = Recovery phone is only available in the United States and Canada. VoIP numbers and phone masks are not recommended.

flow-setup-phone-submit-number-legal = By providing your number, you agree to us storing it so we can text you for account verification only. Message and data rates may apply.
flow-setup-phone-submit-number-button = Send code


header-menu-open = Close menu
header-menu-closed = Site navigation menu
header-back-to-top-link =
  .title = Back to top
header-back-to-settings-link =
  .title = Back to { -product-mozilla-account } settings
header-title-2 = { -product-mozilla-account }
header-help = Help


la-heading = Linked Accounts
la-description = You have authorized access to the following accounts.
la-unlink-button = Unlink
la-unlink-account-button = Unlink
la-set-password-button = Set Password
la-unlink-heading = Unlink from third party account
la-unlink-content-3 = Are you sure you want to unlink your account? Unlinking your account does not automatically sign you out of your Connected Services. To do that, you will need to manually sign out from the Connected Services section.
la-unlink-content-4 = Before unlinking your account, you must set a password. Without a password, there is no way for you to log in after unlinking your account.
nav-linked-accounts = { la-heading }


modal-close-title = Close
modal-cancel-button = Cancel
modal-default-confirm-button = Confirm


modal-mfa-protected-title = Enter confirmation code
modal-mfa-protected-subtitle = Help us make sure it’s you changing your account info
modal-mfa-protected-instruction = { $expirationTime ->
    [one] Enter the code that was sent to <email>{ $email }</email> within { $expirationTime } minute.
    *[other] Enter the code that was sent to <email>{ $email }</email> within { $expirationTime } minutes.
  }
modal-mfa-protected-input-label = Enter 6-digit code
modal-mfa-protected-cancel-button = Cancel
modal-mfa-protected-confirm-button = Confirm

modal-mfa-protected-code-expired = Code expired?
modal-mfa-protected-resend-code-link = Email new code.



mvs-verify-your-email-2 = Confirm your email
mvs-enter-verification-code-2 = Enter your confirmation code
mvs-enter-verification-code-desc-2 = Please enter the confirmation code that was sent to <email>{ $email }</email> within 5 minutes.
msv-cancel-button = Cancel
msv-submit-button-2 = Confirm


nav-settings = Settings
nav-profile = Profile
nav-security = Security
nav-connected-services = Connected Services
nav-data-collection = Data Collection and Use
nav-paid-subs = Paid Subscriptions
nav-email-comm = Email Communications


page-2fa-change-title = Change two-step authentication
page-2fa-change-success = Two-step authentication has been updated
page-2fa-change-success-additional-message = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using your new two-step authentication.
page-2fa-change-totpinfo-error = There was an error replacing your two-step authentication app. Try again later.
page-2fa-change-qr-instruction = <strong>Step 1:</strong> Scan this QR code using any authenticator app, like Duo or Google Authenticator. This creates a new connection, any old connections won’t work anymore.



tfa-backup-codes-page-title = Backup authentication codes

tfa-replace-code-error-3 = There was a problem replacing your backup authentication codes

tfa-create-code-error = There was a problem creating your backup authentication codes

tfa-replace-code-success-alert-4 = Backup authentication codes updated

tfa-create-code-success-alert = Backup authentication codes created

tfa-replace-code-download-description = Keep these in a place you’ll remember. Your old codes will be replaced after you finish the next step.

tfa-replace-code-confirm-description = Confirm you saved your codes by entering one. Your old backup authentication codes will be disabled once this step is completed.

tfa-incorrect-recovery-code-1 = Incorrect backup authentication code



page-2fa-setup-title = Two-step authentication
page-2fa-setup-totpinfo-error = There was an error setting up two-step authentication. Try again later.
page-2fa-setup-incorrect-backup-code-error = That code is not correct. Try again.
page-2fa-setup-success = Two-step authentication has been enabled
page-2fa-setup-success-additional-message = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using two-step authentication.



avatar-page-title =
  .title = Profile picture
avatar-page-add-photo = Add photo
avatar-page-add-photo-button =
  .title = { avatar-page-add-photo }
avatar-page-take-photo = Take photo
avatar-page-take-photo-button =
  .title = { avatar-page-take-photo }
avatar-page-remove-photo = Remove photo
avatar-page-remove-photo-button =
  .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Retake photo
avatar-page-cancel-button = Cancel
avatar-page-save-button = Save
avatar-page-saving-button = Saving…
avatar-page-zoom-out-button =
  .title = Zoom out
avatar-page-zoom-in-button =
  .title = Zoom in
avatar-page-rotate-button =
  .title = Rotate
avatar-page-camera-error = Could not initialize camera
avatar-page-new-avatar =
  .alt = new profile picture
avatar-page-file-upload-error-3 = There was a problem uploading your profile picture
avatar-page-delete-error-3 = There was a problem deleting your profile picture
avatar-page-image-too-large-error-2 = The image file size is too large to be uploaded



pw-change-header =
  .title = Change password

pw-8-chars = At least 8 characters
pw-not-email = Not your email address
pw-change-must-match = New password matches confirmation
pw-commonly-used = Not a commonly used password
pw-tips = Stay safe — don’t reuse passwords. See more tips to <linkExternal>create strong passwords</linkExternal>.
pw-change-cancel-button = Cancel
pw-change-save-button = Save
pw-change-forgot-password-link = Forgot password?

pw-change-current-password =
  .label = Enter current password
pw-change-new-password =
  .label = Enter new password
pw-change-confirm-password =
  .label = Confirm new password

pw-change-success-alert-2 = Password updated



pw-create-header =
  .title = Create password

pw-create-success-alert-2 = Password set
pw-create-error-2 = Sorry, there was a problem setting your password



delete-account-header =
 .title = Delete account

delete-account-step-1-2 = Step 1 of 2
delete-account-step-2-2 = Step 2 of 2

delete-account-confirm-title-4 = You may have connected your { -product-mozilla-account } to one or more of the following { -brand-mozilla } products or services that keep you secure and productive on the web:

delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Syncing { -brand-firefox } data
delete-account-product-firefox-addons = { -brand-firefox } Add-ons

delete-account-acknowledge = Please acknowledge that by deleting your account:

delete-account-chk-box-1-v4 =
 .label = Any paid subscriptions you have will be canceled
delete-account-chk-box-2 =
 .label = You may lose saved information and features within { -brand-mozilla } products
delete-account-chk-box-3 =
 .label = Reactivating with this email may not restore your saved information
delete-account-chk-box-4 =
 .label = Any extensions and themes that you published to addons.mozilla.org will be deleted


delete-account-continue-button = Continue

delete-account-password-input =
 .label = Enter password

delete-account-cancel-button = Cancel
delete-account-delete-button-2 = Delete



display-name-page-title =
  .title = Display name

display-name-input =
  .label = Enter display name
submit-display-name = Save
cancel-display-name = Cancel

display-name-update-error-2 = There was a problem updating your display name

display-name-success-alert-2 = Display name updated



recent-activity-title = Recent account activity

recent-activity-account-create-v2 = Account created
recent-activity-account-disable-v2 = Account disabled
recent-activity-account-enable-v2 = Account enabled
recent-activity-account-login-v2 = Account login initiated
recent-activity-account-reset-v2 = Password reset initiated
recent-activity-emails-clearBounces-v2 = Email bounces cleared
recent-activity-account-login-failure = Account login attempt failed
recent-activity-account-two-factor-added = Two-step authentication enabled
recent-activity-account-two-factor-requested = Two-step authentication requested
recent-activity-account-two-factor-failure = Two-step authentication failed
recent-activity-account-two-factor-success = Two-step authentication successful
recent-activity-account-two-factor-removed = Two-step authentication removed
recent-activity-account-password-reset-requested = Account requested password reset
recent-activity-account-password-reset-success = Account password reset successful
recent-activity-account-recovery-key-added = Account recovery key enabled
recent-activity-account-recovery-key-verification-failure = Account recovery key verification failed
recent-activity-account-recovery-key-verification-success = Account recovery key verification successful
recent-activity-account-recovery-key-removed = Account recovery key removed
recent-activity-account-password-added = New password added
recent-activity-account-password-changed = Password changed
recent-activity-account-secondary-email-added = Secondary email address added
recent-activity-account-secondary-email-removed = Secondary email address removed
recent-activity-account-emails-swapped = Primary and secondary emails swapped
recent-activity-session-destroy = Logged out of session
recent-activity-account-recovery-phone-send-code = Recovery phone code sent
recent-activity-account-recovery-phone-setup-complete = Recovery phone setup completed
recent-activity-account-recovery-phone-signin-complete = Sign-in with recovery phone completed
recent-activity-account-recovery-phone-signin-failed = Sign-in with recovery phone failed
recent-activity-account-recovery-phone-removed = Recovery phone removed
recent-activity-account-recovery-codes-replaced = Recovery codes replaced
recent-activity-account-recovery-codes-created = Recovery codes created
recent-activity-account-recovery-codes-signin-complete = Sign-in with recovery codes completed
recent-activity-password-reset-otp-sent = Reset password confirmation code sent
recent-activity-password-reset-otp-verified = Reset password confirmation code verified
recent-activity-must-reset-password = Password reset required

recent-activity-unknown = Other account activity


recovery-key-create-page-title = Account Recovery Key

recovery-key-create-back-button-title = Back to settings


recovery-phone-remove-header = Remove recovery phone number
settings-recovery-phone-remove-info = This will remove <strong>{ $formattedFullPhoneNumber }</strong> as your recovery phone.
settings-recovery-phone-remove-recommend = We recommend you keep this method because it’s easier than saving backup authentication codes.
settings-recovery-phone-remove-recovery-methods = If you delete it, make sure you still have your saved backup authentication codes. <linkExternal>Compare recovery methods</linkExternal>
settings-recovery-phone-remove-button = Remove phone number
settings-recovery-phone-remove-cancel = Cancel
settings-recovery-phone-remove-success = Recovery phone removed


page-setup-recovery-phone-heading = Add recovery phone
page-change-recovery-phone = Change recovery phone
page-setup-recovery-phone-back-button-title = Back to settings
page-setup-recovery-phone-step2-back-button-title = Change phone number


add-secondary-email-step-1 = Step 1 of 2
add-secondary-email-error-2 = There was a problem creating this email
add-secondary-email-page-title =
  .title = Secondary email
add-secondary-email-enter-address =
  .label = Enter email address
add-secondary-email-cancel-button = Cancel
add-secondary-email-save-button = Save

add-secondary-email-mask = Email masks can’t be used as a secondary email


add-secondary-email-step-2 = Step 2 of 2
verify-secondary-email-page-title =
  .title = Secondary email
verify-secondary-email-verification-code-2 =
  .label = Enter your confirmation code
verify-secondary-email-cancel-button = Cancel
verify-secondary-email-verify-button-2 = Confirm
verify-secondary-email-please-enter-code-2 = Please enter the confirmation code that was sent to <strong>{ $email }</strong> within 5 minutes.
verify-secondary-email-success-alert-2 = { $email } successfully added
verify-secondary-email-resend-code-button = Resend confirmation code


delete-account-link = Delete account
inactive-update-status-success-alert = Signed in successfully. Your { -product-mozilla-account } and data will stay active.


product-promo-monitor =
 .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Find where your private info is exposed and take control
product-promo-monitor-cta = Get free scan


profile-heading = Profile
profile-picture =
  .header = Picture
profile-display-name =
  .header = Display name
profile-primary-email =
  .header = Primary email



progress-bar-aria-label-v2 = Step { $currentStep } of { $numberOfSteps }.


security-heading = Security
security-password =
  .header = Password
security-password-created-date = Created { $date }
security-not-set = Not Set
security-action-create = Create
security-set-password = Set a password to sync and use certain account security features.

security-recent-activity-link = View recent account activity

signout-sync-header = Session Expired
signout-sync-session-expired = Sorry, something went wrong. Please sign out from the browser menu and try again.


tfa-row-backup-codes-title = Backup authentication codes
tfa-row-backup-codes-not-available = No codes available
tfa-row-backup-codes-available-v2 = { $numCodesAvailable ->
  [one] { $numCodesAvailable } code remaining
  *[other] { $numCodesAvailable } codes remaining
}
tfa-row-backup-codes-get-new-cta-v2 = Create new codes
tfa-row-backup-codes-add-cta = Add
tfa-row-backup-codes-description-2 = This is the safest recovery method if you canʼt use your mobile device or authenticator app.

tfa-row-backup-phone-title-v2 = Recovery phone
tfa-row-backup-phone-not-available-v2 = No phone number added
tfa-row-backup-phone-change-cta = Change
tfa-row-backup-phone-add-cta = Add
tfa-row-backup-phone-delete-button = Remove
tfa-row-backup-phone-delete-title-v2 = Remove recovery phone
tfa-row-backup-phone-delete-restriction-v2 = If you want to remove your recovery phone, add backup authentication codes or disable two-step authentication first to avoid getting locked out of your account.
tfa-row-backup-phone-description-v2 = This is the easiest recovery method if you canʼt use your authenticator app.
tfa-row-backup-phone-sim-swap-risk-link = Learn about SIM swap risk

passkey-sub-row-created-date = Created: { $createdDate }

passkey-sub-row-last-used-date = Last used: { $lastUsedDate }

passkey-sub-row-sign-in-only = Sign in only. Can’t be used to sync.

passkey-sub-row-delete-title = Delete passkey
passkey-delete-modal-heading = Delete your passkey?
passkey-delete-modal-content = This passkey will be removed from your account. You’ll need to sign in using a different way.
passkey-delete-modal-cancel-button = Cancel
passkey-delete-modal-confirm-button = Delete passkey
passkey-delete-success = Passkey deleted
passkey-delete-error = There was a problem deleting your passkey. Try again in a few minutes.



switch-turn-off = Turn off
switch-turn-on = Turn on
switch-submitting = Submitting…
switch-is-on = on
switch-is-off = off


row-defaults-action-add = Add
row-defaults-action-change = Change
row-defaults-action-disable = Disable
row-defaults-status = None


passkey-row-header = Passkeys
passkey-row-enabled = Enabled
passkey-row-not-set = Not Set
passkey-row-action-create = Create
passkey-row-description = Make sign in easier and more secure by using your phone or other supported device to get into your account.
passkey-row-info-link = How this protects your account



rk-header-1 = Account recovery key
rk-enabled = Enabled
rk-not-set = Not Set
rk-action-create = Create
rk-action-change-button = Change
rk-action-remove = Remove
rk-key-removed-2 = Account recovery key removed
rk-cannot-remove-key = Your account recovery key could not be removed.
rk-refresh-key-1 = Refresh account recovery key
rk-content-explain = Restore your information when you forget your password.
rk-cannot-verify-session-4 = Sorry, there was a problem confirming your session
rk-remove-modal-heading-1 = Remove account recovery key?
rk-remove-modal-content-1 = In the event you reset your password, you won’t be
  able to use your account recovery key to access your data. You can’t undo this action.
rk-remove-error-2 = Your account recovery key could not be removed
unit-row-recovery-key-delete-icon-button-title = Delete account recovery key


se-heading = Secondary email
  .header = Secondary email
se-cannot-refresh-email = Sorry, there was a problem refreshing that email.
se-cannot-resend-code-3 = Sorry, there was a problem re-sending the confirmation code
se-set-primary-successful-2 = { $email } is now your primary email
se-set-primary-error-2 = Sorry, there was a problem changing your primary email
se-delete-email-successful-2 = { $email } successfully deleted
se-delete-email-error-2 = Sorry, there was a problem deleting this email
se-verify-session-3 = You’ll need to confirm your current session to perform this action
se-verify-session-error-3 = Sorry, there was a problem confirming your session
se-remove-email =
  .title = Remove email
se-refresh-email =
  .title = Refresh email
se-unverified-2 = unconfirmed
se-resend-code-2 = Confirmation needed. <button>Resend confirmation code</button>
  if it’s not in your inbox or spam folder.
se-make-primary = Make primary
se-default-content = Access your account if you can’t log in to your primary email.
se-content-note-1 = Note: a secondary email won’t restore your information — you’ll
  need an <a>account recovery key</a> for that.
se-secondary-email-none = None



tfa-row-header = Two-step authentication
tfa-row-enabled = Enabled
tfa-row-disabled-status = Disabled
tfa-row-action-add = Add
tfa-row-action-disable = Disable
tfa-row-action-change = Change

tfa-row-button-refresh =
  .title = Refresh two-step authentication
tfa-row-cannot-refresh = Sorry, there was a problem refreshing two-step
  authentication.
tfa-row-enabled-description = Your account is protected by two-step authentication. You will need to enter a one-time passcode from your authentication app when logging into your { -product-mozilla-account }.
tfa-row-enabled-info-link = How this protects your account

tfa-row-disabled-description-v2 = Help secure your account by using a third-party authenticator app as a second step to sign in.
tfa-row-cannot-verify-session-4 = Sorry, there was a problem confirming your session

tfa-row-disable-modal-heading = Disable two-step authentication?
tfa-row-disable-modal-confirm = Disable
tfa-row-disable-modal-explain-1 = You won’t be able to undo this action. You also
  have the option of <linkExternal>replacing your backup authentication codes</linkExternal>.
tfa-row-disabled-2 = Two-step authentication disabled
tfa-row-cannot-disable-2 = Two-step authentication could not be disabled
tfa-row-verify-session-info = You need to confirm your current session to set up two-step authentication


terms-privacy-agreement-intro-3 = By proceeding, you agree to the following:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Terms of Service</termsLink> and <privacyLink>Privacy Notice</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization:"uppercase") }: <mozillaAccountsTos>Terms of Service</mozillaAccountsTos> and <mozillaAccountsPrivacy>Privacy Notice</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = By proceeding, you agree to the <mozillaAccountsTos>Terms of Service</mozillaAccountsTos> and <mozillaAccountsPrivacy>Privacy Notice</mozillaAccountsPrivacy>.


third-party-auth-options-or = or

third-party-auth-options-sign-in-with = Sign in with

continue-with-google-button = Continue with { -brand-google }
continue-with-apple-button = Continue with { -brand-apple }


auth-error-102 = Unknown account
auth-error-103 = Incorrect password
auth-error-105-2 = Invalid confirmation code
auth-error-110 = Invalid token
auth-error-114-generic = You’ve tried too many times. Please try again later.
auth-error-114 = You’ve tried too many times. Please try again { $retryAfter }.
auth-error-125 = The request was blocked for security reasons
auth-error-129-2 = You entered an invalid phone number. Please check it and try again.
auth-error-138-2 = Unconfirmed session
auth-error-139 = Secondary email must be different than your account email
auth-error-144 = This email is reserved by another account. Try again later or use a different email address.
auth-error-155 = TOTP token not found
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
auth-error-1064 = Mistyped email? { $domain } isn’t a valid email service
auth-error-1066 = Email masks can’t be used to create an account.
auth-error-1067 = Mistyped email?

recovery-phone-number-ending-digits = Number ending in { $lastFourPhoneNumber }

oauth-error-1000 = Something went wrong. Please close this tab and try again.

connect-another-device-signed-in-header = You’re signed into { -brand-firefox }
connect-another-device-email-confirmed-banner = Email confirmed
connect-another-device-signin-confirmed-banner = Sign-in confirmed
connect-another-device-signin-to-complete-message = Sign in to this { -brand-firefox } to complete setup
connect-another-device-signin-link = Sign in
connect-another-device-still-adding-devices-message = Still adding devices? Sign in to { -brand-firefox } on another device to complete setup
connect-another-device-signin-another-device-to-complete-message = Sign in to { -brand-firefox } on another device to complete setup
connect-another-device-get-data-on-another-device-message = Want to get your tabs, bookmarks, and passwords on another device?
connect-another-device-cad-link = Connect another device
connect-another-device-not-now-link = Not now
connect-another-device-android-complete-setup-message = Sign in to { -brand-firefox } for Android to complete setup
connect-another-device-ios-complete-setup-message = Sign in to { -brand-firefox } for iOS to complete setup


cookies-disabled-header = Local storage and cookies are required
cookies-disabled-enable-prompt-2 = Please enable cookies and local storage in your browser to access your { -product-mozilla-account }. Doing so will enable functionality such as remembering you between sessions.
cookies-disabled-button-try-again = Try again
cookies-disabled-learn-more = Learn more


index-header = Enter your email
index-sync-header = Continue to your { -product-mozilla-account }
index-sync-subheader = Sync your passwords, tabs, and bookmarks everywhere you use { -brand-firefox }.
index-relay-header = Create an email mask
index-relay-subheader = Please provide the email address where you’d like to forward emails from your masked email.
index-subheader-with-servicename = Continue to { $serviceName }
index-subheader-default = Continue to account settings
index-cta = Sign up or sign in
index-account-info = A { -product-mozilla-account } also unlocks access to more privacy-protecting products from { -brand-mozilla }.
index-email-input =
  .label = Enter your email
index-account-delete-success = Account deleted successfully
index-email-bounced = Your confirmation email was just returned. Mistyped email?


inline-recovery-key-setup-create-error = Oops! We couldn’t create your account recovery key. Please try again later.
inline-recovery-key-setup-recovery-created = Account recovery key created
inline-recovery-key-setup-download-header = Secure your account
inline-recovery-key-setup-download-subheader = Download and store it now
inline-recovery-key-setup-download-info = Store this key somewhere you’ll remember — you won’t be able to get back to this page later.
inline-recovery-key-setup-hint-header = Security recommendation


inline-totp-setup-cancel-setup-button = Cancel setup
inline-totp-setup-continue-button = Continue

inline-totp-setup-add-security-link = Add a layer of security to your account by requiring authentication codes from one of <authenticationAppsLink>these authentication apps</authenticationAppsLink>.

inline-totp-setup-enable-two-step-authentication-default-header-2 = Enable two-step authentication <span>to continue to account settings</span>

inline-totp-setup-enable-two-step-authentication-custom-header-2 = Enable two-step authentication <span>to continue to { $serviceName }</span>

inline-totp-setup-ready-button = Ready

inline-totp-setup-show-qr-custom-service-header-2 = Scan authentication code <span>to continue to { $serviceName }</span>

inline-totp-setup-no-qr-custom-service-header-2 = Enter code manually <span>to continue to { $serviceName }</span>

inline-totp-setup-show-qr-default-service-header-2 = Scan authentication code <span>to continue to account settings</span>

inline-totp-setup-no-qr-default-service-header-2 = Enter code manually <span>to continue to account settings</span>

inline-totp-setup-enter-key-or-use-qr-instructions = Type this secret key into your authentication app. <toggleToQRButton>Scan QR code instead?</toggleToQRButton>

inline-totp-setup-use-qr-or-enter-key-instructions = Scan the QR code in your authentication app and then enter the authentication code it provides. <toggleToManualModeButton>Can’t scan code?</toggleToManualModeButton>

inline-totp-setup-on-completion-description = Once complete, it will begin generating authentication codes for you to enter.

inline-totp-setup-security-code-placeholder = Authentication code
inline-totp-setup-code-required-error = Authentication code required
tfa-qr-code-alt = Use the code { $code } to set up two-step authentication in supported applications.

inline-totp-setup-page-title = Two-step authentication


legal-header = Legal
legal-terms-of-service-link = Terms of Service
legal-privacy-link = Privacy Notice


legal-privacy-heading = Privacy Notice


legal-terms-heading = Terms of Service


pair-auth-allow-heading-text = Did you just sign in to { -product-firefox }?
pair-auth-allow-confirm-button = Yes, approve device
pair-auth-allow-refuse-device-link = If this wasn’t you, <link>change your password</link>


pair-auth-complete-heading = Device connected
pair-auth-complete-now-syncing-device-text = You are now syncing with: { $deviceFamily } on { $deviceOS }
pair-auth-complete-sync-benefits-text = Now you can access your open tabs, passwords, and bookmarks on all your devices.
pair-auth-complete-see-tabs-button = See tabs from synced devices
pair-auth-complete-manage-devices-link = Manage devices


auth-totp-heading-w-default-service = Enter authentication code <span>to continue to account settings</span>
auth-totp-heading-w-custom-service = Enter authentication code <span>to continue to { $serviceName }</span>
auth-totp-instruction = Open your authentication app and enter the authentication code it provides.
auth-totp-input-label = Enter 6-digit code
auth-totp-confirm-button = Confirm
auth-totp-code-required-error = Authentication code required


pair-wait-for-supp-heading-text = Approval now required <span>from your other device</span>


pair-failure-header = Pairing not successful
pair-failure-message = The setup process was terminated.


pair-sync-header = Sync { -brand-firefox } on your phone or tablet
pair-cad-header = Connect { -brand-firefox } on another device
pair-already-have-firefox-paragraph = Already have { -brand-firefox } on a phone or tablet?
pair-sync-your-device-button = Sync your device
pair-or-download-subheader = Or download
pair-scan-to-download-message = Scan to download { -brand-firefox } for mobile, or send yourself a <linkExternal>download link</linkExternal>.
pair-not-now-button = Not now
pair-take-your-data-message = Take your tabs, bookmarks, and passwords anywhere you use { -brand-firefox }.
pair-get-started-button = Get started
pair-qr-code-aria-label = QR code


pair-success-header-2 = Device connected
pair-success-message-2 = Pairing was successful.


pair-supp-allow-heading-text = Confirm pairing <span>for { $email }</span>
pair-supp-allow-confirm-button = Confirm pairing
pair-supp-allow-cancel-link = Cancel


pair-wait-for-auth-heading-text = Approval now required <span>from your other device</span>


pair-unsupported-header = Pair using an app
pair-unsupported-message = Did you use the system camera? You must pair from within a { -brand-firefox } app.


set-password-heading-v2 = Create password to sync
set-password-info-v2 = This encrypts your data. It needs to be different from your { -brand-google } or { -brand-apple } account password.


third-party-auth-callback-message = Please wait, you are being redirected to the authorized application.


account-recovery-confirm-key-heading = Enter your account recovery key

account-recovery-confirm-key-instruction = This key recovers your encrypted browsing data, such as passwords and bookmarks, from { -brand-firefox } servers.

account-recovery-confirm-key-input-label =
  .label = Enter your 32-character account recovery key
account-recovery-confirm-key-hint = Your storage hint is:
account-recovery-confirm-key-button-2 = Continue
account-recovery-lost-recovery-key-link-2 = Can’t find your account recovery key?


complete-reset-pw-header-v2 = Create a new password
complete-reset-password-success-alert = Password set
complete-reset-password-error-alert = Sorry, there was a problem setting your password

complete-reset-pw-recovery-key-link = Use account recovery key

reset-password-complete-banner-heading = Your password has been reset.
reset-password-complete-banner-message = Don’t forget to generate a new account recovery key from your { -product-mozilla-account } settings to prevent future sign-in issues.
complete-reset-password-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.


confirm-backup-code-reset-password-input-label = Enter 10-character code
confirm-backup-code-reset-password-confirm-button = Confirm
confirm-backup-code-reset-password-subheader = Enter backup authentication code
confirm-backup-code-reset-password-instruction = Enter one of the one-time-use codes you saved when you set up two-step authentication.
confirm-backup-code-reset-password-locked-out-link = Are you locked out?


confirm-reset-password-with-code-heading = Check your email

confirm-reset-password-with-code-instruction = We sent a confirmation code to <span>{ $email }</span>.

confirm-reset-password-code-input-group-label = Enter 8-digit code within 10 minutes

confirm-reset-password-otp-submit-button = Continue

confirm-reset-password-otp-resend-code-button = Resend code

confirm-reset-password-otp-different-account-link = Use a different account


confirm-totp-reset-password-header = Reset your password
confirm-totp-reset-password-subheader-v2 = Enter two-step authentication code
confirm-totp-reset-password-instruction-v2 = Check your <strong>authenticator app</strong> to reset your password.
confirm-totp-reset-password-trouble-code = Trouble entering code?
confirm-totp-reset-password-confirm-button = Confirm
confirm-totp-reset-password-input-label-v2 = Enter 6-digit code
confirm-totp-reset-password-use-different-account = Use a different account


password-reset-flow-heading = Reset your password

password-reset-body-2 = We’ll ask for a couple of things only you know to keep your account
          safe.

password-reset-email-input =
  .label = Enter your email

password-reset-submit-button-2 = Continue


reset-password-complete-header = Your password has been reset
reset-password-confirmed-cta = Continue to { $serviceName }


password-reset-recovery-method-header = Reset your password
password-reset-recovery-method-subheader = Choose a recovery method
password-reset-recovery-method-details = Let’s make sure it’s you using your recovery methods.
password-reset-recovery-method-phone = Recovery phone
password-reset-recovery-method-code = Backup authentication codes
password-reset-recovery-method-code-info =
  { $numBackupCodes ->
      [one] { $numBackupCodes } code remaining
      *[other] { $numBackupCodes } codes remaining
  }
password-reset-recovery-method-send-code-error-heading = There was a problem sending a code to your recovery phone
password-reset-recovery-method-send-code-error-description = Please try again later or use your backup authentication codes.


reset-password-recovery-phone-flow-heading = Reset your password

reset-password-recovery-phone-heading = Enter recovery code

reset-password-recovery-phone-instruction-v3 = A 6-digit code was sent to the phone number ending in <span>{ $lastFourPhoneDigits }</span> by text message. This code expires after 5 minutes. Donʼt share this code with anyone.

reset-password-recovery-phone-input-label = Enter 6-digit code

reset-password-recovery-phone-code-submit-button = Confirm

reset-password-recovery-phone-resend-code-button = Resend code
reset-password-recovery-phone-resend-success = Code sent

reset-password-recovery-phone-locked-out-link = Are you locked out?

reset-password-recovery-phone-send-code-error-heading = There was a problem sending a code

reset-password-recovery-phone-code-verification-error-heading = There was a problem verifying your code

reset-password-recovery-phone-general-error-description = Please try again later.

reset-password-recovery-phone-invalid-code-error-description = The code is invalid or expired.
reset-password-recovery-phone-invalid-code-error-link = Use backup authentication codes instead?

reset-password-with-recovery-key-verified-page-title = Password reset successful
reset-password-complete-new-password-saved = New password saved!
reset-password-complete-recovery-key-created = New account recovery key created. Download and store it now.
reset-password-complete-recovery-key-download-info = This key is essential for
  data recovery if you forget your password. <b>Download and store it securely
  now, as you won’t be able to access this page again later.</b>


error-label = Error:
validating-signin = Validating sign-in…
complete-signin-error-header = Confirmation error
signin-link-expired-header = Confirmation link expired
signin-link-expired-message-2 = The link you clicked has expired or has already been used.


signin-password-needed-header-2 = Enter your password <span>for your { -product-mozilla-account }</span>

signin-subheader-without-logo-with-servicename = Continue to { $serviceName }
signin-subheader-without-logo-default = Continue to account settings
signin-button = Sign in
signin-header = Sign in
signin-use-a-different-account-link = Use a different account
signin-forgot-password-link = Forgot password?
signin-password-button-label = Password
signin-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.

signin-code-expired-error = Code expired. Please sign in again.

signin-recovery-error = Something went wrong. Please sign in again.

signin-account-locked-banner-heading = Reset your password
signin-account-locked-banner-description = We locked your account to keep it safe from suspicious activity.
signin-account-locked-banner-link = Reset your password to sign in



report-signin-link-damaged-body = The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.

report-signin-header = Report unauthorized sign-in?
report-signin-body = You received an email about attempted access to your account. Would you like to report this activity as suspicious?
report-signin-submit-button = Report activity
report-signin-support-link = Why is this happening?
report-signin-error = Sorry, there was a problem submitting the report.

signin-bounced-header = Sorry. We’ve locked your account.
signin-bounced-message = The confirmation email we sent to { $email } was returned and we’ve locked your account to protect your { -brand-firefox } data.
signin-bounced-help = If this is a valid email address, <linkExternal>let us know</linkExternal> and we can help unlock your account.
signin-bounced-create-new-account = No longer own that email? Create a new account
back = Back


signin-passkey-fallback-header = Finish sign-in
signin-passkey-fallback-heading = Enter your password to sync
signin-passkey-fallback-body = To keep your data safe, you need to enter your password when you use this passkey.
signin-passkey-fallback-password-label = Password
signin-passkey-fallback-go-to-settings = Go to settings
signin-passkey-fallback-continue = Continue


signin-push-code-heading-w-default-service = Verify this login <span>to continue to account settings</span>
signin-push-code-heading-w-custom-service = Verify this login <span>to continue to { $serviceName }</span>
signin-push-code-instruction = Please check your other devices and approve this login from your { -brand-firefox } browser.
signin-push-code-did-not-recieve = Didn’t receive the notification?
signin-push-code-send-email-link = Email code


signin-push-code-confirm-instruction = Confirm your login
signin-push-code-confirm-description = We detected a login attempt from the following device. If this was you, please approve the login
signin-push-code-confirm-verifying = Verifying
signin-push-code-confirm-login = Confirm login
signin-push-code-confirm-wasnt-me = This wasn’t me, change password.
signin-push-code-confirm-login-approved = Your login has been approved. Please close this window.
signin-push-code-confirm-link-error = Link is damaged. Please try again.

signin-recovery-method-header = Sign in
signin-recovery-method-subheader = Choose a recovery method
signin-recovery-method-details = Let’s make sure it’s you using your recovery methods.
signin-recovery-method-phone = Recovery phone
signin-recovery-method-code-v2 = Backup authentication codes
signin-recovery-method-code-info-v2 =
  { $numBackupCodes ->
      [one] { $numBackupCodes } code remaining
      *[other] { $numBackupCodes } codes remaining
  }
signin-recovery-method-send-code-error-heading = There was a problem sending a code to your recovery phone
signin-recovery-method-send-code-error-description = Please try again later or use your backup authentication codes.


signin-recovery-code-heading = Sign in
signin-recovery-code-sub-heading = Enter backup authentication code
signin-recovery-code-instruction-v3 = Enter one of the one-time-use codes you saved when you set up two-step authentication.
signin-recovery-code-input-label-v2 = Enter 10-character code
signin-recovery-code-confirm-button = Confirm
signin-recovery-code-phone-link = Use recovery phone
signin-recovery-code-support-link = Are you locked out?
signin-recovery-code-required-error = Backup authentication code required
signin-recovery-code-use-phone-failure = There was a problem sending a code to your recovery phone
signin-recovery-code-use-phone-failure-description = Please try again later.


signin-recovery-phone-flow-heading = Sign in

signin-recovery-phone-heading = Enter recovery code

signin-recovery-phone-instruction-v3 = A 6-digit code was sent to the phone number ending in <span>{ $lastFourPhoneDigits }</span> by text message. This code expires after 5 minutes. Donʼt share this code with anyone.

signin-recovery-phone-input-label = Enter 6-digit code

signin-recovery-phone-code-submit-button = Confirm

signin-recovery-phone-resend-code-button = Resend code
signin-recovery-phone-resend-success = Code sent

signin-recovery-phone-locked-out-link = Are you locked out?

signin-recovery-phone-send-code-error-heading = There was a problem sending a code

signin-recovery-phone-code-verification-error-heading = There was a problem verifying your code

signin-recovery-phone-general-error-description = Please try again later.

signin-recovery-phone-invalid-code-error-description = The code is invalid or expired.
signin-recovery-phone-invalid-code-error-link = Use backup authentication codes instead?

signin-recovery-phone-success-message = Signed in successfully. Limits may apply if you use your recovery phone again.


signin-reported-header = Thank you for your vigilance
signin-reported-message = Our team has been notified. Reports like this help us fend off intruders.


signin-token-code-heading-2 = Enter confirmation code<span> for your { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = Enter the code that was sent to <email>{ $email }</email> within 5 minutes.
signin-token-code-input-label-v2 = Enter 6-digit code
signin-token-code-confirm-button = Confirm
signin-token-code-code-expired = Code expired?
signin-token-code-resend-code-link = Email new code.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Email new code in { $seconds } second
        *[other] Email new code in { $seconds } seconds
    }
signin-token-code-required-error = Confirmation code required
signin-token-code-resend-error = Something went wrong. A new code could not be sent.
signin-token-code-instruction-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.


signin-totp-code-header = Sign in
signin-totp-code-subheader-v2 = Enter two-step authentication code
signin-totp-code-instruction-v4 = Check your <strong>authenticator app</strong> to confirm your sign-in.
signin-totp-code-input-label-v4 = Enter 6-digit code

signin-totp-code-aal-banner-header = Why are you being asked to authenticate?
signin-totp-code-aal-banner-content = You set up two-step authentication on your account, but haven’t signed in with a code on this device yet.
signin-totp-code-aal-sign-out = Sign out on this device
signin-totp-code-aal-sign-out-error = Sorry, there was a problem signing you out

signin-totp-code-confirm-button = Confirm
signin-totp-code-other-account-link = Use a different account
signin-totp-code-recovery-code-link = Trouble entering code?
signin-totp-code-required-error = Authentication code required
signin-totp-code-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.


signin-unblock-header = Authorize this sign-in
signin-unblock-body = Check your email for the authorization code sent to { $email }.
signin-unblock-code-input = Enter authorization code
signin-unblock-submit-button = Continue
signin-unblock-code-required-error = Authorization code required
signin-unblock-code-incorrect-length = Authorization code must contain 8 characters
signin-unblock-code-incorrect-format-2 = Authorization code can only contain letters and/or numbers
signin-unblock-resend-code-button = Not in inbox or spam folder? Resend
signin-unblock-support-link = Why is this happening?
signin-unblock-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.


confirm-signup-code-page-title = Enter confirmation code

confirm-signup-code-heading-2 = Enter confirmation code <span>for your { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = Enter the code that was sent to <email>{ $email }</email> within 5 minutes.
confirm-signup-code-input-label = Enter 6-digit code
confirm-signup-code-confirm-button = Confirm
confirm-signup-code-sync-button = Start syncing
confirm-signup-code-code-expired = Code expired?
confirm-signup-code-resend-code-link = Email new code.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Email new code in { $seconds } second
        *[other] Email new code in { $seconds } seconds
    }
confirm-signup-code-success-alert = Account confirmed successfully
confirm-signup-code-is-required-error = Confirmation code is required
confirm-signup-code-desktop-relay = { -brand-firefox } will try sending you back to use an email mask after you sign in.


signup-heading-v2 = Create a password
signup-relay-info = A password is needed to securely manage your masked emails and access { -brand-mozilla }’s security tools.
signup-sync-info = Sync your passwords, bookmarks, and more everywhere you use { -brand-firefox }.
signup-sync-info-with-payment = Sync your passwords, payment methods, bookmarks, and more everywhere you use { -brand-firefox }.
signup-change-email-link = Change email

signup-confirmed-sync-header = Sync is turned on
signup-confirmed-sync-success-banner = { -product-mozilla-account } confirmed
signup-confirmed-sync-button = Start browsing
signup-confirmed-sync-description-with-payment-v2 = Your passwords, payment methods, addresses, bookmarks, history, and more can sync everywhere you use { -brand-firefox }.
signup-confirmed-sync-description-v2 = Your passwords, addresses, bookmarks, history, and more can sync everywhere you use { -brand-firefox }.
signup-confirmed-sync-add-device-link = Add another device
signup-confirmed-sync-manage-sync-button = Manage sync
signup-confirmed-sync-set-password-success-banner = Sync password created
