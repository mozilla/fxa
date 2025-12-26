## Non-email strings

session-verify-send-push-title-2 = 正在登录您的 { -product-mozilla-account }？
session-verify-send-push-body-2 = 点击此处以验证本人操作
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { -brand-mozilla } 验证码：{ $code }，5 分钟内有效。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } 验证码：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { -brand-mozilla } 恢复验证码：{ $code }，5分钟内有效。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } 验证码：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { -brand-mozilla } 恢复验证码：{ $code }，5分钟内有效。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } 验证码：{ $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } 徽标">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="同步设备">
body-devices-image = <img data-l10n-name="devices-image" alt="设备">
fxa-privacy-url = { -brand-mozilla } 隐私政策
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") }隐私声明
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") }服务条款
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } 徽标">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } 徽标">
subplat-automated-email = 这是一封自动发送的邮件。若您意外收到此邮件，无需进行任何操作。
subplat-privacy-notice = 隐私声明
subplat-privacy-plaintext = 隐私声明：
subplat-update-billing-plaintext = { subplat-update-billing }：
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = 您收到此邮件是因为 { $email } 注册了 { -product-mozilla-account }且订阅了 { $productName }。
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = 您收到这封邮件是因为 { $email } 注册了 { -product-mozilla-account }。
subplat-explainer-multiple-2 = 您收到此邮件是因为 { $email } 注册了 { -product-mozilla-account }且订阅了多个产品。
subplat-explainer-was-deleted-2 = 您收到这封邮件是因为 { $email } 注册了 { -product-mozilla-account }。
subplat-manage-account-2 = 请访问<a data-l10n-name="subplat-account-page">账户页面</a>管理 { -product-mozilla-account }的设置。
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = 请访问您的账户页面管理 { -product-mozilla-account }的设置：{ $accountSettingsUrl }
subplat-terms-policy = 条款及取消政策
subplat-terms-policy-plaintext = { subplat-terms-policy }：
subplat-cancel = 取消订阅
subplat-cancel-plaintext = { subplat-cancel }：
subplat-reactivate = 重新激活订阅
subplat-reactivate-plaintext = { subplat-reactivate }：
subplat-update-billing = 更新结算信息
subplat-privacy-policy = { -brand-mozilla } 隐私政策
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") }隐私声明
subplat-privacy-policy-plaintext = { subplat-privacy-policy }：
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }：
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } 服务条款
subplat-moz-terms-plaintext = { subplat-moz-terms }
subplat-legal = 法律
subplat-legal-plaintext = { subplat-legal }：
subplat-privacy = 隐私
subplat-privacy-website-plaintext = { subplat-privacy }：
account-deletion-info-block-communications = 删除账户后，您仍会收到来自 Mozilla 公司和 Mozilla 基金会的邮件，除非您<a data-l10n-name="unsubscribeLink">要求退订</a>。
account-deletion-info-block-support = 如有疑问或需要协助，请随时联系我们的<a data-l10n-name="supportLink">用户支持团队</a>。
account-deletion-info-block-communications-plaintext = 删除账户后，您仍会收到来自 Mozilla 公司和 Mozilla 基金会的邮件，除非您要求退订。
account-deletion-info-block-support-plaintext = 如有疑问或需要协助，请随时联系我们的用户支持团队：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="到 { -google-play } 下载 { $productName }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="到 { -app-store } 下载 { $productName }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = 在<a data-l10n-name="anotherDeviceLink">其他桌面设备</a>上安装 { $productName }
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = 在<a data-l10n-name="anotherDeviceLink">其他设备</a>上安装 { $productName }
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = 到 Google Play 下载 { $productName }：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = 到 App Store 下载 { $productName }：
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = 在其他设备上安装 { $productName }：
automated-email-change-2 = 如非本人操作，请立即<a data-l10n-name="passwordChangeLink">更改密码</a>。
automated-email-support = 如需了解更多信息，请访问 <a data-l10n-name="supportLink">{ -brand-mozilla } 支持</a>。
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = 如非本人操作，请立即更改密码：
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = 如需了解更多信息，请访问 { -brand-mozilla } 支持：
automated-email-inactive-account = 您收到此邮件是因为您拥有 { -product-mozilla-account }，且已连续 2 年未登录。
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } 获取更多信息，请访问 <a data-l10n-name="supportLink">{ -brand-mozilla } 用户支持</a>。
automated-email-no-action-plaintext = 这是一封自动发送的电子邮件。如果我们误向您发送了此邮件，则您无需执行任何操作。
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = 这是一封自动发送的邮件。若您并未授权此操作，请立即更改密码。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = 此请求来自 { $uaOS } { $uaOSVersion } 的 { $uaBrowser }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = 此请求来自 { $uaOS } 上的 { $uaBrowser }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = 此请求来自 { $uaBrowser }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = 此请求来自 { $uaOS } { $uaOSVersion }。
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = 此请求来自 { $uaOS }。
automatedEmailRecoveryKey-delete-key-change-pwd = 若非本人操作，请<a data-l10n-name="revokeAccountRecoveryLink">删除新密钥</a>并<a data-l10n-name="passwordChangeLink">更改密码</a>。
automatedEmailRecoveryKey-change-pwd-only = 若非本人操作，请<a data-l10n-name="passwordChangeLink">更改密码</a>。
automatedEmailRecoveryKey-more-info = 如需了解更多信息，请访问 <a data-l10n-name="supportLink">{ -brand-mozilla } 支持</a>。
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = 此请求来自：
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = 若非本人操作，请删除新密钥：
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = 若非本人操作，请更改密码：
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = 并更改密码：
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = 如需了解更多信息，请访问 { -brand-mozilla } 支持：
automated-email-reset = 这是一封自动发送的邮件。若您并未授权进行此操作，<a data-l10n-name="resetLink">请立即重置密码</a>。更多信息请访问 <a data-l10n-name="supportLink">{ -brand-mozilla } 用户支持</a>。
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = 如果您未授权此操作，请立即在 { $resetLink } 修改您的密码
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = 如非本人操作，请立即<a data-l10n-name="resetLink">重设密码</a>并<a data-l10n-name="twoFactorSettingsLink">重设两步验证</a>。有关更多信息，请访问 <a data-l10n-name="supportLink">{ -brand-mozilla } 技术支持</a>。
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = 如非本人操作，请立即在此重设密码：
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = 同时在此重设两步验证：
brand-banner-message = 您知道我们已由 { -product-firefox-accounts }更名为 { -product-mozilla-accounts }吗？<a data-l10n-name="learnMore">详细了解</a>
cancellationSurvey = 请填写这份<a data-l10n-name="cancellationSurveyUrl">简短问卷</a> ，帮助我们改善服务质量。
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = 请填写这份简短问卷，帮助我们改善服务质量：
change-password-plaintext = 如果您怀疑有人在试图访问您的账户，请更改您的密码。
manage-account = 管理账户
manage-account-plaintext = { manage-account }：
payment-details = 付款详情：
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = 发票号码：{ $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = 已于 { $invoiceDateOnly } 收取 { $invoiceTotal }
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

payment-provider-card-name-ending-in-plaintext = 付款方式：尾号为 { $lastFour } 的 { $cardName }
payment-provider-card-ending-in-plaintext = 付款方式：尾号为 { $lastFour } 的卡片
payment-provider-card-ending-in = <b>付款方式：</b>尾号为 { $lastFour } 的卡片
payment-provider-card-ending-in-card-name = <b>付款方式：</b>尾号为 { $lastFour } 的 { $cardName } 卡
subscription-charges-invoice-summary = 发票摘要

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>发票号码：</b>{ $invoiceNumber }
subscription-charges-invoice-number-plaintext = 发票号码：{ $invoiceNumber }
subscription-charges-invoice-date = <b>日期：</b>{ $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = 日期：{ $invoiceDateOnly }
subscription-charges-prorated-price = 差价
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = 差价：{ $remainingAmountTotal }
subscription-charges-list-price = 原价
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = 原价：{ $offeringPrice }
subscription-charges-credit-from-unused-time = 转换自未使用天数的余额
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = 转换自未使用天数的余额：{ $unusedAmountTotal }
subscription-charges-subtotal = <b>小计</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 小计：{ $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = 一次性折扣
subscription-charges-one-time-discount-plaintext = 一次性折扣：{ $invoiceDiscountAmount }
subscription-charges-repeating-discount = { $discountDuration } 个月折扣
subscription-charges-repeating-discount-plaintext = { $discountDuration } 个月折扣：{ $invoiceDiscountAmount }
subscription-charges-discount = 折扣
subscription-charges-discount-plaintext = 折扣：{ $invoiceDiscountAmount }
subscription-charges-taxes = 税费
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = 税费：{ $invoiceTaxAmount }
subscription-charges-total = <b>总计</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = 总计：{ $invoiceTotal }
subscription-charges-credit-applied = 使用余额
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = 使用余额：{ $creditApplied }
subscription-charges-amount-paid = <b>实付金额</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = 实付金额：{ $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = 您已收到 { $creditReceived } 账户余额，将于以后付款时抵用。

##

subscriptionSupport = 遇到订阅相关的问题？我们的<a data-l10n-name="subscriptionSupportUrl">用户支持团队</a>在此为您答疑。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = 遇到订阅相关的问题？我们的支持团队在此为您答疑：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = 感谢您订阅 { $productName }。如果您对您的订阅有任何疑问，或需要了解有关 { $productName } 的更多信息，请<a data-l10n-name="subscriptionSupportUrl">联系我们</a>。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = 感谢您订阅 { $productName }。如果您对您的订阅有任何疑问，或需要了解有关{ $productName } 的更多信息，请联系我们：
subscription-support-get-help = 获取订阅方面的帮助
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">管理订阅</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = 管理订阅：
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">联系支持</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = 联系支持：
subscriptionUpdateBillingEnsure = 您可以在<a data-l10n-name="updateBillingUrl">此处</a>确认您的付款方式和账户信息是否为最新。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 您可以在此处确认您的付款方式和账户信息是否为最新：
subscriptionUpdateBillingTry = 我们将在几天内重试您的付款操作，但您也有可能需要通过<a data-l10n-name="updateBillingUrl">更新您的付款信息</a>来帮助我们解决该问题。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 我们将在几天内重试付款操作，但您可能需要更新付款信息来帮助我们解决该问题：
subscriptionUpdatePayment = 为避免服务中断，请您及时<a data-l10n-name="updateBillingUrl">更新付款信息</a>。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = 为避免服务中断，请您及时更新付款信息：
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = 如需了解更多信息，请访问 <a data-l10n-name="supportLink">{ -brand-mozilla } 技术支持</a>。
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = 如需了解更多信息，请访问 { -brand-mozilla } 技术支持：{ $supportUrl }。
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
location-all = { $country }, { $stateCode }, { $city }（估计）
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $country }, { $city }（估计）
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $country }，{ $stateCode }（估计）
# Variables:
#  $country (stateCode) - User's country
location-country = { $country }（估计）
view-invoice-link-action = 查看发票
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 查看发票：{ $invoiceLink }
cadReminderFirst-subject-1 = 开始同步 { -brand-firefox } 吧！
cadReminderFirst-action = 与其他设备同步
cadReminderFirst-action-plaintext = { cadReminderFirst-action }：
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = 需要两台设备来进行同步
cadReminderFirst-description-v2 = 将标签页同步到各设备，让书签、密码等数据在您使用 { -brand-firefox } 的设备上触手可得。
cadReminderSecond-subject-2 = 稍安毋躁，让我们完成同步设置！
cadReminderSecond-action = 与其他设备同步
cadReminderSecond-title-2 = 別忘了同步！
cadReminderSecond-description-sync = 在任何使用 { -brand-firefox } 的地方访问或同步书签、密码、打开的标签页等数据。
cadReminderSecond-description-plus = 此外，您的数据将始终受到加密保护，且只对您与确认过的设备可见。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = 欢迎使用 { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = 欢迎使用 { $productName }
downloadSubscription-content-2 = 准备开始使用包含在您的订阅内的所有功能吧：
downloadSubscription-link-action-2 = 开始使用
fraudulentAccountDeletion-subject-2 = 已删除您的 { -product-mozilla-account }
fraudulentAccountDeletion-title = 已删除您的账户
fraudulentAccountDeletion-content-part1-v2 = 最近有人使用此邮箱地址创建 { -product-mozilla-account }并支付订阅。根据我们对所有新账户的要求，需要您先验证此邮箱地址来确认账户。
fraudulentAccountDeletion-content-part2-v2 = 目前，该账户尚未完成验证，无法确定是否为授权的订阅行为。因此，我们已删除使用此邮箱地址注册的 { -product-mozilla-account }，并取消订阅，所有费用均已退还。
fraudulentAccountDeletion-contact = 如有疑问，请联系我们的<a data-l10n-name="mozillaSupportUrl">用户支持团队</a>。
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = 如有疑问，请联系我们的用户支持团队：{ $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = 保留您 { -product-mozilla-account }的最后机会
inactiveAccountFinalWarning-title = 您的 { -brand-mozilla } 账户和数据即将被删除
inactiveAccountFinalWarning-preview = 登录以保留您的账户
inactiveAccountFinalWarning-account-description = 您已通过 { -product-mozilla-account }来使用免费的隐私保护和网页浏览产品，例如 { -brand-firefox } 同步、{ -product-mozilla-monitor }、{ -product-firefox-relay } 和 { -product-mdn }。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = 您的账户和个人数据将于 <strong>{ $deletionDate }</strong> 被永久删除，除非您登录账户。
inactiveAccountFinalWarning-action = 登录以保留您的账户
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = 登录以保留您的账户：
inactiveAccountFirstWarning-subject = 请登录以保留您的账户
inactiveAccountFirstWarning-title = 您想要保留您的 { -brand-mozilla } 账户和数据吗？
inactiveAccountFirstWarning-account-description-v2 = 您已通过 { -product-mozilla-account }来使用免费的隐私保护和网页浏览产品，例如 { -brand-firefox } 同步、{ -product-mozilla-monitor }、{ -product-firefox-relay } 和 { -product-mdn }。
inactiveAccountFirstWarning-inactive-status = 我们注意到您已经 2 年没有登录了。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = 由于已长时间未使用，您的账户和个人信息将于 <strong>{ $deletionDate }</strong> 被永久删除。
inactiveAccountFirstWarning-action = 登录以保留您的账户
inactiveAccountFirstWarning-preview = 登录以保留您的账户
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = 登录以保留您的账户：
inactiveAccountSecondWarning-subject = 需要操作：账户将于 7 天后被删除
inactiveAccountSecondWarning-title = 您的 { -brand-mozilla } 账户和数据将在 7 天后被删除
inactiveAccountSecondWarning-account-description-v2 = 您已通过 { -product-mozilla-account }来使用免费的隐私保护和网页浏览产品，例如 { -brand-firefox } 同步、{ -product-mozilla-monitor }、{ -product-firefox-relay } 和 { -product-mdn }。
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = 由于已长时间未使用，您的账户和个人数据将于 <strong>{ $deletionDate }</strong> 被永久删除。
inactiveAccountSecondWarning-action = 登录以保留您的账户
inactiveAccountSecondWarning-preview = 登录以保留您的账户
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = 登录以保留您的账户：
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = 您备用验证码已用尽！
codes-reminder-title-one = 只剩下一枚备用验证码
codes-reminder-title-two = 立即生成更多备用验证码
codes-reminder-description-part-one = 备用验证码可帮助您在忘记密码时恢复信息。
codes-reminder-description-part-two = 生成新的验证码，避免意外丢失数据。
codes-reminder-description-two-left = 只剩下两枚备用验证码。
codes-reminder-description-create-codes = 生成新的备用验证码，万一被锁定，可以帮助您重新进入账户。
lowRecoveryCodes-action-2 = 创建验证码
codes-create-plaintext = { lowRecoveryCodes-action-2 }：
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] 备用验证码已用尽
       *[other] 只剩下 { $numberRemaining } 枚备用验证码！
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } 有新的登录活动
newDeviceLogin-subjectForMozillaAccount = 您的 { -product-mozilla-account }有新的登录活动
newDeviceLogin-title-3 = 您的 { -product-mozilla-account }有登录活动
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = 不是您本人操作？请<a data-l10n-name="passwordChangeLink">更改密码</a>。
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = 不是您本人操作？请更改密码：
newDeviceLogin-action = 管理账户
passwordChanged-subject = 密码已更新
passwordChanged-title = 密码更改成功
passwordChanged-description-2 = 已从下列设备成功更改您的 { -product-mozilla-account }密码
passwordChangeRequired-subject = 检测到可疑活动
passwordChangeRequired-preview = 立即更改密码
passwordChangeRequired-title-2 = 重设密码
passwordChangeRequired-suspicious-activity-3 = 为防范可疑活动带来的威胁，我们锁定了您的账户。安全起见，您已被从所有设备退出登录，同步的数据也已全部删除。
passwordChangeRequired-sign-in-3 = 您只需重设密码即可重新登录账户。
passwordChangeRequired-different-password-2 = <b>重要提醒：</b>请使用强密码，并确保此前未曾使用过。
passwordChangeRequired-different-password-plaintext-2 = 重要提醒：请使用强密码，并确保此前未曾使用过。
passwordChangeRequired-action = 重设密码
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }：
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = 使用 { $code } 以更改密码
password-forgot-otp-preview = 验证码 10 分钟内有效
password-forgot-otp-title = 忘记密码？
password-forgot-otp-request = 我们收到更改 { -product-mozilla-account }密码的请求，来自：
password-forgot-otp-code-2 = 如果是您本人请求，请使用此确认码来继续操作：
password-forgot-otp-expiry-notice = 此确认码会在 10 分钟后过期。
passwordReset-subject-2 = 您的密码已重置
passwordReset-title-2 = 您的密码已重置
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = 您通过以下设备重置了 { -product-mozilla-account }密码：
passwordResetAccountRecovery-subject-2 = 您的密码已重置
passwordResetAccountRecovery-title-3 = 您的密码已重置
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = 您通过以下设备使用账户恢复密钥，重置了 { -product-mozilla-account }密码：
passwordResetAccountRecovery-information = 我们已将您从所有同步的设备上退出登录。我们创建了新的账户恢复密钥，用以替换已使用的密钥，您可以在账户设置中进行更改。
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = 我们已将您从所有同步的设备上退出登录。我们创建了新的账户恢复密钥，用以替换已使用的密钥，您可以在账户设置中进行更改。
passwordResetAccountRecovery-action-4 = 管理账户
passwordResetRecoveryPhone-subject = 已使用恢复电话号码
passwordResetRecoveryPhone-preview = 请确认是否为本人操作
passwordResetRecoveryPhone-title = 您的恢复电话号码已用于确认密码重设
passwordResetRecoveryPhone-device = 恢复电话号码已从以下位置使用：
passwordResetRecoveryPhone-action = 管理账户
passwordResetWithRecoveryKeyPrompt-subject = 您的密码已重置
passwordResetWithRecoveryKeyPrompt-title = 您的密码已重置
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = 您通过以下设备重置了 { -product-mozilla-account }密码：
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = 创建账户恢复密钥
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = 创建账户恢复密钥：
passwordResetWithRecoveryKeyPrompt-cta-description = 您需要在所有同步的设备上重新登录。下次可使用账户恢复密钥，确保自己的数据安全无虞，忘记密码时也能恢复数据。
postAddAccountRecovery-subject-3 = 已创建新的账户恢复密钥
postAddAccountRecovery-title2 = 您已生成新的账户恢复密钥
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = 请妥善保存此密钥。如果您忘记密码，则需要用它来恢复加密的浏览数据。
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = 此密钥只能使用一次。使用过后，我们会为您自动创建新密钥。您也可随时在账户设置中创建新密钥。
postAddAccountRecovery-action = 管理账户
postAddLinkedAccount-subject-2 = 新账户已关联到 { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = 您的 { $providerName } 账户已关联到 { -product-mozilla-account }
postAddLinkedAccount-action = 管理账户
postAddRecoveryPhone-subject = 已添加恢复电话号码
postAddRecoveryPhone-preview = 账户受两步验证保护
postAddRecoveryPhone-title-v2 = 您已添加恢复电话号码
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = 您已将 { $maskedLastFourPhoneNumber } 设置为恢复电话号码
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = 此举如何保护您的账户
postAddRecoveryPhone-how-protect-plaintext = 此举如何保护您的账户：
postAddRecoveryPhone-enabled-device = 您已从下列位置启用：
postAddRecoveryPhone-action = 管理账户
postAddTwoStepAuthentication-preview = 您的账户已受保护
postAddTwoStepAuthentication-subject-v3 = 两步验证已开启
postAddTwoStepAuthentication-title-2 = 您已开启两步验证
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = 您已从以下位置请求：
postAddTwoStepAuthentication-action = 管理账户
postAddTwoStepAuthentication-code-required-v4 = 现在起，每次登录时都会要求您输入身份验证应用上的安全码。
postAddTwoStepAuthentication-recovery-method-codes = 您已同时将备用验证码添加为恢复方式。
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = 您已同时将 { $maskedPhoneNumber } 添加为恢复电话号码。
postAddTwoStepAuthentication-how-protects-link = 此举如何保护您的账户
postAddTwoStepAuthentication-how-protects-plaintext = 此举如何保护您的账户：
postAddTwoStepAuthentication-device-sign-out-message = 为保护所有连接的设备，您应在所有使用此账户的设备上退出登录，然后再使用两步验证重新登录。
postChangeAccountRecovery-subject = 账户恢复密钥已更改
postChangeAccountRecovery-title = 您更改了账户恢复密钥
postChangeAccountRecovery-body-part1 = 您现在有了新的账户恢复密钥，先前的密钥已删除。
postChangeAccountRecovery-body-part2 = 请妥善保存新密钥。如果您忘记密码，则需要用它来恢复加密的浏览数据。
postChangeAccountRecovery-action = 管理账户
postChangePrimary-subject = 主邮箱已更新
postChangePrimary-title = 新的主邮箱
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = 您已成功将主邮箱更改为 { $email }。此邮箱地址现在是您用于登录 { -product-mozilla-account }的用户名，也用于接收安全通知和登录确认。
postChangePrimary-action = 管理账户
postChangeRecoveryPhone-subject = 已更新恢复电话号码
postChangeRecoveryPhone-preview = 账户受两步验证保护
postChangeRecoveryPhone-title = 您更改了恢复电话号码
postChangeRecoveryPhone-description = 您已设置新的恢复电话号码，先前的电话号码已删除。
postChangeRecoveryPhone-requested-device = 您从下列位置请求：
postChangeTwoStepAuthentication-preview = 您的账户已受保护
postChangeTwoStepAuthentication-subject = 两步验证已更新
postChangeTwoStepAuthentication-title = 两步验证已更新
postChangeTwoStepAuthentication-use-new-account = 从现在起，您需要在身份验证应用中使用新的 { -product-mozilla-account }项。原有的项将会失效，您可以将其移除。
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = 您已从以下设备请求：
postChangeTwoStepAuthentication-action = 管理账户
postChangeTwoStepAuthentication-how-protects-link = 此举如何保护您的账户
postChangeTwoStepAuthentication-how-protects-plaintext = 此举如何保护您的账户：
postChangeTwoStepAuthentication-device-sign-out-message = 为保护所有连接的设备，您应在所有使用此账户的设备上退出登录，然后再使用新的两步验证信息重新登录。
postConsumeRecoveryCode-title-3 = 您的备用验证码已用于确认密码重设
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = 验证码已从以下位置使用：
postConsumeRecoveryCode-action = 管理账户
postConsumeRecoveryCode-subject-v3 = 备用验证码已使用
postConsumeRecoveryCode-preview = 请确认是否为本人操作
postNewRecoveryCodes-subject-2 = 已生成新的备份验证码
postNewRecoveryCodes-title-2 = 您已生成新的备用验证码
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = 创建于：
postNewRecoveryCodes-action = 管理账户
postRemoveAccountRecovery-subject-2 = 已删除账户恢复密钥
postRemoveAccountRecovery-title-3 = 您已删除账户恢复密钥。
postRemoveAccountRecovery-body-part1 = 在忘记密码的情况下，需要使用账户恢复密钥来恢复加密的浏览数据。
postRemoveAccountRecovery-body-part2 = 请在账户设置中创建新的账户恢复密钥，以免丢失您保存的密码、书签、浏览历史等数据。
postRemoveAccountRecovery-action = 管理账户
postRemoveRecoveryPhone-subject = 已移除恢复电话号码
postRemoveRecoveryPhone-preview = 账户受两步验证保护
postRemoveRecoveryPhone-title = 已移除恢复电话号码
postRemoveRecoveryPhone-description-v2 = 您的恢复电话号码已从两步验证设置中移除。
postRemoveRecoveryPhone-description-extra = 您在无法使用身份验证应用程序时，仍可使用备用验证码来登录。
postRemoveRecoveryPhone-requested-device = 您从下列位置请求：
postRemoveSecondary-subject = 已移除备用邮箱
postRemoveSecondary-title = 已移除备用邮箱
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = 您已成功将备用邮箱 { $secondaryEmail } 从 { -product-mozilla-account }中删除。安全通知和登录确认将不再发送到此地址。
postRemoveSecondary-action = 管理账户
postRemoveTwoStepAuthentication-subject-line-2 = 两步验证已关闭
postRemoveTwoStepAuthentication-title-2 = 您已关闭两步验证
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = 您已从下列位置禁用：
postRemoveTwoStepAuthentication-action = 管理账户
postRemoveTwoStepAuthentication-not-required-2 = 登录时，不会再要求您输入身份验证应用上的安全码。
postSigninRecoveryCode-subject = 已通过备用验证码登录
postSigninRecoveryCode-preview = 确认账户活动
postSigninRecoveryCode-title = 您的账户已通过备用验证码登录
postSigninRecoveryCode-description = 若非本人操作，请立即更改密码以保护账户安全。
postSigninRecoveryCode-device = 您已从以下位置登录：
postSigninRecoveryCode-action = 管理账户
postSigninRecoveryPhone-subject = 已通过恢复电话号码登录
postSigninRecoveryPhone-preview = 确认账户活动
postSigninRecoveryPhone-title = 您的账户已通过恢复电话号码登录
postSigninRecoveryPhone-description = 若非本人操作，请立即更改密码以保护账户安全。
postSigninRecoveryPhone-device = 您已从以下位置登录：
postSigninRecoveryPhone-action = 管理账户
postVerify-sub-title-3 = 很高兴见到您！
postVerify-title-2 = 想在两台设备上看到同样的标签页吗？
postVerify-description-2 = 很简单！只需在另一台设备上安装 { -brand-firefox } 并登录，即可进行同步，如同魔术般奇妙！
postVerify-sub-description = （嘘…… 这样一来，您还可以在所有已登录的设备上获取书签、密码等 { -brand-firefox } 数据。）
postVerify-subject-4 = { -brand-mozilla } 欢迎您！
postVerify-setup-2 = 连接其他设备：
postVerify-action-2 = 连接其他设备
postVerifySecondary-subject = 已绑定备用邮箱
postVerifySecondary-title = 已绑定备用邮箱
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = 已成功将 { $secondaryEmail } 设为 { -product-mozilla-account }的备用邮箱。安全通知和登录确认现在将同时发送到这两个邮箱地址。
postVerifySecondary-action = 管理账户
recovery-subject = 重置密码
recovery-title-2 = 忘记密码？
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = 我们收到更改 { -product-mozilla-account }密码的请求，来自：
recovery-new-password-button = 通过点击下面的按钮创建一个新密码。此链接将在一小时后失效。
recovery-copy-paste = 通过复制和粘贴下面的 URL 到您的浏览器创建一个新密码。此链接将在一小时后失效。
recovery-action = 创建新密码
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = 您的 { $productName } 订阅已取消
subscriptionAccountDeletion-title = 不敢说后会有期，但愿有缘再见
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 您最近删除了 { -product-mozilla-account }，因此我们也同步取消了您的 { $productName } 订阅。最后一笔款项金额为 { $invoiceTotal }，已于 { $invoiceDateOnly } 支付。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = 欢迎使用 { $productName }：请设置密码。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = 欢迎使用 { $productName }
subscriptionAccountFinishSetup-content-processing = 正在处理您的付款，最多可能需要 4 个工作日才可完成。除非您主动取消订阅，否则将在每个账单周期结束后自动续订。
subscriptionAccountFinishSetup-content-create-3 = 接下来请设置 { -product-mozilla-account }密码，完成后即可开始使用您新订阅的项目。
subscriptionAccountFinishSetup-action-2 = 开始使用
subscriptionAccountReminderFirst-subject = 提醒：请完成账户设置
subscriptionAccountReminderFirst-title = 您暂时还不能访问订阅的项目
subscriptionAccountReminderFirst-content-info-3 = 您几天前创建的 { -product-mozilla-account }还未完成确认。请尽快完成账户设置，以便使用新订阅的内容。
subscriptionAccountReminderFirst-content-select-2 = 选择“创建密码”设置新密码并完成账户验证。
subscriptionAccountReminderFirst-action = 创建密码
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action } :
subscriptionAccountReminderSecond-subject = 最后一次提醒：请设置您的账户
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } 欢迎您！
subscriptionAccountReminderSecond-content-info-3 = 您几天前创建的 { -product-mozilla-account }还未完成确认。请尽快完成账户设置，以便使用新订阅的内容。
subscriptionAccountReminderSecond-content-select-2 = 选择“创建密码”设置新密码并完成账户验证。
subscriptionAccountReminderSecond-action = 创建密码
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = 您的 { $productName } 订阅已取消
subscriptionCancellation-title = 不敢说后会有期，但愿有缘再见

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = 我们已取消您的 { $productName } 订阅。最后一笔款项 { $invoiceTotal } 已于 { $invoiceDateOnly } 支付。
subscriptionCancellation-outstanding-content-2 = 我们已取消您的 { $productName } 订阅。最后一笔款项 { $invoiceTotal } 将于 { $invoiceDateOnly } 支付。
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = 您可持续使用订阅的服务至账单周期结束（{ $serviceLastActiveDateOnly }）为止。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = 您已切换至 { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = 您已成功从 { $productNameOld } 切换至 { $productName }。
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = 从下一期账单开始，我们就会从每 { $productPaymentCycleOld } 收费 { $paymentAmountOld } 调整为每 { $productPaymentCycleNew } 收费 { $paymentAmountNew } 。届时，我们会向您一次性添加 { $paymentProrated } 余额，以退还本 { $productPaymentCycleOld } 剩余天数的差额。
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = 若需要安装新软件才能使用 { $productName }，我们会将下载方式用另一封电子邮件发送予您。
subscriptionDowngrade-content-auto-renew = 除非您主动取消订阅，否则将在每个周期周期开始时自动更新订阅并收费。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = 您的 { $productName } 订阅已取消
subscriptionFailedPaymentsCancellation-title = 已取消您的订阅
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = 由于多次付款失败，我们已取消您的 { $productName } 订阅。若需再次访问订阅内容，请使用新的付款方式重新订阅。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = 已确认 { $productName } 付款
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = 感谢您订阅 { $productName }！
subscriptionFirstInvoice-content-processing = 正在处理您的款项，最多需要四个工作天才能完成。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = 您将收到另一封电子邮件，介绍如何开始使用 { $productName }。
subscriptionFirstInvoice-content-auto-renew = 除非您主动取消订阅，否则将在每个周期开始时自动更新订阅并收费。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = 下次将于 { $nextInvoiceDateOnly } 开具发票。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName } 的付款方式已过期或即将到期
subscriptionPaymentExpired-title-2 = 您的付款方式已过期或即将到期
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = 您用于 { $productName } 的付款方式已过期或即将到期。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } 付款失败
subscriptionPaymentFailed-title = 抱歉，处理付款时遇到问题
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = 处理您最近对 { $productName } 付款时，遇到问题。
subscriptionPaymentFailed-content-outdated-1 = 可能是您的付款方式已过期，或是当前的付款方式已失效。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = 需要更新 { $productName } 的付款信息
subscriptionPaymentProviderCancelled-title = 抱歉，处理付款时遇到问题
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = 处理您最近为 { $productName } 的付款时遇到问题。
subscriptionPaymentProviderCancelled-content-reason-1 = 可能是您的付款方式已过期，或是当前的付款方式已失效。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = 已重新开始订阅 { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = 感谢您重新开始订阅 { $productName }！
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = 您的账单周期与付款信息将保持不变，下次将于 { $nextInvoiceDateOnly } 收取 { $invoiceTotal }。在您主动取消之前，将一直自动续订。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } 自动续订通知
subscriptionRenewalReminder-title = 您的订阅即将续订
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = 尊敬的 { $productName } 用户，
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = 您当前的订阅将在 { $reminderLength } 天后到期，届时 { -brand-mozilla } 将自动续订 { $planIntervalCount } { $planInterval }，并向您账户所设的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-closing = 此致，
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } 团队
subscriptionReplaced-subject = 您的订阅已随方案升级而更新。
subscriptionReplaced-title = 您的订阅已更新
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = 已替换您单独的 { $productName } 订阅，其现已包含在您新的捆绑包中。
subscriptionReplaced-content-credit = 上个订阅中未使用的天数将以余额形式返还至您的账户。余额将自动添加到您的帐户，并抵扣将来的费用。
subscriptionReplaced-content-no-action = 您无需执行任何操作。
subscriptionsPaymentExpired-subject-2 = 您用于订阅的付款方式已过期或即将到期
subscriptionsPaymentExpired-title-2 = 您的付款方式已过期或即将到期
subscriptionsPaymentExpired-content-2 = 您用于支付以下订阅的付款方式已过期或即将到期。
subscriptionsPaymentProviderCancelled-subject = 需要更新 { -brand-mozilla } 产品订阅的付款信息
subscriptionsPaymentProviderCancelled-title = 抱歉，处理付款时遇到问题
subscriptionsPaymentProviderCancelled-content-detected = 处理您最近为下列订阅项目的付款时遇到问题。
subscriptionsPaymentProviderCancelled-content-payment-1 = 可能是您的付款方式已过期，或是当前的付款方式已失效。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = 已收到 { $productName } 付款
subscriptionSubsequentInvoice-title = 感谢您成为订阅者！
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = 我们已收到您最近为 { $productName } 支付的款项。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = 下次将于 { $nextInvoiceDateOnly } 开具发票。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = 您已升级至 { $productName }
subscriptionUpgrade-title = 感谢您的升级订阅！
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = 您已成功升级至 { $productName }。

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = 我们已向您一次性收取 { $invoiceAmountDue }，以补足您的订阅在本账单周期（{ $productPaymentCycleOld }）内剩余天数的差额。
subscriptionUpgrade-content-charge-credit = 您已收到合计 { $paymentProrated } 的账户余额。
subscriptionUpgrade-content-subscription-next-bill-change = 自下期账单起，您的订阅价格将发生变化。
subscriptionUpgrade-content-old-price-day = 此前的费用是每天 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-week = 此前的费用是每周 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-month = 此前的费用是每月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-halfyear = 此前的费用是每六个月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-year = 此前的费用是每年 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-default = 此前的费用是每账单周期 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-day-tax = 此前的费用是每天 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-week-tax = 此前的费用是每周 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-month-tax = 此前的费用是每月 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-halfyear-tax = 此前的费用是每六个月 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-year-tax = 此前的费用是每年 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-default-tax = 此前的费用是每账单周期 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-new-price-day = 此后，您将需要日付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-week = 此后，您将需要周付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-month = 此后，您将需要月付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-halfyear = 此后，您将需要每六个月支付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-year = 此后，您将需要年付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-default = 此后，您将需要每账单周期支付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-day-dtax = 此后，您将需要日付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-week-tax = 此后，您将需要周付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-month-tax = 此后，您将需要月付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-halfyear-tax = 此后，您将需要每六个月支付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-year-tax = 此后，您将需要年付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-default-tax = 此后，您将需要每账单周期支付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-existing = 若此次的升级内容与您现有的订阅重合，我们将进行处理，并向您单独发送一封邮件说明详细信息。若您的新方案包含需要安装的产品，我们将向您单独发送一封邮件说明安装方法。
subscriptionUpgrade-auto-renew = 除非您主动取消订阅，否则将在每个周期周期开始时自动更新订阅并收费。
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = 使用 { $unblockCode } 以登录
unblockCode-preview = 验证码一小时内有效
unblockCode-title = 是您在登录吗？
unblockCode-prompt = 是的话，这是您所需的授权码：
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = 是的话，这里是您需要的授权码：{ $unblockCode }
unblockCode-report = 不是的话，请帮助我们抵御入侵者，并<a data-l10n-name="reportSignInLink">向我们报告</a>。
unblockCode-report-plaintext = 如果不是，请帮助我们防范入侵者，向我们报告此事例。
verificationReminderFinal-subject = 最后一次提醒：请验证您的账户
verificationReminderFinal-description-2 = 您几周前创建的 { -product-mozilla-account }还未完成确认。安全起见，如果在接下来的 24 小时内仍未通过验证，我们将删除该账户。
confirm-account = 验证账户
confirm-account-plaintext = { confirm-account }：
verificationReminderFirst-subject-2 = 记得验证您的账户
verificationReminderFirst-title-3 = { -brand-mozilla } 欢迎您！
verificationReminderFirst-description-3 = 您几天前创建的 { -product-mozilla-account }还未完成确认。请在 15 天内确认您的账户，否则将被自动删除。
verificationReminderFirst-sub-description-3 = 不要错过将您和您的隐私放在首位的浏览器。
confirm-email-2 = 验证账户
confirm-email-plaintext-2 = { confirm-email-2 }：
verificationReminderFirst-action-2 = 验证账户
verificationReminderSecond-subject-2 = 记得验证您的账户
verificationReminderSecond-title-3 = 不要错过 { -brand-mozilla }！
verificationReminderSecond-description-4 = 您几天前创建的 { -product-mozilla-account }还未完成确认。请在 10 天内确认您的账户，否则将被自动删除。
verificationReminderSecond-second-description-3 = 您的 { -product-mozilla-account }可让您跨设备同步 { -brand-firefox } 体验，并解锁访问 { -brand-mozilla } 更多保护隐私的产品。
verificationReminderSecond-sub-description-2 = 让互联网成为对所有人开放的地方，是我们使命的一部分。
verificationReminderSecond-action-2 = 验证账户
verify-title-3 = 携手 { -brand-mozilla } 打开互联网世界
verify-description-2 = 确认您的账户后，即可在所有已登录设备上解锁 { -brand-mozilla } 完整体验。体验第一站：
verify-subject = 账户创建完成
verify-action-2 = 验证账户
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = 输入 { $code } 更改您的账户
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview = 此验证码 { $expirationTime } 分钟内有效。
verifyAccountChange-title = 是您在更改账户信息吗？
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = 请确认此更改，以确保账户安全：
verifyAccountChange-prompt = 如若是，请使用此授权码：
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice = { $expirationTime } 分钟内有效。
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = 您是否登录了 { $clientName } ？
verifyLogin-description-2 = 请确认您的登录记录，帮助我们确保您的账户安全：
verifyLogin-subject-2 = 确认登录
verifyLogin-action = 确认登录
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = 使用 { $code } 以登录
verifyLoginCode-preview = 验证码 5 分钟内有效。
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = 您是否登录了 { $serviceName }？
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = 请确认您的登录活动，以确保账户安全：
verifyLoginCode-prompt-3 = 如若是，请使用此授权码：
verifyLoginCode-expiry-notice = 5 分钟内有效。
verifyPrimary-title-2 = 验证主邮箱
verifyPrimary-description = 下列设备请求了一项账户变更：
verifyPrimary-subject = 确认主邮箱
verifyPrimary-action-2 = 验证电子邮箱
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }：
verifyPrimary-post-verify-2 = 验证完成后，即可从此设备进行添加备用邮箱等账户更改操作。
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = 使用 { $code } 以确认备用邮箱
verifySecondaryCode-preview = 验证码 5 分钟内有效。
verifySecondaryCode-title-2 = 验证备用邮箱
verifySecondaryCode-action-2 = 验证电子邮箱
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = 已请求使用 { $email } 作为下列 { -product-mozilla-account }的备用电子邮件地址：
verifySecondaryCode-prompt-2 = 请使用此确认码：
verifySecondaryCode-expiry-notice-2 = 验证码将于 5 分钟后失效。验证完成后，此邮箱也将开始接收安全通知和验证邮件。
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = 使用 { $code } 以确认账户
verifyShortCode-preview-2 = 验证码 5 分钟内有效
verifyShortCode-title-3 = 携手 { -brand-mozilla } 打开互联网世界
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = 确认您的账户后，即可在所有已登录设备上解锁 { -brand-mozilla } 完整体验。体验第一站：
verifyShortCode-prompt-3 = 请使用此确认码：
verifyShortCode-expiry-notice = 5 分钟内有效。
