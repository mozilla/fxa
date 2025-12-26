## Non-email strings

session-verify-send-push-title-2 = ਤੁਹਾਡੇ { -product-mozilla-account } ਵਿੱਚ ਲਾਗ ਇਨ ਕਰਨਾ ਹੈ?
session-verify-send-push-body-2 = ਇਹ ਤੁਸੀਂ ਹੀ ਹੋ, ਇਹ ਤਸਦੀਕ ਕਰਨ ਲਈ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } ਤੁਹਾਡਾ { -brand-mozilla } ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਹੈ। ਇਸ ਦੀ ਮਿਆਦ 5 ਮਿੰਟਾਂ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } ਤਸਦੀਕੀ ਕੋਡ: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } ਤੁਹਾਡਾ { -brand-mozilla } ਰਿਕਵਰੀ ਕੋਡ ਹੈ। ਇਸ ਦੀ ਮਿਆਦ 5 ਮਿੰਟਾਂ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } ਕੋਡ: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } ਤੁਹਾਡਾ { -brand-mozilla } ਰਿਕਵਰੀ ਕੋਡ ਹੈ। ਇਸ ਦੀ ਮਿਆਦ 5 ਮਿੰਟਾਂ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } ਕੋਡ: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla } ਪਰਦੇਦਾਰੀ ਨੀਤੀ
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = ਇਹ ਆਟੋਮੈਟਿਕ ਈਮੇਲ ਹੈ, ਜੇ ਤੁਹਾਨੂੰ ਇਹ ਗਲਤੀ ਨਾਲ ਮਿਲੀ ਹੈ ਤਾਂ ਕੋਈ ਵੀ ਕਾਰਵਾਈ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।
subplat-privacy-notice = ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ
subplat-privacy-plaintext = ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = { $email } ਨਾਲ { -product-mozilla-account } ਹੋਣ ਅਤੇ ਤੁਹਾਡੇ ਵਲੋਂ { $productName } ਲਈ ਸਾਈਨ ਅੱਪ ਕੀਤਾ ਹੋਣ ਕਰਕੇ ਤੁਹਾਨੂੰ ਇਹ ਈਮੇਲ ਆਈ ਹੈ।
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = { $email } ਨਾਲ { -product-mozilla-account } ਹੋਣ ਕਰਕੇ ਤੁਹਾਨੂੰ ਇਹ ਈਮੇਲ ਮਿਲੀ ਹੈ।
subplat-explainer-multiple-2 = { $email } ਨਾਲ { -product-mozilla-account } ਹੋਣ ਅਤੇ ਤੁਹਾਡੇ ਵਲੋਂ ਕਈ ਉਤਪਾਦਾਂ ਵਾਸਤੇ ਸਾਈਨ ਅੱਪ ਕੀਤਾ ਹੋਣ ਕਰਕੇ ਤੁਹਾਨੂੰ ਇਹ ਈਮੇਲ ਆਈ ਹੈ।
subplat-explainer-was-deleted-2 = { -product-mozilla-account } ਲਈ { $email } ਰਜਿਸਟਰ ਕੀਤਾ ਹੋਣ ਕਰਕੇ ਤੁਹਾਨੂੰ ਇਹ ਈਮੇਲ ਮਿਲੀ ਹੈ।
subplat-manage-account-2 = ਆਪਣੇ <a data-l10n-name="subplat-account-page">ਖਾਤਾ ਸਫ਼ੇ</a> ਨੂੰ ਖੋਲ੍ਹ ਕੇ ਆਪਣੀਆਂ { -product-mozilla-account } ਸੈਟਿੰਗਾਂ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = ਆਪਣੇ ਖਾਤਾ ਸਫ਼ੇ ਨੂੰ ਖੋਲ੍ਹ ਕੇ ਆਪਣੀਆਂ{ -product-mozilla-account } ਸੈਟਿੰਗਾਂ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ: { $accountSettingsUrl }
subplat-terms-policy = ਸ਼ਰਤਾਂ ਅਤੇ ਰੱਦ ਕਰਨ ਦੀ ਨੀਤੀ
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = ਮੈਂਬਰੀ ਰੱਦ ਕਰੋ
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = ਮੈਂਬਰੀ ਫੇਰ ਐਕਟੀਵੇਟ ਕਰੋ
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = ਬਿਲਿੰਗ ਜਾਣਕਾਰੀ ਨੂੰ ਅਪਡੇਟ ਕਰੋ
subplat-privacy-policy = { -brand-mozilla } ਪਰਦੇਦਾਰੀ ਨੀਤੀ
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } ਪਰਦੇਦਾਰੀ ਸੂਚਨਾ
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = ਕਨੂੰਨੀ
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = ਪਰਦੇਦਾਰੀ
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = ਜੇ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਤਾਂ ਤੁਸੀਂ ਹਾਲੇ ਵੀ Mozilla Corporation ਅਤੇ Mozilla Foundation ਤੋਂ ਈਮੇਲਾਂ ਪ੍ਰਾਪਤ ਕਰਦੇ ਰਹੋਗੇ, ਜਦ ਤੱਕ ਕਿ ਤੁਸੀਂ <a data-l10n-name="unsubscribeLink">ਮੈਂਬਰੀ ਨੂੰ ਨਹੀ ਹਟਾ</a> ਦਿੰਦੇ ਹੋ।
account-deletion-info-block-communications-plaintext = ਜੇ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਤਾਂ ਤੁਸੀਂ ਹਾਲੇ ਵੀ Mozilla Corporation ਅਤੇ Mozilla Foundation ਤੋਂ ਈਮੇਲਾਂ ਪ੍ਰਾਪਤ ਕਰਦੇ ਰਹੋਗੇ, ਜਦ ਤੱਕ ਕਿ ਤੁਸੀਂ ਮੈਂਬਰੀ ਨੂੰ ਨਹੀ ਹਟਾ ਦਿੰਦੇ ਹੋ।
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ -google-play } ਉੱਤੇ { $productName } ਡਾਊਨਲੋਡ ਕਰੋ">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ -app-store } ਤੋਂ  { $productName } ਡਾਊਨਲੋਡ ਕਰੋ">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = <a data-l10n-name="anotherDeviceLink">ਹੋਰ ਡੈਸਕਟਾਪ ਡਿਵਾਈਸ</a> ਉੱਤੇ { $productName } ਇੰਸਟਾਲ ਕਰੋ।
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = <a data-l10n-name="anotherDeviceLink">ਹੋਰ ਡਿਵਾਈਸ</a> ਉੱਤੇ { $productName } ਇੰਸਟਾਲ ਕਰੋ।
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Google Play ਤੋਂ { $productName } ਲਵੋ:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = App Store ਤੋਂ { $productName } ਡਾਊਨਲੋਡ ਕਰੋ:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = ਹੋਰ ਡਿਵਾਈਸ ਉੱਤੇ { $productName } ਇੰਸਟਾਲ ਕਰੋ:
automated-email-change-2 = ਜੇ ਤੁਸੀਂ ਇਹ ਕਾਰਵਾਈ ਨਾ ਕੀਤੀ ਤਾਂ <a data-l10n-name="passwordChangeLink">ਆਪਣਾ ਪਾਸਵਰਡ ਹੁਣੇ ਬਦਲੋ</a>।
automated-email-support = ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ <a data-l10n-name="supportLink">{ -brand-mozilla } ਸਹਾਇਤਾ</a> ਨੂੰ ਵੇਖੋ।
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = ਜੇ ਤੁਸੀਂ ਇਹ ਕਾਰਵਾਈ ਨਹੀਂ ਕੀਤੀ ਤਾਂ ਫ਼ੌਰਨ ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ { -brand-mozilla } ਸਹਾਇਤਾ ਨੂੰ ਵੇਖੋ:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ <a data-l10n-name="supportLink">{ -brand-mozilla } ਸਹਿਯੋਗ</a> ਨੂੰ ਵੇਖੋ।
automated-email-no-action-plaintext = ਇਹ ਆਟੋਮੈਟਿਕ ਈਮੇਲ ਹੈ। ਜੇ ਤੁਹਾਨੂੰ ਇਹ ਗਲਤੀ ਨਾਲ ਮਿਲੀ ਹੈ ਤਾਂ ਤੁਹਾਨੂੰ ਕੁਝ ਵੀ ਕਰਨ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = ਜੇ ਆਟੋਮੈਟਿਕ ਈਮੇਲ ਹੈ; ਜੇ ਤੁਸੀਂ ਇਹ ਕਾਰਵਾਈ ਨੂੰ ਪਰਮਾਣਿਤ ਨਹੀਂ ਕੀਤਾ ਹੈ ਤਾਂ ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = ਇਹ ਬੇਨਤੀ { $uaOS } { $uaOSVersion } ਤੋਂ { $uaBrowser } ਵਲੋਂ ਆਈ ਸੀ।
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = ਇਹ ਬੇਨਤੀ { $uaOS } ਤੋਂ { $uaBrowser } ਵਲੋਂ ਆਈ ਸੀ।
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = ਇਹ ਬੇਨਤੀ { $uaBrowser } ਤੋਂ ਆਈ ਸੀ।
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = ਇਹ ਬੇਨਤੀ { $uaOS } { $uaOSVersion } ਤੋਂ ਆਈ ਸੀ।
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = ਇਹ ਬੇਨਤੀ { $uaOS } ਤੋਂ ਆਈ ਸੀ।
automatedEmailRecoveryKey-delete-key-change-pwd = ਜੇ ਇਹ ਤੁਸੀਂ ਨਹੀਂ ਸੀ ਤਾਂ <a data-l10n-name="revokeAccountRecoveryLink">ਨਵੀਂ ਕੁੰਜੀ ਨੂੰ ਹਟਾਓ</a> ਅਤੇ <a data-l10n-name="passwordChangeLink">ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਬਦਲੋ</a>।
automatedEmailRecoveryKey-change-pwd-only = ਜੇ ਇਹ ਤੁਸੀਂ ਨਹੀਂ ਸੀ ਤਾਂ <a data-l10n-name="passwordChangeLink">ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ</a>।
automatedEmailRecoveryKey-more-info = ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ <a data-l10n-name="supportLink">{ -brand-mozilla } ਸਹਾਇਤਾ</a> ਨੂੰ ਵੇਖੋ।
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = ਇਹ ਬੇਨਤੀ ਇਥੋਂ ਆਈ ਸੀ:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = ਜੇ ਇਹ ਤੁਸੀਂ ਨਹੀਂ ਸੀ ਤਾਂ ਨਵੀਂ ਕੁੰਜੀ ਨੂੰ ਹਟਾਓ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = ਜੇ ਇਹ ਤੁਸੀਂ ਨਹੀਂ ਸੀ ਤਾਂ ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ਅਤੇ ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ { -brand-mozilla } ਸਹਾਇਤਾ ਨੂੰ ਵੇਖੋ:
automated-email-reset = ਇਹ ਆਟੋਮੈਟਿਕ ਭੇਜੀ ਗਈ ਈਮੇਲ ਹੈ। ਜੇ ਤੁਸੀਂ ਇਹ ਕਾਰਵਾਈ ਨੂੰ ਖੁਦ ਨਹੀਂ ਕੀਤਾ ਸੀ ਤਾਂ <a data-l10n-name="resetLink">ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ</a>। ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ <a data-l10n-name="supportLink">{ -brand-mozilla } ਸਹਿਯੋਗ</a> ਨੂੰ ਵੇਖੋ।
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = ਜੇ ਤੁਸੀਂ ਇਸ ਕਾਰਵਾਈ ਨੂੰ ਪਰਮਾਣਿਤ ਨਹੀਂ ਕੀਤਾ ਹੈ ਤਾਂ ਹੁਣੇ { $resetLink } ਉੱਤੇ ਜਾ ਕੇ ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = ਜੇ ਤੁਸੀਂ ਇਹ ਕਾਰਵਾਈ ਨਹੀਂ ਕੀਤੀ ਤਾਂ ਫ਼ੌਰਨ ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = ਅਤੇ ਨਾਲ ਹੀ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰੋ:
brand-banner-message = ਕੀ ਤੁਸੀਂ ਜਾਣਦੇ ਹੋ ਕਿ ਅਸੀਂ ਆਪਣਾ ਨਾਂ { -product-firefox-accounts } ਤੋਂ ਬਦਲ ਕੇ { -product-mozilla-accounts } ਕੀਤਾ ਹੈ? <a data-l10n-name="learnMore">ਹੋਰ ਜਾਣੋ</a>
cancellationSurvey = ਇਸ <a data-l10n-name="cancellationSurveyUrl">ਸੰਖੇਪ ਜਿਹੇ ਸਰਵੇਖਣ</a> ਨੂੰ ਪੂਰਾ ਕਰਕੇ ਸਾਨੂੰ ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਬੇਹਤਰ ਬਣਾਉਣ ਲਈ ਸਾਡੀ ਮਦਦ ਕਰੋ।
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = ਇਹ ਛੋਟਾ ਜਿਹਾ ਸਰਵੇਖਣ ਭਰ ਕੇ ਸਾਨੂੰ ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਸੁਧਾਰਨ ਲਈ ਮਦਦ ਕਰੋ:
change-password-plaintext = ਜੇ ਤੁਹਾਨੂੰ ਇਹ ਲੱਗੇ ਕਿ ਕੋਈ ਤੁਹਾਡੇ ਖਾਤੇ ਦੀ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰਨ ਦੀ ਕੋਸ਼ਸ਼ ਕਰ ਰਿਹਾ/ਰਹੀ ਹੈ ਤਾਂ ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ।
manage-account = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
manage-account-plaintext = { manage-account }:
payment-details = ਭੁਗਤਾਨ ਢੰਗ:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = ਇਵਾਇਸ ਨੰਬਰ: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = ਵਸੂਲੇ: { $invoiceDateOnly } ਨੂੰ { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = ਅਗਲਾ ਭੁਗਤਾਨ: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>ਭੁਗਤਾਨ ਦਾ ਢੰਗ:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = ਭੁਗਤਾਨ ਦਾ ਢੰਗ: { $paymentProviderName }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-date = <b>ਤਾਰੀਖ:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = ਤਾਰੀਖ: { $invoiceDateOnly }
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = ਅਧੀਨ ਜੋੜ: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = ਇੱਕ ਵਾਰ ਦੀ ਰਿਆਇਤ
subscription-charges-discount = ਰਿਆਇਤ
subscription-charges-discount-plaintext = ਰਿਆਇਤ: { $invoiceDiscountAmount }
subscription-charges-taxes = ਟੈਕਸ ਅਤੇ ਫੀਸਾਂ
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = ਟੈਕਸ ਅਤੇ ਫ਼ੀਸਾਂ: { $invoiceTaxAmount }
subscription-charges-total = <b>ਕੁੱਲ ਜੋੜ</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = ਕੁੱਲ ਜੋੜ: { $invoiceTotal }
subscription-charges-credit-applied = ਕਰੈਡਿਟ ਲਾਗੂ ਕੀਤਾ
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = ਕਰੈਡਿਟ ਲਾਗੂ ਕੀਤਾ: { $creditApplied }

##

subscriptionSupport = ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਬਾਰੇ ਸਵਾਲ ਹਨ? ਸਾਡੀ <a data-l10n-name="subscriptionSupportUrl">ਸਹਾਇਤਾ ਟੀਮ</a> ਤੁਹਾਡੀ ਮਦਦ ਵਾਸਤੇ ਇੱਥੇ ਮੌਜੂਦ ਹੈ।
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਲਈ ਸਵਾਲ ਹਨ? ਸਾਡੀ ਸਹਾਇਤਾ ਟੀਮ ਤੁਹਾਡੀ ਮਦਦ ਵਾਸਤੇ ਇੱਥੇ ਮੌਜੂਦ ਹੈ:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName } ਦੇ ਮੈਂਬਰ ਬਣਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ ਹੈ। ਜੇ ਤੁਹਾਨੂੰ ਆਪਣੀ ਮੈਂਬਰੀ ਲਈ ਕੋਈ ਸਵਾਲ ਹੋਣ ਜਾਂ { $productName } ਬਾਰੇ ਹੋਰ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ ਤਾਂ <a data-l10n-name="subscriptionSupportUrl">ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ</a>।
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName } ਦੇ ਮੈਂਬਰ ਬਣਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ ਹੈ। ਜੇ ਤੁਹਾਨੂੰ ਆਪਣੀ ਮੈਂਬਰੀ ਲਈ ਕੋਈ ਸਵਾਲ ਹੋਣ ਜਾਂ { $productName } ਬਾਰੇ ਹੋਰ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ ਤਾਂ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।
subscriptionUpdateBillingEnsure = ਤੁਸੀਂ <a data-l10n-name="updateBillingUrl">ਇੱਥੇ</a> ਯਕੀਨੀ ਬਣਾ ਸਕਦੇ ਹੋ ਕਿ ਤੁਹਾਡਾ ਭੁਗਤਾਨ ਦਾ ਢੰਗ ਅਤੇ ਖਾਤਾ ਜਾਣਕਾਰੀ ਦਰੁਸਤ ਹੈ:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = ਤੁਸੀਂ ਇੱਥੇ ਯਕੀਨੀ ਬਣਾ ਸਕਦੇ ਹੋ ਕਿ ਤੁਹਾਡਾ ਭੁਗਤਾਨ ਦਾ ਢੰਗ ਅਤੇ ਖਾਤਾ ਜਾਣਕਾਰੀ ਦਰੁਸਤ ਹੈ:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ <a data-l10n-name="supportLink">{ -brand-mozilla } ਸਹਾਇਤਾ</a> ਨੂੰ ਵੇਖੋ।
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = ਹੋਰ ਜਾਣਕਾਰੀ ਲਈ { -brand-mozilla } ਸਹਿਯੋਗ ਨੂੰ ਵੇਖੋ: { $supportUrl }।
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaOS } { $uaOSVersion } ਉੱਤੇ { $uaBrowser }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaOS } ਉੱਤੇ { $uaBrowser }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (ਅੰਦਾਜ਼ਾ)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (ਅੰਦਾਜ਼ਾ)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (ਅੰਦਾਜ਼ਾ)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (ਅੰਦਾਜ਼)
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = ਇਨਵਾਇਸ ਵੇਖੋ: { $invoiceLink }
cadReminderFirst-subject-1 = ਰਿਮਾਈਂਡਰ! ਆਓ { -brand-firefox } ਸਿੰਕ ਕਰੋ
cadReminderFirst-action = ਹੋਰ ਡਿਵਾਈਸ ਸਿੰਕ ਕਰੋ
cadReminderFirst-action-plaintext = { cadReminderFirst-action }
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = ਸਿੰਕ ਕਰਨ ਲਈ ਦੋ ਚਾਹੀਦੇ ਹਨ
cadReminderSecond-subject-2 = ਖੁੰਝੋ ਨਾ! ਆਓ ਤੁਹਾਡੇ ਸਿੰਕ ਸੈਟਅੱਪ ਨੂੰ ਪੂਰਾ ਕਰੀਏ
cadReminderSecond-action = ਹੋਰ ਡਿਵਾਈਸ ਸਿੰਕ ਕਰੋ
cadReminderSecond-title-2 = ਸਿੰਕ ਕਰਨਾ ਨਾ ਭੁੱਲੋ!
cadReminderSecond-description-sync = ਆਪਣੇ ਬੁੱਕਮਾਰਕ, ਪਾਸਵਰਡ, ਖੋਲ੍ਹੀਆਂ ਟੈਬਾਂ ਅਤੇ ਹੋਰਾਂ ਨੂੰ ਸਿੰਕ ਕਰੋ — ਹਰ ਥਾਂ ਜਿੱਥੇ ਵੀ ਤੁਸੀਂ { -brand-firefox } ਵਰਤਦੇ ਹੋ।
cadReminderSecond-description-plus = ਇਸ ਦੇ ਨਾਲ ਹੀ, ਤੁਹਾਡਾ ਡਾਟਾ ਹਮੇਸ਼ਾਂ ਇਨਕ੍ਰਿਪਟ ਹੁੰਦਾ ਹੈ। ਸਿਰਫ਼ ਤੁਸੀਂ ਤੇ ਤੁਹਾਡੇ ਵਲੋਂ ਮਨਜ਼ੂਰ ਕੀਤੇ ਡਿਵਾਈਸ ਹੀ ਇਸ ਨੂੰ ਵੇਖ ਸਕਦੇ ਹਨ।
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName } ਵਲੋਂ ਜੀ ਆਇਆਂ ਨੂੰ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName } ਵਲੋਂ ਜੀ ਆਇਆਂ ਨੂੰ
downloadSubscription-content-2 = ਆਓ ਤੁਹਾਡੀ ਮੈਂਬਰ ਵਿੱਚ ਸ਼ਾਮਲ ਸਭ ਫੀਚਰਾਂ ਨੂੰ ਵਰਤਣਾ ਸ਼ੁਰੂ ਕਰੀਏ:
downloadSubscription-link-action-2 = ਸ਼ੁਰੂ ਕਰੀਏ
fraudulentAccountDeletion-subject-2 = ਤੁਹਾਡਾ { -product-mozilla-account } ਹਟਾਇਆ ਗਿਆ ਸੀ
fraudulentAccountDeletion-title = ਤੁਹਾਡਾ ਖਾਤਾ ਹਟਾਇਆ ਗਿਆ ਸੀ
fraudulentAccountDeletion-contact = ਜੇ ਤੁਹਾਨੂੰ ਕੋਈ ਵੀ ਸਵਾਲ ਹੋਵੇ ਤਾਂ ਸਾਡੀ <a data-l10n-name="mozillaSupportUrl">ਸਹਿਯੋਗੀ ਟੀਮ</a> ਨਾਲ ਸੰਪਰਕ ਕਰੋ।
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = ਜੇ ਤੁਹਾਨੂੰ ਕੋਈ ਵੀ ਸਵਾਲ ਹੋਵੇ ਤਾਂ ਸਾਡੀ ਸਹਿਯੋਗੀ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰੋ: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = ਆਪਣੇ { -product-mozilla-account } ਨੂੰ ਰੱਖਣ ਲਈ ਆਖਰੀ ਮੌਕਾ ਹੈ
inactiveAccountFinalWarning-title = ਤੁਹਾਡੇ { -brand-mozilla } ਖਾਤੇ ਅਤੇ ਡਾਟੇ ਨੂੰ ਹਟਾਇਆ ਜਾਵੇਗਾ
inactiveAccountFinalWarning-preview = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ
inactiveAccountFinalWarning-action = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ:
inactiveAccountFirstWarning-subject = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਨਾ ਗੁਆਓ
inactiveAccountFirstWarning-title = ਕੀ ਤੁਸੀਂ ਆਪਣੇ { -brand-mozilla } ਖਾਤੇ ਅਤੇ ਡਾਟੇ ਨੂੰ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?
inactiveAccountFirstWarning-inactive-status = ਅਸੀਂ ਦੇਖਿਆ ਹੈ ਕਿ ਤੁਸੀਂ 2 ਸਾਲਾਂ ਤੋਂ ਸਾਈਨ ਇਨ ਨਹੀਂ ਕੀਤਾ ਹੈ।
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = ਤੁਹਾਡੇ ਖਾਤੇ ਅਤੇ ਤੁਹਾਡੇ ਨਿੱਜੀ ਡਾਟੇ ਨੂੰ ਨਾ-ਸਰਗਰਮੀ ਕਰਕੇ <strong>{ $deletionDate }</strong> ਨੂੰ ਪੱਕੇ ਤੌਰ ਉੱਤੇ ਹਟਾਇਆ ਜਾਵੇਗਾ।
inactiveAccountFirstWarning-action = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ
inactiveAccountFirstWarning-preview = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ:
inactiveAccountSecondWarning-subject = ਕਾਰਵਾਈ ਦੀ ਲੋੜ: ਖਾਤਾ 7 ਦਿਨਾਂ ਵਿੱਚ ਹਟਾਇਆ ਜਾਵੇਗਾ
inactiveAccountSecondWarning-title = ਤੁਹਾਡੇ { -brand-mozilla } ਖਾਤੇ ਅਤੇ ਡਾਟੇ ਨੂੰ 7 ਦਿਨਾਂ ਵਿੱਚ ਹਟਾਇਆ ਜਾਵੇਗਾ
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = ਤੁਹਾਡੇ ਖਾਤੇ ਅਤੇ ਤੁਹਾਡੇ ਨਿੱਜੀ ਡਾਟੇ ਨੂੰ ਨਾ-ਸਰਗਰਮੀ ਕਰਕੇ <strong>{ $deletionDate }</strong> ਨੂੰ ਪੱਕੇ ਤੌਰ ਉੱਤੇ ਹਟਾਇਆ ਜਾਵੇਗਾ।
inactiveAccountSecondWarning-action = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ
inactiveAccountSecondWarning-preview = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = ਤੁਹਾਡੇ ਕੋਲ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਖਤਮ ਹੋ ਗਏ ਹਨ!
codes-reminder-title-one = ਤੁਸੀਂ ਆਪਣਾ ਆਖਰੀ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਵਰਤ ਰਹੇ ਹੋ
codes-reminder-title-two = ਹੋਰ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਣਾਉਣ ਦਾ ਵੇਲਾ ਆ ਗਿਆ ਹੈ
codes-reminder-description-part-one = ਜਦੋਂ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਜਾਂਦੇ ਹੋ ਤਾਂ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਤੁਹਾਨੂੰ ਆਪਣੀ ਜਾਣਕਾਰੀ ਬਹਾਲ ਕਰਨ ਲਈ ਮਦਦ ਕਰਦੇ ਹਨ।
codes-reminder-description-part-two = ਹੁਣੇ ਨਵੇਂ ਕੋਡ ਬਣਾਓ ਤਾਂ ਕਿ ਤੁਸੀਂ ਬਾਅਦ ਵਿੱਚ ਆਪਣਾ ਡਾਟਾ ਨਾ ਗੁਆ ਦਿਓ।
codes-reminder-description-two-left = ਸਿਰਫ਼਼ ਦੋ ਹੀ ਕੋਡ ਬਾਕੀ ਬਚੇ ਹਨ।
codes-reminder-description-create-codes = ਜੇ ਕਿਤੇ ਤੁਸੀਂ ਲਾਕ ਆਉਟ ਹੋ ਜਾਵੋ ਤਾਂ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਵਾਪਸ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਮਦਦ ਵਾਸਤੇ ਨਵਾਂ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਣਾਓ।
lowRecoveryCodes-action-2 = ਕੋਡ ਬਣਾਓ
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] ਕੋਈ ਵੀ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਾਕੀ ਨਹੀਂ ਰਿਹਾ
        [one] ਸਿਰਫ਼਼ 1 ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਾਕੀ ਹੈ
       *[other] ਸਿਰਫ਼਼ { $numberRemaining } ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਕੋਡ ਬਾਕੀ ਹਨ!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } ਲਈ ਨਵਾਂ ਸਾਈਨ-ਇਨ
