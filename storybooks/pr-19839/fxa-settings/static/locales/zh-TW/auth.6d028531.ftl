## Non-email strings

session-verify-send-push-title-2 = 要登入您的 { -product-mozilla-account } 嗎？
session-verify-send-push-body-2 = 請點擊此處確認是您
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = 您的{ -brand-mozilla }驗證碼為{ $code }，有效期限5分鐘。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } 驗證碼：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = 您的{ -brand-mozilla }救援碼為{ $code }，有效期限5分鐘。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } 備用驗證碼：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = 您的{ -brand-mozilla }救援碼為{ $code }，有效期限5分鐘。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } 密碼重設驗證碼：{ $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } 標誌">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="同步裝置">
body-devices-image = <img data-l10n-name="devices-image" alt="裝置">
fxa-privacy-url = { -brand-mozilla } 隱私權保護政策
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") }隱私權公告
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") }服務條款
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } 標誌">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } 標誌">
subplat-automated-email = 這是電腦自動發送的郵件，若您突然收到這封信，不需要做任何事。
subplat-privacy-notice = 隱私權公告
subplat-privacy-plaintext = 隱私權公告：
subplat-update-billing-plaintext = { subplat-update-billing }：
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = 您會收到這封信，是因為 { $email } 註冊了 { -product-mozilla-account }，並且訂閱了 { $productName }。
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = 您會收到這封郵件，是因為 { $email } 註冊了 { -product-mozilla-account }。
subplat-explainer-multiple-2 = 您會收到這封信，是因為 { $email } 註冊了 { -product-mozilla-account }，並且訂閱了多套產品。
subplat-explainer-was-deleted-2 = 您會收到這封郵件，是因為 { $email } 註冊了 { -product-mozilla-account }。
subplat-manage-account-2 = 到您的<a data-l10n-name="subplat-account-page">帳號頁面</a>來管理 { -product-mozilla-account }設定。
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = 可到您的帳號頁面來管理 { -product-mozilla-account }設定：{ $accountSettingsUrl }
subplat-terms-policy = 條款及取消政策
subplat-terms-policy-plaintext = { subplat-terms-policy }：
subplat-cancel = 取消訂閱
subplat-cancel-plaintext = { subplat-cancel }：
subplat-reactivate = 重新啟用訂閱
subplat-reactivate-plaintext = { subplat-reactivate }：
subplat-update-billing = 更新帳務資訊
subplat-privacy-policy = { -brand-mozilla } 隱私權保護政策
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") }隱私權公告
subplat-privacy-policy-plaintext = { subplat-privacy-policy }：
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }：
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") }服務條款
subplat-moz-terms-plaintext = { subplat-moz-terms }：
subplat-legal = 法律資訊
subplat-legal-plaintext = { subplat-legal }：
subplat-privacy = 隱私權
subplat-privacy-website-plaintext = { subplat-privacy }：
account-deletion-info-block-communications = 若您的帳號被刪除，還是會收到來自 Mozilla Corporation 或 Mozilla Foundation 的郵件，除非您<a data-l10n-name="unsubscribeLink">要求退訂</a>才會停止發送。
account-deletion-info-block-support = 若您有任何問題或需要協助，歡迎聯絡我們的<a data-l10n-name="supportLink">技術支援團隊</a>。
account-deletion-info-block-communications-plaintext = 若您的帳號被刪除，還是會收到來自 Mozilla Corporation 或 Mozilla Foundation 的郵件，除非您要求退訂才會停止發送：
account-deletion-info-block-support-plaintext = 若您有任何問題或需要協助，歡迎聯絡我們的技術支援團隊：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="到 { -google-play } 下載 { $productName }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="到 { -app-store } 下載 { $productName }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = 到<a data-l10n-name="anotherDeviceLink">另一台桌面裝置</a>安裝 { $productName }。
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = 到<a data-l10n-name="anotherDeviceLink">另一台裝置</a>安裝 { $productName }。
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = 到 Google Play 取得 { $productName }：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = 到 App Store 下載 { $productName }：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = 在另一台裝置安裝 { $productName }：
automated-email-change-2 = 若您並未進行此操作，請立即<a data-l10n-name="passwordChangeLink">更改密碼</a>。
automated-email-support = 若需更多資訊，請造訪 <a data-l10n-name="supportLink">{ -brand-mozilla } 技術支援站</a>。
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = 若您並未進行此操作，請立即更改密碼：
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = 若需更多資訊，請造訪 { -brand-mozilla } 技術支援站：
automated-email-inactive-account = 這是一封系統自動寄出的郵件，您會收到是因為曾經註冊 { -product-mozilla-account }，並且已經超過 2 年未登入。
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } 若需更多資訊，請造訪 <a data-l10n-name="supportLink">{ -brand-mozilla } 技術支援站</a>。
automated-email-no-action-plaintext = 這是一封自動寄發的郵件。若您意外收到這封郵件可直接忽略。
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = 這是一封自動發出的郵件。若您並未進行此操作，請立刻修改密碼：
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = 此請求來自 { $uaOS } { $uaOSVersion } 上的 { $uaBrowser }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = 此請求來自 { $uaOS } 上的 { $uaBrowser }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = 此請求來自 { $uaBrowser }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = 此請求來自 { $uaOS } { $uaOSVersion }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = 此請求來自 { $uaOS }。
automatedEmailRecoveryKey-delete-key-change-pwd = 如果不是您操作的，請<a data-l10n-name="revokeAccountRecoveryLink">刪除這把金鑰</a>並<a data-l10n-name="passwordChangeLink">更改密碼</a>。
automatedEmailRecoveryKey-change-pwd-only = 如果不是您操作的，請<a data-l10n-name="passwordChangeLink">更改密碼</a>。
automatedEmailRecoveryKey-more-info = 若需更多資訊，請造訪 <a data-l10n-name="supportLink">{ -brand-mozilla } 技術支援站</a>。
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = 此請求來自：
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = 如果不是您操作的，請刪除新的金鑰：
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = 如果不是您操作的，請更改密碼：
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = 並且更改密碼：
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = 若需更多資訊，請造訪 { -brand-mozilla } 技術支援站：
automated-email-reset = 這是由系統自動發出的郵件，若您並未授權進行此動作，<a data-l10n-name="resetLink">請立即重設密碼</a>。若需更多資訊，請到 <a data-l10n-name="supportLink">{ -brand-mozilla } 技術支援站</a>。
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = 若您並未進行此變更，請到 { $resetLink } 重設密碼
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    若這不是您操作的，請立即<a data-l10n-name="resetLink">重設密碼</a>並<a data-l10n-name="twoFactorSettingsLink">重設兩階段驗證設定</a>。
    若需更多資訊，請造訪 <a data-l10n-name="supportLink">{ -brand-mozilla } 技術支援站</a>。
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = 若您並未進行此操作，請立即至此處重設密碼：
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = 也請到此處重設兩階段驗證設定：
brand-banner-message = 您知道我們將 { -product-firefox-accounts }的名稱更改為 { -product-mozilla-accounts }了嗎？<a data-l10n-name="learnMore">更多資訊</a>
cancellationSurvey = 請填寫這份<a data-l10n-name="cancellationSurveyUrl">簡短問卷</a>幫助我們改善服務品質。
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = 請填寫這份簡短問卷幫助我們改善服務品質：
change-password-plaintext = 若您覺得有人在嘗試盜用您的帳號，請修改密碼。
manage-account = 管理帳號
manage-account-plaintext = { manage-account }：
payment-details = 付款詳細資訊：
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = 請款單號碼：{ $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = 已於 { $invoiceDateOnly } 收取 { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = 下次扣款日：{ $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>付款方式：</b>{ $paymentProviderName }
payment-method-payment-provider-plaintext = 付款方式：{ $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = 付款方式：卡號尾碼為 { $lastFour } 的 { $cardName } 卡片
payment-provider-card-ending-in-plaintext = 付款方式：卡號尾碼為 { $lastFour } 的卡片
payment-provider-card-ending-in = <b>付款方式：</b>卡號尾碼為 { $lastFour } 的卡片
payment-provider-card-ending-in-card-name = <b>付款方式：</b>卡號尾碼為 { $lastFour } 的 { $cardName } 卡片
subscription-charges-invoice-summary = 請款單摘要

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>請款單號碼：</b>{ $invoiceNumber }
subscription-charges-invoice-number-plaintext = 請款單號碼：{ $invoiceNumber }
subscription-charges-invoice-date = <b>日期：</b>{ $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = 日期：{ $invoiceDateOnly }
subscription-charges-prorated-price = 按比例破月計算價格
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = 按比例破月計算價格：{ $remainingAmountTotal }
subscription-charges-list-price = 牌價
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = 牌價：{ $offeringPrice }
subscription-charges-credit-from-unused-time = 未使用期間轉儲值餘額
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = 未使用期間轉儲值餘額：{ $unusedAmountTotal }
subscription-charges-subtotal = <b>小計</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 小計：{ $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = 單次折扣
subscription-charges-one-time-discount-plaintext = 單次折扣：{ $invoiceDiscountAmount }
subscription-charges-repeating-discount = { $discountDuration } 個月折扣
subscription-charges-repeating-discount-plaintext = { $discountDuration } 個月折扣：{ $invoiceDiscountAmount }
subscription-charges-discount = 折扣
subscription-charges-discount-plaintext = 折扣：{ $invoiceDiscountAmount }
subscription-charges-taxes = 稅金與其他費用
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = 稅金與其他費用：{ $invoiceTaxAmount }
subscription-charges-total = <b>總計</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = 總計：{ $invoiceTotal }
subscription-charges-credit-applied = 已套用儲值餘額
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = 已套用儲值餘額：{ $creditApplied }
subscription-charges-amount-paid = <b>已付款金額</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = 已付款金額：{ $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = 您已收到 { $creditReceived } 的儲值餘額，可在未來使用。

##

subscriptionSupport = 有關於訂閱服務的任何問題嗎？我們的<a data-l10n-name="subscriptionSupportUrl">技術支援團隊</a>在此為您服務。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = 有訂閱內容的相關問題嗎？我們的技術支援團隊在此幫忙：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = 感謝您訂閱 { $productName }。若有關於訂閱內容的任何疑問，或需要有關 { $productName } 的更多資訊，<a data-l10n-name="subscriptionSupportUrl">請聯絡我們</a>。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = 感謝您訂閱 { $productName }。若有關於訂閱內容的任何疑問，或需要 { $productName } 的更多資訊，請透過下列方式聯絡我們：
subscription-support-get-help = 獲得有關訂閱項目的協助
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">管理您的訂閱項目</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = 管理您的訂閱項目：
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">聯絡支援團隊</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = 聯絡支援團隊：
subscriptionUpdateBillingEnsure = 您可以到<a data-l10n-name="updateBillingUrl">此處</a>確認您的付款方式與帳號資訊。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 您可以到下列位置確認付款方式與帳號資訊：
subscriptionUpdateBillingTry = 接下來幾天內我們會再次嘗試處理付款，但您也可以<a data-l10n-name="updateBillingUrl">更新付款資訊</a>，協助修正這個問題。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 接下來幾天內我們會再次嘗試處理付款，但您也可以更新付款資訊，協助修正這個問題：
subscriptionUpdatePayment = 為了避免服務中斷，請及早<a data-l10n-name="updateBillingUrl">更新付款資訊</a>。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = 為了避免服務中斷，請及早更新付款資訊：
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = 若需更多資訊，請造訪 <a data-l10n-name="supportLink">{ -brand-mozilla } 技術支援站</a>。
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = 若需更多資訊，請造訪 { -brand-mozilla } 技術支援站：{ $supportUrl }。
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaOS } { $uaOSVersion } 上的 { $uaBrowser }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaOS } 上的 { $uaBrowser }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $country } { $stateCode } { $city }（估計地點）
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $country } { $city }（估計地點）
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $country } { $stateCode }（估計地點）
# Variables:
#  $country (stateCode) - User's country
location-country = { $country }（估計地點）
view-invoice-link-action = 檢視請款單
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 檢視請款單：{ $invoiceLink }
cadReminderFirst-subject-1 = 提醒：讓我們同步 { -brand-firefox }
cadReminderFirst-action = 同步另一台裝置
cadReminderFirst-action-plaintext = { cadReminderFirst-action }：
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = 需要有兩台裝置才能同步
cadReminderFirst-description-v2 = 讓您的分頁在所有裝置間跳轉。在所有使用 { -brand-firefox } 的地方同步書籤、網站密碼與其他資料。
cadReminderSecond-subject-2 = 別錯過！一起完成同步功能設定吧！
cadReminderSecond-action = 同步另一台裝置
cadReminderSecond-title-2 = 別忘了同步功能！
cadReminderSecond-description-sync = 在任何使用 { -brand-firefox } 的地方同步書籤、密碼、開啟的分頁與更多資料。
cadReminderSecond-description-plus = 此外，您的資料將隨時加密，只有您跟您同意過的裝置才可看到這些資料。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = 歡迎使用 { $productName }。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = 歡迎使用 { $productName }。
downloadSubscription-content-2 = 讓我們開始使用訂閱中包含的各種功能：
downloadSubscription-link-action-2 = 開始使用
fraudulentAccountDeletion-subject-2 = 已刪除您的 { -product-mozilla-account }
fraudulentAccountDeletion-title = 已刪除您的帳號
fraudulentAccountDeletion-content-part1-v2 = 最近有人使用此電子郵件信箱註冊 { -product-mozilla-account }並付費訂閱。如我們對所有新帳號所要求的，需請您先確認此電子郵件地址。
fraudulentAccountDeletion-content-part2-v2 = 目前此帳號尚未經過確認，無法確認這是不是經過授權的訂閱行為。因此，已刪除使用此電子郵件信箱註冊的 { -product-mozilla-account }，並將取消已訂閱的項目並完全退費。
fraudulentAccountDeletion-contact = 若您有其他問題，請聯絡我們的<a data-l10n-name="mozillaSupportUrl">技術支援團隊</a>。
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = 若您有其他問題，請聯絡我們的技術支援團隊：{ $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = 保留您 { -product-mozilla-account }的最後機會
inactiveAccountFinalWarning-title = 即將刪除您的 { -brand-mozilla } 帳號與資料
inactiveAccountFinalWarning-preview = 登入即可保留帳號
inactiveAccountFinalWarning-account-description = 可透過 { -product-mozilla-account } 使用 { -brand-firefox } 同步、{ -product-mozilla-monitor }、{ -product-firefox-relay }、{ -product-mdn } 等隱私保護與瀏覽器產品。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = 除非您登入，否則您的帳號與個人資料將於 <strong>{ $deletionDate }</strong> 後被刪除。
inactiveAccountFinalWarning-action = 登入即可保留帳號
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = 登入即可保留帳號：
inactiveAccountFirstWarning-subject = 別失去您的帳號
inactiveAccountFirstWarning-title = 您想要保留 { -brand-mozilla } 帳號與資料嗎？
inactiveAccountFirstWarning-account-description-v2 = 可透過 { -product-mozilla-account } 使用 { -brand-firefox } 同步、{ -product-mozilla-monitor }、{ -product-firefox-relay }、{ -product-mdn } 等隱私保護與瀏覽器產品。
inactiveAccountFirstWarning-inactive-status = 我們發現您已經有 2 年沒登入了。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = 您已經好一陣子沒有登入了，將於 <strong>{ $deletionDate }</strong> 刪除您的帳號與個人資料。
inactiveAccountFirstWarning-action = 登入即可保留帳號
inactiveAccountFirstWarning-preview = 登入即可保留帳號
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = 登入即可保留帳號：
inactiveAccountSecondWarning-subject = 需要採取行動：帳號將於 7 天後刪除
inactiveAccountSecondWarning-title = 將於 7 天後刪除您的 { -brand-mozilla } 帳號與資料
inactiveAccountSecondWarning-account-description-v2 = 可透過 { -product-mozilla-account } 使用 { -brand-firefox } 同步、{ -product-mozilla-monitor }、{ -product-firefox-relay }、{ -product-mdn } 等隱私保護與瀏覽器產品。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = 您已經好一陣子沒有登入了，將於 <strong>{ $deletionDate }</strong> 刪除您的帳號與個人資料。
inactiveAccountSecondWarning-action = 登入即可保留帳號
inactiveAccountSecondWarning-preview = 登入即可保留帳號
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = 登入即可保留帳號：
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = 您的備用驗證碼已經用完了！
codes-reminder-title-one = 您只剩下一組備用驗證碼
codes-reminder-title-two = 是時候建立更多備用驗證碼了！
codes-reminder-description-part-one = 可透過備用驗證碼，在忘記密碼時協助您救回資訊。
codes-reminder-description-part-two = 建立新的驗證，避免未來遺失資料。
codes-reminder-description-two-left = 只剩下兩組備用驗證碼
codes-reminder-description-create-codes = 建立新的備用驗證碼，未來萬一無法登入帳號時，可以重新登入。
lowRecoveryCodes-action-2 = 建立驗證碼
codes-create-plaintext = { lowRecoveryCodes-action-2 }：
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] 已無備用驗證碼
       *[other] 剩下 { $numberRemaining } 組備用驗證碼！
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } 的新登入通知
newDeviceLogin-subjectForMozillaAccount = 您的 { -product-mozilla-account }有新登入紀錄
newDeviceLogin-title-3 = 您的 { -product-mozilla-account }已用於登入
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = 不是您嗎？<a data-l10n-name="passwordChangeLink">請更改密碼</a>。
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = 不是您嗎？請更改密碼：
newDeviceLogin-action = 管理帳號
passwordChanged-subject = 密碼已更新
passwordChanged-title = 已成功修改密碼
passwordChanged-description-2 = 已從下列裝置成功更改您 { -product-mozilla-account }的密碼：
passwordChangeRequired-subject = 偵測到可疑行為
passwordChangeRequired-preview = 立即更改密碼
passwordChangeRequired-title-2 = 重設您的密碼
passwordChangeRequired-suspicious-activity-3 = 我們已暫時鎖定您的帳號、登出所有裝置、也刪除所有同步資料，以避免您遭受可疑活動的影響。
passwordChangeRequired-sign-in-3 = 請重設密碼，即可重新登入帳號。
passwordChangeRequired-different-password-2 = <b>重要：</b>請使用您從未使用過的、足夠強大的密碼。
passwordChangeRequired-different-password-plaintext-2 = 重要：請使用您從未使用過的、足夠強大的密碼。
passwordChangeRequired-action = 重設密碼
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }：
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = 使用 { $code } 更改密碼
password-forgot-otp-preview = 此代碼將於 10 分鐘後失效
password-forgot-otp-title = 忘記密碼了嗎？
password-forgot-otp-request = 我們收到要更改您 { -product-mozilla-account }密碼的請求：
password-forgot-otp-code-2 = 若是您提出的話，請使用下列確認碼：
password-forgot-otp-expiry-notice = 此驗證碼將於 10 分鐘後失效。
passwordReset-subject-2 = 已重設您的密碼
passwordReset-title-2 = 已重設您的密碼
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = 您已於下列裝置與時間重設 { -product-mozilla-account }密碼：
passwordResetAccountRecovery-subject-2 = 已重設您的密碼
passwordResetAccountRecovery-title-3 = 已重設您的密碼
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = 您已於下列裝置與時間使用帳號救援金鑰重設 { -product-mozilla-account }密碼：
passwordResetAccountRecovery-information = 我們已將您從所有同步裝置登出，並產生一把新的帳號救援金鑰取代原金鑰。您可以到帳號設定中更改。
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = 我們已將您從所有同步裝置登出，並產生一把新的帳號救援金鑰取代原金鑰。您可以到帳號設定中更改：
passwordResetAccountRecovery-action-4 = 管理帳號
passwordResetRecoveryPhone-subject = 已使用救援電話號碼
passwordResetRecoveryPhone-preview = 請確認是否是您的操作
passwordResetRecoveryPhone-title = 以使用您的救援電話號碼，來確認重設密碼
passwordResetRecoveryPhone-device = 救援電話號碼是從下列位置使用的：
passwordResetRecoveryPhone-action = 管理帳號
passwordResetWithRecoveryKeyPrompt-subject = 已重設您的密碼
passwordResetWithRecoveryKeyPrompt-title = 已重設您的密碼
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = 您已於下列裝置與時間重設 { -product-mozilla-account }密碼：
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = 產生帳號救援金鑰
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = 產生帳號救援金鑰：
passwordResetWithRecoveryKeyPrompt-cta-description = 您需要到所有同步中的裝置重新登入，下次請使用帳號救援金鑰確保資料安全。使用這把金鑰，可以在您忘記密碼時救回帳號資料。
postAddAccountRecovery-subject-3 = 已建立新帳號救援金鑰
postAddAccountRecovery-title2 = 您已產生新的帳號救援金鑰
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = 請將這把金鑰存放在安全的地方，未來萬一忘記密碼時，需要使用此金鑰才可以取回加密的上網資料。
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = 這把金鑰只能使用一次，使用後我們會自動再產生一把新的金鑰。您也可以隨時到帳號設定當中更換。
postAddAccountRecovery-action = 管理帳號
postAddLinkedAccount-subject-2 = 有新的帳號連結至您的 { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = 您的 { $providerName } 帳號已連結到 { -product-mozilla-account }
postAddLinkedAccount-action = 管理帳號
postAddRecoveryPhone-subject = 已新增救援電話號碼
postAddRecoveryPhone-preview = 已透過兩階段驗證機制保護您的帳號
postAddRecoveryPhone-title-v2 = 您已新增救援電話號碼
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = 您已將尾碼為 { $maskedLastFourPhoneNumber } 的電話號碼，新增為救援電話號碼
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = 此功能如何保護您的帳號
postAddRecoveryPhone-how-protect-plaintext = 此功能如何保護您的帳號：
postAddRecoveryPhone-enabled-device = 您從下列位置開啟：
postAddRecoveryPhone-action = 管理帳號
postAddTwoStepAuthentication-preview = 您的帳號已受保護
postAddTwoStepAuthentication-subject-v3 = 兩階段驗證已開啟
postAddTwoStepAuthentication-title-2 = 您已開啟兩階段驗證
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = 您從下列位置要求：
postAddTwoStepAuthentication-action = 管理帳號
postAddTwoStepAuthentication-code-required-v4 = 現在起，每次登入時都會要求您輸入驗證程式中的安全碼。
postAddTwoStepAuthentication-recovery-method-codes = 您也新增了備用驗證碼作為救援方式。
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = 您也將 { $maskedPhoneNumber } 新增為救援電話號碼。
postAddTwoStepAuthentication-how-protects-link = 此功能如何保護您的帳號
postAddTwoStepAuthentication-how-protects-plaintext = 此功能如何保護您的帳號：
postAddTwoStepAuthentication-device-sign-out-message = 為了保護您所有的連線裝置，您應該從所有使用此帳號的裝置登出，然後再重新經過兩階段驗證登入。
postChangeAccountRecovery-subject = 已變更帳號救援金鑰
postChangeAccountRecovery-title = 您已更換帳號救援金鑰
postChangeAccountRecovery-body-part1 = 您已產生新的帳號救援金鑰，舊金鑰已刪除。
postChangeAccountRecovery-body-part2 = 請將這把新的金鑰存放在安全的地方，未來萬一忘記密碼時，需要使用此金鑰才可以取回加密的上網資料。
postChangeAccountRecovery-action = 管理帳號
postChangePrimary-subject = 已更改主要電子郵件地址
postChangePrimary-title = 新增主要電子郵件地址
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = 您已成功將主要電子郵件地址更改為 { $email }。現在起，請使用此信箱來登入 { -product-mozilla-account }，也會在這個信箱中收到安全性通知、登入確認信等等。
postChangePrimary-action = 管理帳號
postChangeRecoveryPhone-subject = 已更新救援電話號碼
postChangeRecoveryPhone-preview = 已透過兩階段驗證機制保護您的帳號
postChangeRecoveryPhone-title = 您已更改救援電話號碼
postChangeRecoveryPhone-description = 您已更新救援電話號碼，舊號碼已刪除。
postChangeRecoveryPhone-requested-device = 您從下列位置要求：
postChangeTwoStepAuthentication-preview = 您的帳號已受保護
postChangeTwoStepAuthentication-subject = 已更新兩階段驗證設定
postChangeTwoStepAuthentication-title = 已更新兩階段驗證設定
postChangeTwoStepAuthentication-use-new-account = 現在起，您需要使用驗證程式當中新的 { -product-mozilla-account } 項目，舊的項目無法再使用，可以移除。
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = 您從下列位置要求：
postChangeTwoStepAuthentication-action = 管理帳號
postChangeTwoStepAuthentication-how-protects-link = 此功能如何保護您的帳號
postChangeTwoStepAuthentication-how-protects-plaintext = 此功能如何保護您的帳號：
postChangeTwoStepAuthentication-device-sign-out-message = 為了保護您所有的連線裝置，您應該從所有使用此帳號的裝置登出，然後再重新經過新的兩階段驗證登入。
postConsumeRecoveryCode-title-3 = 已使用您的備用驗證碼確認密碼重設
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = 驗證碼是從下列位置使用的：
postConsumeRecoveryCode-action = 管理帳號
postConsumeRecoveryCode-subject-v3 = 已使用備用驗證碼
postConsumeRecoveryCode-preview = 請確認是否是您的操作
postNewRecoveryCodes-subject-2 = 已產生新的備用驗證碼
postNewRecoveryCodes-title-2 = 您已產生新的備用驗證碼
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = 建立自：
postNewRecoveryCodes-action = 管理帳號
postRemoveAccountRecovery-subject-2 = 已刪除帳號救援金鑰
postRemoveAccountRecovery-title-3 = 您已刪除帳號救援金鑰。
postRemoveAccountRecovery-body-part1 = 若您忘記密碼，必須使用帳號救援金鑰才可以解開加密過的瀏覽資料。
postRemoveAccountRecovery-body-part2 = 若您還沒有建立過，請先到帳號設定中建立帳號救援金鑰，即可避免遺失儲存的網站密碼、書籤、瀏覽紀錄等資料。
postRemoveAccountRecovery-action = 管理帳號
postRemoveRecoveryPhone-subject = 已移除救援電話號碼
postRemoveRecoveryPhone-preview = 已透過兩階段驗證機制保護您的帳號
postRemoveRecoveryPhone-title = 已移除救援電話號碼
postRemoveRecoveryPhone-description-v2 = 已從兩階段驗證設定中移除您的救援手機號碼。
postRemoveRecoveryPhone-description-extra = 萬一無法使用驗證器取得驗證碼，還是可以使用備用驗證碼登入。
postRemoveRecoveryPhone-requested-device = 您從下列位置要求：
postRemoveSecondary-subject = 已移除次要電子郵件地址
postRemoveSecondary-title = 已移除次要電子郵件地址
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = 您已成功將 { $secondaryEmail } 從 { -product-mozilla-account }的次要電子郵件信箱刪除。現在起將不會再寄送安全性通知與登入確認信到該信箱。
postRemoveSecondary-action = 管理帳號
postRemoveTwoStepAuthentication-subject-line-2 = 已關閉兩階段驗證
postRemoveTwoStepAuthentication-title-2 = 您已關閉兩階段驗證
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = 您從下列位置關閉：
postRemoveTwoStepAuthentication-action = 管理帳號
postRemoveTwoStepAuthentication-not-required-2 = 登入時，不再需要輸入來自驗證應用程式的安全碼。
postSigninRecoveryCode-subject = 已使用備用驗證碼登入
postSigninRecoveryCode-preview = 確認帳號活動紀錄
postSigninRecoveryCode-title = 已使用您的備用驗證碼登入
postSigninRecoveryCode-description = 若您沒有登入，請立即更改密碼以確保帳號安全。
postSigninRecoveryCode-device = 您從下列裝置登入：
postSigninRecoveryCode-action = 管理帳號
postSigninRecoveryPhone-subject = 已使用救援電話號碼登入
postSigninRecoveryPhone-preview = 確認帳號活動紀錄
postSigninRecoveryPhone-title = 已使用您的救援電話號碼登入
postSigninRecoveryPhone-description = 若您沒有登入，請立即更改密碼以確保帳號安全。
postSigninRecoveryPhone-device = 您從下列裝置登入：
postSigninRecoveryPhone-action = 管理帳號
postVerify-sub-title-3 = 很高興能見到你！
postVerify-title-2 = 想要在其他裝置上也能看到同個分頁嗎？
postVerify-description-2 = 很簡單！只要在另一台裝置上也安裝 { -brand-firefox } 並且登入同步功能就好！
postVerify-sub-description = （噓…只要登入之後，所有書籤、密碼、其他 { -brand-firefox } 資料就可以在所有裝置間同步起來了。）
postVerify-subject-4 = 歡迎來到 { -brand-mozilla }！
postVerify-setup-2 = 連結其他裝置
postVerify-action-2 = 連結其他裝置
postVerifySecondary-subject = 已加入次要電子郵件地址
postVerifySecondary-title = 已加入次要電子郵件地址
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = 您已成功將 { $secondaryEmail } 加入為 { -product-mozilla-account }的次要電子郵件信箱。現在起將寄送安全性通知與登入確認信到該信箱。
postVerifySecondary-action = 管理帳號
recovery-subject = 重設您的密碼
recovery-title-2 = 忘記密碼了嗎？
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = 我們收到要更改您 { -product-mozilla-account }的密碼的請求：
recovery-new-password-button = 請點擊下列按鈕來設定新密碼。此鏈結將於一小時後失效。
recovery-copy-paste = 請複製下列網址，並貼到瀏覽器網址列開啟，即可設定新密碼。此鏈結將於一小時後失效。
recovery-action = 建立新密碼
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = 已取消您的 { $productName } 產品訂閱
subscriptionAccountDeletion-title = 很遺憾看見您離開
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 您最近刪除了 { -product-mozilla-account }，因此我們也同步取消了您的 { $productName } 訂閱。最後一次付款發生於 { $invoiceDateOnly }，金額為 { $invoiceTotal }。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = 歡迎使用 { $productName }：請設定密碼。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = 歡迎使用 { $productName }
subscriptionAccountFinishSetup-content-processing = 正在處理您的付款，可能最多需要 4 個工作天才可完成。除非您主動取消，將在每個帳務週期結束後自動續訂。
subscriptionAccountFinishSetup-content-create-3 = 接下來，請為 { -product-mozilla-account } 設定密碼，即可開始使用您新訂閱的項目。
subscriptionAccountFinishSetup-action-2 = 開始使用
subscriptionAccountReminderFirst-subject = 提醒：請完成帳號註冊
subscriptionAccountReminderFirst-title = 您暫時還不能使用您的訂閱項目
subscriptionAccountReminderFirst-content-info-3 = 幾天前，您註冊了 { -product-mozilla-account }但還沒有驗證該帳號。希望您能盡快驗證該帳號，才能使用剛訂閱的項目。
subscriptionAccountReminderFirst-content-select-2 = 請選擇「設定密碼」來設定新密碼並完成帳號驗證手續。
subscriptionAccountReminderFirst-action = 設定密碼
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }：
subscriptionAccountReminderSecond-subject = 這是最後一次提醒囉：註冊帳號
subscriptionAccountReminderSecond-title-2 = 歡迎來到 { -brand-mozilla }！
subscriptionAccountReminderSecond-content-info-3 = 幾天前，您註冊了 { -product-mozilla-account }但還沒有驗證該帳號。希望您能盡快驗證該帳號，才能使用剛訂閱的項目。
subscriptionAccountReminderSecond-content-select-2 = 請選擇「設定密碼」來設定新密碼並完成帳號驗證手續。
subscriptionAccountReminderSecond-action = 設定密碼
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = 已取消您的 { $productName } 產品訂閱
subscriptionCancellation-title = 很遺憾看見您離開

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = 我們已取消您的 { $productName } 訂閱。最後一筆款項 { $invoiceTotal } 已於 { $invoiceDateOnly } 支付。
subscriptionCancellation-outstanding-content-2 = 我們已取消您的 { $productName } 訂閱。最後一筆款項 { $invoiceTotal } 將於 { $invoiceDateOnly } 支付。
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = 您可持續使用訂閱的服務至帳單週期結束（{ $serviceLastActiveDateOnly }）為止。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = 您已切換到 { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = 您已成功從 { $productNameOld } 切換到 { $productName }。
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = 從下一期開始，我們就會從每 { $productPaymentCycleOld } 收費 { $paymentAmountOld } 調整為每 { $productPaymentCycleNew } 收費 { $paymentAmountNew }。屆時我們將把剩餘期間 { $productPaymentCycleOld } 的差額 { $paymentProrated } 以餘額的方式一次儲值到您的帳號，以反應較低的收費金額。
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = 若需要安裝新軟體才能使用 { $productName }，我們會將下載方式用另一封電子郵件發送給您。
subscriptionDowngrade-content-auto-renew = 除非您主動取消訂閱，否則將在每個帳單週期開始時自動續約並收費。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = 已取消您的 { $productName } 產品訂閱
subscriptionFailedPaymentsCancellation-title = 您的訂閱已取消
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = 由於多次付款失敗，我們已取消您的 { $productName } 訂閱。若需再次使用訂閱內容，請使用新的付款方式重新訂閱。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = 已確認 { $productName } 付款
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = 感謝您訂閱 { $productName }
subscriptionFirstInvoice-content-processing = 正在處理您的款項，最多需要四個工作天才能完成。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = 您將另外收到一封有關如何開始使用 { $productName } 的電子郵件。
subscriptionFirstInvoice-content-auto-renew = 除非您主動取消訂閱，否則將在每個帳單週期開始時自動續約並收費。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = 下一期請款單將於 { $nextInvoiceDateOnly } 開立。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = 訂購 { $productName } 所使用的付款方式即將過期，或已過期
subscriptionPaymentExpired-title-2 = 您的付款方式即將過期，或已過期
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = 您用來訂購 { $productName } 的付款方式即將過期，或已過期。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } 付款失敗
subscriptionPaymentFailed-title = 很抱歉，處理付款時遇到問題
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = 處理您最近對 { $productName } 的付款時，遇到問題。
subscriptionPaymentFailed-content-outdated-1 = 可能是您的付款方式過期，或已經失效了。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = 需要更新 { $productName } 的付款資訊
subscriptionPaymentProviderCancelled-title = 很抱歉，處理付款時遇到問題
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = 處理您最近對 { $productName } 的付款時，遇到問題。
subscriptionPaymentProviderCancelled-content-reason-1 = 可能是您的付款方式過期，或已經失效了。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = 已重新開始訂閱 { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = 感謝您重新開始訂閱 { $productName }！
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = 您的帳務週期與付款內容將保持原樣，下次將於 { $nextInvoiceDateOnly } 收取 { $invoiceTotal }。在您主動取消之前，將自動持續訂閱。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } 自動續訂通知
subscriptionRenewalReminder-title = 即將續訂您的訂閱項目
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = 親愛的 { $productName } 客戶：
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = 您目前的訂閱將在 { $reminderLength } 天後到期，屆時 { -brand-mozilla } 將自動續訂 { $planIntervalCount } { $planInterval }，並向您帳號所設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-closing = 感謝您，
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } 團隊
subscriptionReplaced-subject = 因升級方案，已更新您的訂閱內容
subscriptionReplaced-title = 已更新您的訂閱內容
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = 您原先的 { $productName } 單套訂閱已被取代為新套裝訂閱中的一部分。
subscriptionReplaced-content-credit = 您將會以帳號餘額的方式，收到先前訂閱內容未使用的時間的餘額退款。此餘額會自動於您的帳號生效，可於未來付款時抵用。
subscriptionReplaced-content-no-action = 您這邊不需要再做任何事。
subscriptionsPaymentExpired-subject-2 = 訂購產品所使用的付款方式即將過期，或已過期
subscriptionsPaymentExpired-title-2 = 您的付款方式即將過期，或已過期
subscriptionsPaymentExpired-content-2 = 您用來訂閱下列項目的付款方式即將過期，或已過期。
subscriptionsPaymentProviderCancelled-subject = 需要更新 { -brand-mozilla } 產品訂閱的付款資訊
subscriptionsPaymentProviderCancelled-title = 很抱歉，處理付款時遇到問題
subscriptionsPaymentProviderCancelled-content-detected = 處理您最近對下列訂閱項目的付款時，遇到問題。
subscriptionsPaymentProviderCancelled-content-payment-1 = 可能是您的付款方式過期，或已經失效了。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = 已收到 { $productName } 付款
subscriptionSubsequentInvoice-title = 感謝您訂閱！
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = 我們已收到您最近為 { $productName } 支付的款項。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = 下一期請款單將於 { $nextInvoiceDateOnly } 開立。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = 您已升級到 { $productName }
subscriptionUpgrade-title = 感謝您升級訂購內容！
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = 您已成功升級到 { $productName }。

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = 已向您一次收取 { $invoiceAmountDue }，以反應目前帳務週期剩餘期間（{ $productPaymentCycleOld }）較高的價格。
subscriptionUpgrade-content-charge-credit = 您已收到 { $paymentProrated } 的儲值餘額。
subscriptionUpgrade-content-subscription-next-bill-change = 從下個帳單週期開始，您的訂閱價格將有改變。
subscriptionUpgrade-content-old-price-day = 原價格為每天 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-week = 原價格為每週 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-month = 原價格為每個月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-halfyear = 原價格為每六個月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-year = 原價格為每年 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-default = 原價格為每期 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-day-tax = 原價格為每天 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-week-tax = 原價格為每週 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-month-tax = 原價格為每個月 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-halfyear-tax = 原價格為每六個月 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-year-tax = 原價格為每年 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-default-tax = 原價格為每期 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-new-price-day = 未來，將收取每天 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-week = 未來，將收取每週 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-month = 未來，將收取每月 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-halfyear = 未來，將收取每六個月 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-year = 未來，將收取每年 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-default = 未來，將收取每期 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-day-dtax = 未來，將收取每天 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-week-tax = 未來，將收取每週 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-month-tax = 未來，將收取每月 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-halfyear-tax = 未來，將收取每六個月 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-year-tax = 未來，將收取每年 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-default-tax = 未來，將收取每期 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-existing = 若您現有的訂閱與此次升級有重疊部分，我們會用另外一封電子郵件向您說明完整處理方式；若您的新方案當中包含需要安裝軟體的產品，則也會再用另一封電子郵件向您說明如何安裝。
subscriptionUpgrade-auto-renew = 除非您主動取消訂閱，否則將在每個帳單週期開始時自動續約並收費。
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = 使用 { $unblockCode } 登入
unblockCode-preview = 此代碼將於 1 小時後失效
unblockCode-title = 要登入的是您嗎？
unblockCode-prompt = 是的話，以下是您的授權碼：
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = 是的話，以下是您需要的授權碼：{ $unblockCode }
unblockCode-report = 不是的話，請幫助我們阻擋入侵者，並<a data-l10n-name="reportSignInLink">讓我們知道</a>。
unblockCode-report-plaintext = 不是的話，請幫助我們阻擋入侵者，並讓我們知道。
verificationReminderFinal-subject = 這是最後一次提醒囉：確認帳號
verificationReminderFinal-description-2 = 幾週前您註冊了 { -product-mozilla-account }，但並未確認過帳號身分。為了您的安全，請在 24 小時內完成確認，否則帳號將被自動刪除。
confirm-account = 確認帳號
confirm-account-plaintext = { confirm-account }：
verificationReminderFirst-subject-2 = 請記得要確認帳號
verificationReminderFirst-title-3 = 歡迎來到 { -brand-mozilla }！
verificationReminderFirst-description-3 = 幾天前您註冊了 { -product-mozilla-account }，但並未確認過帳號身分。請在 15 天內完成確認，否則帳號將被自動刪除。
verificationReminderFirst-sub-description-3 = 別錯過將您與您的隱私視為最優先的瀏覽器。
confirm-email-2 = 確認帳號
confirm-email-plaintext-2 = { confirm-email-2 }：
verificationReminderFirst-action-2 = 確認帳號
verificationReminderSecond-subject-2 = 請記得要確認帳號
verificationReminderSecond-title-3 = 別錯過 { -brand-mozilla } 的獨家功能！
verificationReminderSecond-description-4 = 幾天前您註冊了 { -product-mozilla-account }，但並未確認過帳號身分。請在 10 天內完成確認，否則帳號將被自動刪除。
verificationReminderSecond-second-description-3 = { -product-mozilla-account }可讓您在不同裝置間同步 { -brand-firefox } 的使用體驗，並且解鎖 { -brand-mozilla } 提供的更多隱私保護產品。
verificationReminderSecond-sub-description-2 = 加入我們的使命，讓網路環境轉變為對每個人都開放的地方。
verificationReminderSecond-action-2 = 確認帳號
verify-title-3 = 與 { -brand-mozilla } 一起打開網路環境
verify-description-2 = 確認您的帳號，就可以在任何登入的裝置中發揮 { -brand-mozilla } 產品的最大功能：
verify-subject = 完成帳號註冊
verify-action-2 = 確認帳號
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = 使用 { $code } 更改帳號
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview = 此代碼將於 { $expirationTime } 分鐘後失效。
verifyAccountChange-title = 您真的要更改帳號資訊嗎？
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = 為了確保您的帳號安全，請確認此變更：
verifyAccountChange-prompt = 是您修改的話，請使用下列授權碼：
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice = 此代碼將於 { $expirationTime } 分鐘後失效。
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = 您是否有登入 { $clientName }？
verifyLogin-description-2 = 請確認您下列時間的登入紀錄，幫助我們確保帳號安全：
verifyLogin-subject-2 = 確認登入
verifyLogin-action = 確認登入
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = 使用 { $code } 登入
verifyLoginCode-preview = 此代碼將於 5 分鐘後失效。
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = 您是否有登入 { $serviceName }？
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = 為了確保您的帳號安全，請確認您於下列裝置的登入紀錄：
verifyLoginCode-prompt-3 = 是您登入的話，請使用下列驗證碼：
verifyLoginCode-expiry-notice = 將於 5 分鐘後失效。
verifyPrimary-title-2 = 確認主要電子郵件地址
verifyPrimary-description = 收到來自下列裝置的帳號變更請求：
verifyPrimary-subject = 確認主要電子郵件地址
verifyPrimary-action-2 = 確認電子郵件信箱
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }：
verifyPrimary-post-verify-2 = 驗證完成後，即可從此裝置進行新增次要電子郵件地址等帳號變更操作。
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = 使用 { $code } 確認您的次要電子郵件信箱
verifySecondaryCode-preview = 此代碼將於 5 分鐘後失效。
verifySecondaryCode-title-2 = 確認次要電子郵件地址
verifySecondaryCode-action-2 = 確認電子郵件信箱
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = 有人要求將 { $email } 加入為下列 { -product-mozilla-account }帳號的次要郵件帳號：
verifySecondaryCode-prompt-2 = 使用這組驗證碼：
verifySecondaryCode-expiry-notice-2 = 驗證碼將於 5 分鐘後失效。驗證完成後，此信箱也會收到安全性通知與確認郵件。
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = 使用 { $code } 確認您的帳號
verifyShortCode-preview-2 = 此代碼將於 5 分鐘後失效
verifyShortCode-title-3 = 與 { -brand-mozilla } 一起打開網路環境
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = 確認您的帳號，就可以在任何登入的裝置中發揮 { -brand-mozilla } 產品的最大功能：
verifyShortCode-prompt-3 = 使用這組驗證碼：
verifyShortCode-expiry-notice = 將於 5 分鐘後失效。