newDeviceLogin-subjectForMozillaAccount = ਤੁਹਾਡੇ { -product-mozilla-account } ਵਿੱਚ ਨਵਾਂ ਸਾਈਨ-ਇਨ
newDeviceLogin-title-3 = ਤੁਹਾਡਾ { -product-mozilla-account } ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਵਰਤਿਆ ਗਿਆ ਸੀ
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = ਤੁਸੀ ਨਹੀਂ? <a data-l10n-name="passwordChangeLink">ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ</a>।
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = ਤੁਸੀਂ ਨਹੀਂ? ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ:
newDeviceLogin-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
passwordChanged-subject = ਪਾਸਵਰਡ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ
passwordChanged-title = ਪਾਸਵਰਡ ਕਾਮਯਾਬੀ ਨਾਲ ਬਦਲਿਆ
passwordChanged-description-2 = ਤੁਹਾਡਾ{ -product-mozilla-account } ਪਾਸਵਰਡ ਹੇਠ ਦਿੱਤੇ ਡਿਵਾਈਸ ਤੋਂ ਕਾਮਯਾਬੀ ਨਾਲ ਬਦਲਿਆ ਗਿਆ:
passwordChangeRequired-subject = ਸ਼ੱਕੀ ਸਰਗਰਮੀ ਖੋਜੀ ਗਈ ਹੈ
passwordChangeRequired-preview = ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਫੌਰਨ ਬਦਲੋ
passwordChangeRequired-title-2 = ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਬਦਲੋ
passwordChangeRequired-action = ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }
password-forgot-otp-title = ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਹੋ?
password-forgot-otp-request = ਸਾਨੂੰ ਤੁਹਾਡੇ { -product-mozilla-account } ਰਾਹੀਂ ਇਸ ਤੋਂ ਪਾਸਵਰਡ ਬਦਲਣ ਦੀ ਬੇਨਤੀ ਮਿਲੀ ਹੈ:
password-forgot-otp-code-2 = ਜੇ ਇਹ ਤੁਸੀਂ ਹੋ ਤਾਂ ਜਾਰੀ ਰੱਖਣ ਲਈ ਤੁਹਾਡਾ ਤਸਦੀਕੀਕਰਨ ਕੋਡ ਇਹ ਹੈ:
password-forgot-otp-expiry-notice = ਇਹ ਕੋਡ ਦੀ ਮਿਆਦ 10 ਮਿੰਟ ਹੈ।
passwordReset-subject-2 = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
passwordReset-title-2 = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = ਤੁਸੀਂ ਇਸ ਉੱਤੇ ਆਪਣਾ { -product-mozilla-account } ਮੁੜ-ਸੈੱਟ ਕੀਤਾ:
passwordResetAccountRecovery-subject-2 = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
passwordResetAccountRecovery-title-3 = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = ਤੁਸੀਂ ਆਪਣੇ { -product-mozilla-account } ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ-ਸੈੱਟ ਕਰਨ ਲਈ ਆਪਣੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨੂੰ ਵਰਤਿਆ ਹੈ:
passwordResetAccountRecovery-information = ਅਸੀਂ ਤੁਹਾਡੇ ਸਾਰੇ ਸਿੰਕ ਕੀਤੇ ਡਿਵਾਈਸਾਂ ਤੋਂ ਲਾਗ ਆਉਟ ਕਰ ਦਿੱਤਾ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੇ ਵਲੋਂ ਵਰਤੀ ਗਈ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਲਈ ਨਵੀਂ ਬਣਾਈ ਹੈ। ਤੁਸੀਂ ਆਪਣੀਆਂ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਇਸ ਨੂੰ ਬਦਲ ਸਕਦੇ ਹੋ।
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = ਅਸੀਂ ਤੁਹਾਡੇ ਸਾਰੇ ਸਿੰਕ ਕੀਤੇ ਡਿਵਾਈਸਾਂ ਤੋਂ ਲਾਗ ਆਉਟ ਕਰ ਦਿੱਤਾ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੇ ਵਲੋਂ ਵਰਤੀ ਗਈ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਲਈ ਨਵੀਂ ਬਣਾਈ ਹੈ। ਤੁਸੀਂ ਆਪਣੀਆਂ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਇਸ ਨੂੰ ਬਦਲ ਸਕਦੇ ਹੋ:
passwordResetAccountRecovery-action-4 = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
passwordResetRecoveryPhone-subject = ਰਿਕਵਰੀ ਫ਼ੋਨ ਵਰਤਿਆ ਗਿਆ
passwordResetRecoveryPhone-preview = ਜਾਂਚ ਕਿ ਇਹ ਤੁਸੀਂ ਹੀ ਸੀ
passwordResetRecoveryPhone-device = ਇੱਥੋਂ ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਵਰਤਿਆ ਗਿਆ:
passwordResetRecoveryPhone-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
passwordResetWithRecoveryKeyPrompt-subject = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
passwordResetWithRecoveryKeyPrompt-title = ਤੁਹਾਡੇ ਪਾਸਵਰਡ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕੀਤਾ ਗਿਆ ਹੈ
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = ਤੁਸੀਂ ਇਸ ਉੱਤੇ ਆਪਣਾ { -product-mozilla-account } ਮੁੜ-ਸੈੱਟ ਕੀਤਾ:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ:
postAddAccountRecovery-subject-3 = ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਈ ਗਈ
postAddAccountRecovery-title2 = ਤੁਸੀਂ ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਈ ਹੈ
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = ਇਸ ਕੁੰਜੀ ਨੂੰ ਸੁਰੱਖਿਅਤ ਥਾਂ ਉੱਤੇ ਰੱਖੋ — ਜੇ ਕਦੇ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਤਾਂ ਤੁਹਾਨੂੰ ਇਹ ਆਪਣੇ ਇੰਕ੍ਰਿਪਟ ਕੀਤੇ ਬਰਾਊਜ਼ਿੰਗ ਡਾਟੇ ਨੂੰ ਬਹਾਲ ਕਰਨ ਲਈ ਚਾਹੀਦੀ ਹੋਵੇਗੀ।
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = ਇਹ ਕੁੰਜੀ ਸਿਰਫ਼ ਇੱਕ ਹੀ ਵਾਰ ਵਰਤੀ ਜਾ ਸਕਦੀ ਹੈ। ਤੁਹਾਡੇ ਵਲੋਂ ਵਰਤੇ ਜਾਣ ਦੇ ਬਾਅਦ ਅਸੀਂ ਤੁਹਾਡੇ ਲਈ ਆਪਣੇ-ਆਪ ਨਵੀਂ ਬਣਾ ਦੇਵਾਂਗੇ। ਜਾਂ ਤੁਸੀਂ ਆਪਣੀਆਂ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਜਾ ਕੇ ਕਦੇ ਵੀ ਨਵੀਂ ਬਣਾ ਸਕਦੇ ਹੋ।
postAddAccountRecovery-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postAddLinkedAccount-subject-2 = ਤੁਹਾਡੇ { -product-mozilla-account } ਨਾਲ ਨਵਾਂ ਖਾਤਾ ਲਿੰਕ ਕੀਤਾ ਗਿਆ
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = oੁਹਾਡੇ { $providerName } ਨੂੰ ਤੁਹਾਡੇ { -product-mozilla-account } ਨਾਲ ਲਿੰਕ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ
postAddLinkedAccount-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postAddRecoveryPhone-subject = ਰਿਕਵਰੀ ਫ਼ੋਨ ਜੋੜਿਆ ਗਿਆ
postAddRecoveryPhone-preview = ਖਾਤਾ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਨਾਲ ਸੁਰੱਖਿਅਤ ਹੈ
postAddRecoveryPhone-title-v2 = ਤੁਸੀਂ ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੰਬਰ ਜੋੜਿਆ ਸੀ
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ
postAddRecoveryPhone-how-protect-plaintext = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ:
postAddRecoveryPhone-enabled-device = ਤੁਸੀ ਇਸ ਨੂੰ ਇੱਥੋਂ ਸਮਰੱਥ ਕੀਤਾ:
postAddRecoveryPhone-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postAddTwoStepAuthentication-preview = ਤੁਹਾਡਾ ਖਾਤਾ ਸੁਰੱਖਿਅਤ ਹੈ
postAddTwoStepAuthentication-subject-v3 = ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਚਾਲੂ ਹੈ
postAddTwoStepAuthentication-title-2 = ਤੁਸੀਂ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਚਾਲੂ ਕੀਤੀ
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = ਇਸ ਤੋਂ ਤੁਸੀਂ ਬੇਨਤੀ ਕੀਤੀ ਸੀ:
postAddTwoStepAuthentication-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postAddTwoStepAuthentication-recovery-method-codes = ਤੁਸੀਂ ਆਪਣੇ ਰਿਕਵਰੀ ਢੰਗ ਵਜੋਂ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਨੂੰ ਵੀ ਜੋੜਿਆ ਹੈ।
postAddTwoStepAuthentication-how-protects-link = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ
postAddTwoStepAuthentication-how-protects-plaintext = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ:
postChangeAccountRecovery-subject = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਦਲੀ ਗਈ
postChangeAccountRecovery-title = ਤੁਸੀਂ ਆਪਣੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨੂੰ ਬਦਲਿਆ ਹੈ
postChangeAccountRecovery-body-part1 = ਤੁਹਾਡੇ ਕੋਲ ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹੈ। ਤੁਹਾਡੀ ਪੁਰਾਣੀ ਕੁੰਜੀ ਨੂੰ ਹਟਾਇਆ ਗਿਆ ਹੈ।
postChangeAccountRecovery-body-part2 = ਇਸ ਨਵੀਂ ਕੁੰਜੀ ਨੂੰ ਸੁਰੱਖਿਅਤ ਥਾਂ ਉੱਤੇ ਰੱਖੋ — ਜੇ ਕਦੇ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਤਾਂ ਤੁਹਾਨੂੰ ਇਹ ਆਪਣੇ ਇੰਕ੍ਰਿਪਟ ਕੀਤੇ ਬਰਾਊਜ਼ਿੰਗ ਡਾਟੇ ਨੂੰ ਬਹਾਲ ਕਰਨ ਲਈ ਚਾਹੀਦੀ ਹੋਵੇਗੀ।
postChangeAccountRecovery-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postChangePrimary-subject = ਮੁੱਢਲਾ ਈਮੇਲ ਅੱਪਡੇਟ ਕੀਤਾ
postChangePrimary-title = ਨਵਾਂ ਮੁੱਢਲਾ ਈਮੇਲ
postChangePrimary-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postChangeRecoveryPhone-subject = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ
postChangeRecoveryPhone-preview = ਖਾਤਾ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਨਾਲ ਸੁਰੱਖਿਅਤ ਹੈ
postChangeRecoveryPhone-title = ਤੁਸੀਂ ਆਪਣੇ ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਬਦਲਿਆ ਹੈ
postChangeRecoveryPhone-description = ਤੁਹਾਡੇ ਕੋਲ ਹੁਣ ਨਵਾਂ ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੰਬਰ ਹੈ। ਤੁਹਾਡਾ ਪੁਰਾਣਾ ਫ਼ੋਨ ਨੰਬਰ ਹਟਾਇਆ ਗਿਆ ਸੀ।
postChangeRecoveryPhone-requested-device = ਤੁਸੀ ਇਸ ਨੂੰ ਇੱਥੋਂ ਬੇਨਤੀ ਕੀਤੀ ਸੀ:
postChangeTwoStepAuthentication-preview = ਤੁਹਾਡਾ ਖਾਤਾ ਸੁਰੱਖਿਅਤ ਹੈ
postChangeTwoStepAuthentication-subject = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਨੂੰ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ
postChangeTwoStepAuthentication-title = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣਕਿਤਾ ਨੂੰ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ ਹੈ
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = ਇਸ ਤੋਂ ਤੁਸੀਂ ਬੇਨਤੀ ਕੀਤੀ ਸੀ:
postChangeTwoStepAuthentication-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postChangeTwoStepAuthentication-how-protects-link = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ
postChangeTwoStepAuthentication-how-protects-plaintext = ਇਹ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਿਵੇਂ ਕਰਦਾ ਹੈ:
postConsumeRecoveryCode-title-3 = ਤੁਹਾਡੇ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਨੂੰ ਪਾਸਵਰਡ ਮੁੜ-ਸੈੱਟ ਕਰਨ ਦੌਰਾਨ ਤਸਦੀਕ ਕਰਨ ਲਈ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = ਇਸ ਤੋਂ ਕੋਡ ਵਰਤਿਆ:
postConsumeRecoveryCode-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postConsumeRecoveryCode-subject-v3 = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਵਰਤਿਆ
postConsumeRecoveryCode-preview = ਜਾਂਚ ਕਿ ਇਹ ਤੁਸੀਂ ਹੀ ਸੀ
postNewRecoveryCodes-subject-2 = ਨਵੇਂ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਣਾਏ
postNewRecoveryCodes-title-2 = ਤੁਸੀਂ ਨਵੇਂ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਬਣਾਏ
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = ਇਹਨਾਂ ਨੂੰ ਇੱਥੇ ਬਣਾਇਆ ਗਿਆ ਸੀ:
postNewRecoveryCodes-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postRemoveAccountRecovery-subject-2 = ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹਟਾਈ ਗਈ
postRemoveAccountRecovery-title-3 = ਤੁਸੀਂ ਆਪਣੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਹਟਾਈ ਹੈ
postRemoveAccountRecovery-body-part1 = ਜੇ ਤੁਸੀਂ ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਜਾਓ ਤਾਂ ਤੁਹਾਡੇ ਇੰਕ੍ਰਿਪਟ ਕੀਤੇ ਬਰਾਊਜ਼ਿੰਗ ਡਾਟੇ ਨੂੰ ਬਹਾਲ ਕਰਨ ਲਈ ਤੁਹਾਡੀ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਚਾਹੀਦੀ ਹੈ।
postRemoveAccountRecovery-body-part2 = ਜੇ ਤੁਸੀਂ ਹਾਲੇ ਤੱਕ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਨਹੀਂ ਬਣਾਈ ਹੈ ਤਾਂ ਆਪਣੇ ਸੰਭਾਲੇ ਪਾਸਵਰਡਾਂ, ਬੁੱਕਮਾਰਕਾਂ, ਬਰਾਊਜ਼ਿੰਗ ਅਤੀਤ ਅਤੇ ਹੋਰ ਚੀਜ਼ਾਂ ਨੂੰ ਗੁੰਮਣ ਤੋਂ ਬਚਾਉਣ ਲਈ ਆਪਣੀਆਂ ਖਾਤਾ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਜਾ ਕੇ ਨਵੀਂ ਖਾਤਾ ਰਿਕਵਰੀ ਕੁੰਜੀ ਬਣਾਓ।
postRemoveAccountRecovery-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postRemoveRecoveryPhone-subject = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਹਟਾਇਆ ਗਿਆ
postRemoveRecoveryPhone-preview = ਖਾਤਾ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਨਾਲ ਸੁਰੱਖਿਅਤ ਹੈ
postRemoveRecoveryPhone-title = ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਹਟਾਇਆ ਗਿਆ
postRemoveRecoveryPhone-requested-device = ਤੁਸੀ ਇਸ ਨੂੰ ਇੱਥੋਂ ਬੇਨਤੀ ਕੀਤੀ ਸੀ:
postRemoveSecondary-subject = ਸੈਕੰਡਰੀ ਈਮੇਲ ਹਟਾਈ
postRemoveSecondary-title = ਸੈਕੰਡਰੀ ਈਮੇਲ ਹਟਾਈ
postRemoveSecondary-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postRemoveTwoStepAuthentication-subject-line-2 = ਦੋ-ਪੜਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਬੰਦ ਹੈ
postRemoveTwoStepAuthentication-title-2 = ਤੁਸੀਂ ਦੋ-ਪੜ੍ਹਾਵੀਂ ਪਰਮਾਣੀਕਰਨ ਬੰਦ ਕੀਤੀ
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = ਤੁਸੀ ਇਸ ਨੂੰ ਇੱਥੋਂ ਅਸਮਰੱਥ ਕੀਤਾ:
postRemoveTwoStepAuthentication-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postRemoveTwoStepAuthentication-not-required-2 = ਸਾਈਨ ਇਨ ਕਰਨ ਸਮੇਂ ਹੁਣ ਤੁਹਾਨੂੰ ਆਪਣੀ ਪਰਮਾਣੀਕਰਨ ਐਪ ਤੋਂ ਸੁਰੱਖਿਆ ਕੋਡਾਂ ਦੀ ਲੋੜ ਨਹੀਂ ਰਹੀ ਹੈ।
postSigninRecoveryCode-subject = ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਨੂੰ ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਵਰਤਿਆ ਗਿਆ ਸੀ
postSigninRecoveryCode-preview = ਖਾਤਾ ਸਰਗਰਮੀ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
postSigninRecoveryCode-title = ਤੁਹਾਡੇ ਬੈਕਅੱਪ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਨੂੰ ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਵਰਤਿਆ ਗਿਆ ਸੀ
postSigninRecoveryCode-description = ਜੇ ਤੁਸੀਂ ਇਹ ਨਹੀਂ ਕੀਤਾ ਹੈ ਤਾਂ ਤੁਹਾਨੂੰ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਫ਼ੌਰਨ ਬਦਲਣਾ ਚਾਹੀਦਾ ਹੈ।
postSigninRecoveryCode-device = ਤੁਸੀਂ ਇਸ ਤੋਂ ਸਾਈਨ ਇਨ ਕੀਤਾ:
postSigninRecoveryCode-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postSigninRecoveryPhone-subject = ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਵਰਤਿਆ ਰਿਕਵਰੀ ਫ਼ੋਨ
postSigninRecoveryPhone-preview = ਖਾਤਾ ਸਰਗਰਮੀ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
postSigninRecoveryPhone-title = ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਤੁਹਾਡੇ ਰਿਕਵਰੀ ਫ਼ੋਨ ਨੂੰ ਵਰਤਿਆ ਗਿਆ ਸੀ
postSigninRecoveryPhone-description = ਜੇ ਤੁਸੀਂ ਇਹ ਨਹੀਂ ਕੀਤਾ ਹੈ ਤਾਂ ਤੁਹਾਨੂੰ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਆਪਣੇ ਪਾਸਵਰਡ ਨੂੰ ਫ਼ੌਰਨ ਬਦਲਣਾ ਚਾਹੀਦਾ ਹੈ।
postSigninRecoveryPhone-device = ਤੁਸੀਂ ਇਸ ਤੋਂ ਸਾਈਨ ਇਨ ਕੀਤਾ:
postSigninRecoveryPhone-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
postVerify-sub-title-3 = ਸਾਨੂੰ ਤੁਹਾਨੂੰ ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ!
postVerify-title-2 = ਦੋ ਡਿਵਾਈਸਾਂ ਉੱਤੇ ਇੱਕੋ ਟੈਬ ਵੇਖਣੀ ਚਾਹੁੰਦੇ ਹੋ?
postVerify-description-2 = ਸੌਖਾ ਹੀ ਹੈ! ਹੋਰ ਡਿਵਾਈਸ ਉੱਤੇ { -brand-firefox } ਇੰਸਟਾਲ ਕਰੋ ਤੇ ਸਿੰਕ ਕਰਨ ਲਈ ਲਾਗਇਨ ਕਰੋ। ਜਾਦੂ ਮੰਤਰ ਵਾਗੂੰ!
postVerify-subject-4 = { -brand-mozilla } ਵਲੋਂ ਜੀ ਆਇਆਂ ਨੂੰ!
postVerify-setup-2 = ਹੋਰ ਡਿਵਾਈਸ ਨੂੰ ਕਨੈਕਟ ਕਰੋ:
postVerify-action-2 = ਹੋਰ ਡਿਵਾਈਸ ਨਾਲ ਕਨੈਕਟ ਕਰੋ
postVerifySecondary-subject = ਸਹਾਇਕ ਈਮੇਲ ਜੋੜਿਆ ਗਿਆ
postVerifySecondary-title = ਸਹਾਇਕ ਈਮੇਲ ਜੋੜਿਆ ਗਿਆ
postVerifySecondary-action = ਖਾਤੇ ਦਾ ਇੰਤਜ਼ਾਮ ਕਰੋ
recovery-subject = ਆਪਣਾ ਪਾਸਵਰਡ ਬਦਲੋ
recovery-title-2 = ਆਪਣਾ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਹੋ?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = ਸਾਨੂੰ ਤੁਹਾਡੇ { -product-mozilla-account } ਰਾਹੀਂ ਇਸ ਤੋਂ ਪਾਸਵਰਡ ਬਦਲਣ ਦੀ ਬੇਨਤੀ ਮਿਲੀ ਹੈ:
recovery-new-password-button = ਹੇਠ ਦਿੱਤੇ ਬਟਨ ਨੂੰ ਕਲਿੱਕ ਕਰਕੇ ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਓ। ਇਸ ਲਿੰਕ ਦੀ ਮਿਆਦ ਅਗਲੇ ਘੰਟੇ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
recovery-copy-paste = ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਉਣ ਲਈ ਹੇਠਲੇ URL ਨੂੰ ਆਪਣੇ ਬਰਾਊਜ਼ਰ ਵਿੱਚ ਕਾਪੀ ਕਰਕੇ ਚੇਪੋ। ਇਸ ਲਿੰਕ ਦੀ ਮਿਆਦ ਅਗਲੇ ਘੰਟੇ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
recovery-action = ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਓ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = ਤੁਹਾਡੀ { $productName } ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ
subscriptionAccountDeletion-title = ਤੁਹਾਡੇ ਛੱਡਣ ਲਈ ਅਫ਼ਸੋਸ ਹੈ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = ਤੁਸੀਂ ਆਪਣੇ { -product-mozilla-account } ਨੂੰ ਹੁਣੇ ਹਟਾਇਆ ਹੈ। ਨਤੀਜੇ ਵਜੋਂ ਅਸੀਂ ਤੁਹਾਡੀ { $productName } ਮੈਂਬਰੀ ਰੱਦ ਕਰ ਦਿੱਤੀ ਹੈ। { $invoiceTotal } ਦਾ ਤੁਹਾਡਾ ਆਖਰੀ ਭੁਗਤਾਨ { $invoiceDateOnly } ਨੂੰ ਕੀਤਾ ਗਿਆ ਸੀ।
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = { $productName } ਲਈ ਜੀ ਆਇਆਂ ਨੂੰ: ਆਪਣਾ ਪਾਸਵਰਡ ਸੈੱਟ ਅੱਪ ਕਰੋ।
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName } ਵਲੋਂ ਜੀ ਆਇਆਂ ਨੂੰ
subscriptionAccountFinishSetup-content-create-3 = ਅੱਗੇ ਤੁਸੀਂ ਆਪਣੀ ਨਵੀਂ ਮੈਂਬਰੀ ਵਰਤਣ ਲਈ { -product-mozilla-account } ਪਾਸਵਰਡ ਬਣਾਉਂਗੇ।
subscriptionAccountFinishSetup-action-2 = ਸ਼ੁਰੂ ਕਰੀਏ
subscriptionAccountReminderFirst-subject = ਸੂਚਨਾ: ਆਪਣਾ ਖਾਤੇ ਦੇ ਸੈਟਅੱਪ ਨੂੰ ਪੂਰਾ ਕਰੋ
subscriptionAccountReminderFirst-title = ਤੁਸੀਂ ਆਪਣੀ ਮੈਂਬਰੀ ਨੂੰ ਹਾਲੇ ਵਰਤ ਨਹੀਂ ਸਕਦੇ ਹੋ
subscriptionAccountReminderFirst-content-info-3 = ਕੁਝ ਦਿਨ ਪਹਿਲਾਂ ਤੁਸੀਂ { -product-mozilla-account } ਬਣਾਇਆ ਸੀ, ਪਰ ਹਾਲੇ ਤੱਕ ਤਸਦੀਕ ਨਹੀਂ ਕੀਤਾ ਹੈ। ਸਾਨੂੰ ਆਸ ਹੈ ਕਿ ਤੁਸੀਂ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਸੈਟਅੱਪ ਕਰਨਾ ਪੂਰਾ ਕਰੋਗੇ ਤਾਂ ਕਿ ਤੁਸੀਂ ਆਪਣੀ ਨਵੀਂ ਮੈਂਬਰ ਵਰਤ ਸਕੋ।
subscriptionAccountReminderFirst-content-select-2 = ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਉਣ ਵਾਸਤੇ “ਪਾਸਵਰਡ ਬਣਾਓ” ਨੂੰ ਚੁਣੋ ਅਤੇ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰਨਾ ਪੂਰਾ ਕਰੋ।ਆਪਣੇ ਬਰਾਊਜ਼ਰ ਵਿਚ
subscriptionAccountReminderFirst-action = ਪਾਸਵਰਡ ਬਣਾਓ
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = ਆਖਰੀ ਰਿਮਾਈਂਡਰ: ਆਪਣਾ ਖਾਤਾ ਸੈਟਅੱਪ  ਕਰੋ
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } ਵਲੋਂ ਜੀ ਆਇਆਂ ਨੂੰ!
subscriptionAccountReminderSecond-content-info-3 = ਕੁਝ ਦਿਨ ਪਹਿਲਾਂ ਤੁਸੀਂ { -product-mozilla-account } ਬਣਾਇਆ ਸੀ, ਪਰ ਹਾਲੇ ਤੱਕ ਤਸਦੀਕ ਨਹੀਂ ਕੀਤਾ ਹੈ। ਸਾਨੂੰ ਆਸ ਹੈ ਕਿ ਤੁਸੀਂ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਸੈਟਅੱਪ ਕਰਨਾ ਪੂਰਾ ਕਰੋਗੇ ਤਾਂ ਕਿ ਤੁਸੀਂ ਆਪਣੀ ਨਵੀਂ ਮੈਂਬਰ ਵਰਤ ਸਕੋ।
subscriptionAccountReminderSecond-content-select-2 = ਨਵਾਂ ਪਾਸਵਰਡ ਬਣਾਉਣ ਵਾਸਤੇ “ਪਾਸਵਰਡ ਬਣਾਓ” ਨੂੰ ਚੁਣੋ ਅਤੇ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰਨਾ ਪੂਰਾ ਕਰੋ।
subscriptionAccountReminderSecond-action = ਪਾਸਵਰਡ ਬਣਾਓ
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = ਤੁਹਾਡੀ { $productName } ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ
subscriptionCancellation-title = ਤੁਹਾਡੇ ਛੱਡਣ ਲਈ ਅਫ਼ਸੋਸ ਹੈ

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = ਤੁਸੀਂ { $productName } ਲਈ ਤਬਦੀਲ ਕਰ ਚੁੱਕੇ ਹੋ
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = ਤੁਸੀਂ ਕਾਮਯਾਬੀ ਨਾਲ { $productNameOld } ਤੋਂ { $productName } ਲਈ ਬਦਲ ਚੁੱਕੇ ਹੋ।
subscriptionDowngrade-content-auto-renew = ਜਦ ਤੱਕ ਤੁਸੀਂ ਆਪਣੀ ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਨਹੀਂ ਕਰਦੇ ਹੋ, ਤਦ ਤੱਕ ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਹਰ ਬਿੱਲਿੰਗ ਸਮੇਂ ਉੱਤੇ ਆਪਣੇ-ਆਪ ਨਵਿਆਈ ਜਾਵੇਗੀ।
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = ਤੁਹਾਡੀ { $productName } ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ
subscriptionFailedPaymentsCancellation-title = ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਕੀਤਾ ਜਾ ਚੁੱਕਾ ਹੈ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } ਭੁਗਤਾਨ ਦੀ ਤਸਦੀਕ ਕੀਤੀ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName } ਲਈ ਮੈਂਬਰ ਬਣਨ ਵਾਸਤੇ ਤੁਹਾਡਾ ਧੰਨਵਾਦ ਹੈ
subscriptionFirstInvoice-content-auto-renew = ਜਦ ਤੱਕ ਤੁਸੀਂ ਆਪਣੀ ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਨਹੀਂ ਕਰਦੇ ਹੋ, ਤਦ ਤੱਕ ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਹਰ ਬਿੱਲਿੰਗ ਸਮੇਂ ਉੱਤੇ ਆਪਣੇ-ਆਪ ਨਵਿਆਈ ਜਾਵੇਗੀ।
subscriptionPaymentExpired-title-2 = ਤੁਹਾਡੇ ਭੁਗਤਾਨ ਢੰਗ ਦੀ ਮਿਆਦ ਪੁੱਗੀ ਜਾਂ ਛੇਤੀ ਹੀ ਪੁੱਗਣ ਵਾਲੀ ਹੈ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } ਭੁਗਤਾਨ ਅਸਫ਼ਲ ਹੋਇਆ
subscriptionPaymentFailed-title = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਸਾਨੂੰ ਤੁਹਾਡੇ ਭੁਗਤਾਨ ਨਾਲ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = ਸਾਨੂੰ { $productName } ਲਈ ਤੁਹਾਡੇ ਨਵੇਂ ਭੁਗਤਾਨ ਨਾਲ ਸਮੱਸਿਆ ਆਈ ਸੀ।
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } ਲਈ ਭੁਗਤਾਨ ਜਾਣਕਾਰੀ ਅੱਪਡੇਟ ਕਰਨ ਦੀ ਲੋੜ ਹੈ
subscriptionPaymentProviderCancelled-title = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਸਾਨੂੰ ਤੁਹਾਡੇ ਭੁਗਤਾਨ ਢੰਗ ਨਾਲ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } ਮੈਂਬਰੀ ਮੁੜ-ਸਰਗਰਮ ਕੀਤੀ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ਤੁਹਾਡੀ { $productName } ਮੈਂਬਰ ਮੁੜ-ਸਰਗਰਮ ਕਰਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ!
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } ਆਪਣੇ-ਆਪ ਨਵਿਆਉਣ ਨੋਟਿਸ
subscriptionRenewalReminder-title = ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਨੂੰ ਛੇਤੀ ਹੀ ਨਵਿਆਇਆ ਜਾਵੇਗਾ
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = ਸਤਿਕਾਰਯੋਗ { $productName } ਗਾਹਕ,
subscriptionRenewalReminder-content-closing = ਤਹਿ ਦਿਲੋਂ,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } ਟੀਮ
subscriptionReplaced-title = ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਨੂੰ ਅੱਪਡੇਟ ਕੀਤਾ ਜਾ ਚੁੱਕਿਆ ਹੈ
subscriptionReplaced-content-no-action = ਤੁਹਾਡੇ ਵਲੋਂ ਕਿਸੇ ਵੀ ਕਾਰਵਾਈ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } ਮੈਂਬਰੀਆਂ ਲਈ ਭੁਗਤਾਨ ਜਾਣਕਾਰੀ ਅੱਪਡੇਟ ਕਰਨ ਦੀ ਲੋੜ ਹੈ
subscriptionsPaymentProviderCancelled-title = ਅਫ਼ਸੋਸ ਹੈ ਕਿ ਸਾਨੂੰ ਤੁਹਾਡੇ ਭੁਗਤਾਨ ਢੰਗ ਨਾਲ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } ਭੁਗਤਾਨ ਮਿਲਿਆ
subscriptionSubsequentInvoice-title = ਮੈਂਬਰ ਬਣਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ ਹੈ!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = ਅਸੀਂ { $productName } ਲਈ ਤੁਹਾਡਾ ਨਵਾਂ ਭੁਗਤਾਨ ਪ੍ਰਾਪਤ ਕਰ ਲਿਆ ਹੈ।
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = ਤੁਸੀਂ { $productName } ਲਈ ਅੱਪਗਰੇਡ ਕਰ ਲਿਆ ਹੈ
subscriptionUpgrade-title = ਅੱਪਗਰੇਡ ਕਰਨ ਲਈ ਤੁਹਾਡਾ ਧੰਨਵਾਦ ਹੈ!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = ਜਦ ਤੱਕ ਤੁਸੀਂ ਆਪਣੀ ਮੈਂਬਰੀ ਨੂੰ ਰੱਦ ਨਹੀਂ ਕਰਦੇ ਹੋ, ਤਦ ਤੱਕ ਤੁਹਾਡੀ ਮੈਂਬਰੀ ਹਰ ਬਿੱਲਿੰਗ ਸਮੇਂ ਉੱਤੇ ਆਪਣੇ-ਆਪ ਨਵਿਆਈ ਜਾਵੇਗੀ।
unblockCode-title = ਕੀ ਤੁਸੀਂ ਸਾਈਨ ਇਨ ਕੀਤਾ ਹੈ?
unblockCode-prompt = ਜੇ ਹਾਂ ਤਾਂ ਇਹ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਤੁਹਾਨੂੰ ਚਾਹੀਦਾ ਹੈ:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = ਜੇ ਹਾਂ ਤਾਂ ਇਹ ਪਰਮਾਣਕਿਤਾ ਕੋਡ ਤੁਹਾਨੂੰ ਚਾਹੀਦਾ ਹੈ: { $unblockCode }
verificationReminderFinal-subject = ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰਨ ਲਈ ਆਖਰੀ ਰਿਮਾਈਂਡਰ
confirm-account = ਖਾਤੇ ਦੀ ਤਸਦੀਕ
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰਨਾ ਯਾਦ ਰੱਖੋ
verificationReminderFirst-title-3 = { -brand-mozilla } ਵਲੋਂ ਜੀ ਆਇਆਂ ਨੂੰ!
verificationReminderFirst-description-3 = ਕੁਝ ਦਿਨ ਪਹਿਲਾਂ ਤੁਸੀਂ { -product-mozilla-account } ਬਣਾਇਆ ਸੀ, ਪਰ ਇਸ ਦੀ ਤਸਦੀਕ ਕਦੇ ਨਹੀਂ ਕੀਤੀ ਸੀ। ਅਗਲੇ 15 ਦਿਨਾਂ ਵਿੱਚ ਆਪਣੇ ਖਾਤੇ ਦੀ ਤਸਦੀਕ ਕਰੋ, ਨਹੀਂ ਤਾਂ ਇਹ ਆਪਣੇ-ਆਪ ਹਟਾ ਦਿੱਤਾ ਜਾਵੇਗਾ।
verificationReminderFirst-sub-description-3 = ਬਰਾਊਜ਼ਰ, ਜੋ ਤੁਹਾਨੂੰ ਅਤੇ ਤੁਹਾਡੀ ਪਰਦੇਦਾਰੀ ਨੂੰ ਪਹਿਲ ਦਿੰਦਾ ਹੈ, ਨੂੰ ਨਾ ਭੁਲਾਓ।
confirm-email-2 = ਖਾਤੇ ਦੀ ਤਸਦੀਕ
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = ਖਾਤੇ ਦੀ ਤਸਦੀਕ
verificationReminderSecond-subject-2 = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰਨਾ ਯਾਦ ਰੱਖੋ
verificationReminderSecond-title-3 = { -brand-mozilla } ਨੂੰ ਖੁੰਝ ਨਾ ਜਾਇਓ
verificationReminderSecond-description-4 = ਕੁਝ ਦਿਨ ਪਹਿਲਾਂ ਤੁਸੀਂ { -product-mozilla-account } ਬਣਾਇਆ ਸੀ, ਪਰ ਇਸ ਦੀ ਤਸਦੀਕ ਕਦੇ ਨਹੀਂ ਕੀਤੀ ਸੀ। ਅਗਲੇ 10 ਦਿਨਾਂ ਵਿੱਚ ਆਪਣੇ ਖਾਤੇ ਦੀ ਤਸਦੀਕ ਕਰੋ, ਨਹੀਂ ਤਾਂ ਇਹ ਆਪਣੇ-ਆਪ ਹਟਾ ਦਿੱਤਾ ਜਾਵੇਗਾ।
verificationReminderSecond-second-description-3 = ਤੁਹਾਡਾ { -product-mozilla-account } ਤੁਹਾਡੇ { -brand-firefox } ਤਜਰਬੇ ਨੂੰ ਡਿਵਾਈਸਾਂ ਵਿਚਾਲੇ ਸਿੰਕ ਕਰਨ ਅਤੇ { -brand-mozilla } ਤੋਂ ਹੋਰ ਪਰਦੇਦਾਰੀ ਨਾਲ ਸੁਰੱਖਿਅਤ ਉਤਪਾਦਾਂ ਲਈ ਪਹੁੰਚ ਦੇਣ ਦਾ ਵਸੀਲਾ ਹੈ।
verificationReminderSecond-sub-description-2 = ਇੰਟਰਨੈੱਟ ਨੂੰ ਹਰ ਕਿਸੇ ਲਈ ਆਜ਼ਾਦ ਥਾਂ ਬਣਾਉਣ ਦੇ ਸਾਡੇ ਮਕਸਦ ਦਾ ਹਿੱਸਾ ਬਣੋ।
verificationReminderSecond-action-2 = ਖਾਤੇ ਦੀ ਤਸਦੀਕ
verify-title-3 = { -brand-mozilla } ਨਾਲ ਇੰਟਰਨੈੱਟ ਖੋਲ੍ਹੋ
verify-description-2 = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਹਰੇਕ ਥਾਂ ਉੱਤੇ ਸਾਇਨ ਇਨ ਕਰਨ ਲਈ { -brand-mozilla } ਤੋਂ ਵੱਧ ਤੋਂ ਵੱਧ ਫਾਇਦਾ ਲਵੋ।
verify-subject = ਆਪਣਾ ਖਾਤਾ ਬਣਾਉਣਾ ਮੁਕੰਮਲ ਕਰੋ
verify-action-2 = ਖਾਤੇ ਦੀ ਤਸਦੀਕ
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਬਦਲਣ ਲਈ { $code } ਕੋਡ ਨੂੰ ਵਰਤੋਂ
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] ਇਹ ਕੋਡ ਦੀ ਮਿਆਦ { $expirationTime } ਮਿੰਟ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
       *[other] ਇਹ ਕੋਡ ਦੀ ਮਿਆਦ { $expirationTime } ਮਿੰਟਾਂ ਵਿੱਚ ਪੁੱਗ ਜਾਵੇਗੀ।
    }
verifyAccountChange-title = ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਖਾਤੇ ਦੀ ਜਾਣਕਾਰੀ ਨੂੰ ਬਦਲਣ ਜਾ ਰਹੇ ਹੋ?
verifyAccountChange-prompt = ਜੇ ਹਾਂ ਤਾਂ ਇਹ ਤੁਹਾਡਾ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਹੈ:
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = ਕੀ ਤੁਸੀਂ { $clientName } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕੀਤਾ ਸੀ?
verifyLogin-description-2 = ਤੁਹਾਡੇ ਵਲੋਂ ਸਾਈਨ ਇਨ ਕਰਨ ਦੀ ਤਸਦੀਕ ਕਰਕੇ ਸਾਨੂੰ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਮਦਦ ਕਰੋ:
verifyLogin-subject-2 = ਸਾਈਨ ਇਨ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
verifyLogin-action = ਸਾਈਨ ਇਨ ਨੂੰ ਤਸਦੀਕ ਕਰੋ
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = ਕੀ ਤੁਸੀਂ { $serviceName } ਵਿੱਚ ਸਾਈਨ ਇਨ ਕੀਤਾ ਸੀ?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਰੱਖਣ ਲਈ ਸਾਡੀ ਮਦਦ ਵਾਸਤੇ ਆਪਣੇ ਸਾਈਨ-ਇਨ ਨੂੰ ਇਸ ਤੋਂ ਮਨਜ਼ੂਰ ਕਰੋ:
verifyLoginCode-prompt-3 = ਜੇ ਹਾਂ ਤਾਂ ਇਹ ਤੁਹਾਡਾ ਪਰਮਾਣੀਕਰਨ ਕੋਡ ਹੈ:
verifyLoginCode-expiry-notice = ਇਸ ਦੀ ਮਿਆਦ 5 ਮਿੰਟ ਹੈ।
verifyPrimary-title-2 = ਪ੍ਰਾਇਮਰੀ ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ
verifyPrimary-description = ਅੱਗੇ ਦਿੱਤੇ ਡਿਵਾਈਸ ਤੋਂ ਖਾਤੇ ਨੂੰ ਬਦਲਣ ਲਈ ਬੇਨਤੀ ਕੀਤੀ ਜਾ ਚੁੱਕੀ ਹੈ:
verifyPrimary-subject = ਪ੍ਰਾਇਮਰੀ ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ
verifyPrimary-action-2 = ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }
verifyPrimary-post-verify-2 = ਇੱਕ ਵਾਰ ਤਸਦੀਕ ਹੋਣ ਦੇ ਬਾਅਦ ਇਸ ਡਿਵਾਈਸ ਤੋਂ ਖਾਤਾ ਤਬਦੀਲੀਆਂ ਜਿਵੇਂ ਕਿ ਸੈਕੰਡਰੀ ਈਮੇਲ ਜੋੜਨੇ ਵਾਂਗ ਤਬਦੀਲੀਆਂ ਕਰ ਸਕਦੇ ਹੋ।
verifySecondaryCode-title-2 = ਸੈਕੰਡਰੀ ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ
verifySecondaryCode-action-2 = ਈਮੇਲ ਤਸਦੀਕ ਕਰੋ
verifySecondaryCode-prompt-2 = ਇਹ ਤਸਦੀਕੀ ਕੋਡ ਵਰਤੋ:
verifySecondaryCode-expiry-notice-2 = ਇਸ ਦੀ ਮਿਆਦ 5 ਮਿੰਟ ਹੈ। ਇੱਕ ਵਾਰ ਤਸਦੀਕ ਕਰਨ ਤੋਂ ਬਾਅਦ ਇਸ ਸਿਰਨਾਵੇਂ ਉੱਤੇ ਸੁਰੱਖਿਆ ਸੂਚਨਾਵਾਂ ਅਤੇ ਤਸਦੀਕੀ ਜਾਣਕਾਰੀ ਮਿਲਣੀ ਸ਼ੁਰੂ ਹੋ ਜਾਵੇਗੀ।
verifyShortCode-title-3 = { -brand-mozilla } ਨਾਲ ਇੰਟਰਨੈੱਟ ਖੋਲ੍ਹੋ
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਹਰੇਕ ਥਾਂ ਉੱਤੇ ਸਾਇਨ ਇਨ ਕਰਨ ਲਈ { -brand-mozilla } ਤੋਂ ਵੱਧ ਤੋਂ ਵੱਧ ਫਾਇਦਾ ਲਵੋ।
verifyShortCode-prompt-3 = ਇਹ ਤਸਦੀਕੀ ਕੋਡ ਵਰਤੋ:
verifyShortCode-expiry-notice = ਇਸ ਦੀ ਮਿਆਦ 5 ਮਿੰਟ ਹੈ।
