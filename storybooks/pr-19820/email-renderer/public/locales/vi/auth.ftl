## Non-email strings

session-verify-send-push-title-2 = Đăng nhập vào { -product-mozilla-account } của bạn?
session-verify-send-push-body-2 = Nhấp vào đây để xác minh đó là bạn
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } là mã xác minh { -brand-mozilla } của bạn. Hết hạn sau 5 phút.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Mã xác minh { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } là mã phục hồi { -brand-mozilla } của bạn. Hết hạn sau 5 phút.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Mã { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } là mã phục hồi { -brand-mozilla } của bạn. Hết hạn sau 5 phút.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Mã { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Đồng bộ hóa thiết bị">
body-devices-image = <img data-l10n-name="devices-image" alt="Thiết bị">
fxa-privacy-url = Chính sách bảo mật của { -brand-mozilla }
moz-accounts-privacy-url-2 = Thông báo về quyền riêng tư của { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Điều khoản sử dụng của { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Đây là một email tự động; nếu bạn nhận được nó do lỗi, không cần thực hiện hành động nào.
subplat-privacy-notice = Chính sách riêng tư
subplat-privacy-plaintext = Thông báo bảo mật:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Bạn nhận được email này vì { $email } đã tạo { -product-mozilla-account } và bạn đã đăng ký { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Bạn nhận được email này vì { $email } đã tạo { -product-mozilla-account }.
subplat-explainer-multiple-2 = Bạn nhận được email này vì { $email } đã tạo { -product-mozilla-account } và bạn đã đăng ký nhiều sản phẩm.
subplat-explainer-was-deleted-2 = Bạn nhận được email này vì { $email } đã được đăng ký cho { -product-mozilla-account }.
subplat-manage-account-2 = Quản lý cài đặt { -product-mozilla-account } của bạn bằng cách truy cập <a data-l10n-name="subplat-account-page">trang tài khoản</a> của bạn.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Quản lý cài đặt { -product-mozilla-account } của bạn bằng cách truy cập trang tài khoản của bạn: { $accountSettingsUrl }
subplat-terms-policy = Điều khoản và chính sách hủy bỏ
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Hủy thuê bao
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Kích hoạt lại thuê bao
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Cập nhật thông tin thanh toán
subplat-privacy-policy = Chính sách bảo mật của { -brand-mozilla }
subplat-privacy-policy-2 = Thông báo về quyền riêng tư của { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Điều khoản sử dụng của { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Pháp lý
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Riêng tư
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Nếu tài khoản của bạn bị xóa, bạn vẫn sẽ nhận được email từ Mozilla Corporation và Mozilla Foundation, trừ khi bạn <a data-l10n-name="unsubscribeLink">yêu cầu hủy đăng ký</a>.
account-deletion-info-block-support = Nếu bạn có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ <a data-l10n-name="supportLink">nhóm hỗ trợ</a> của chúng tôi.
account-deletion-info-block-communications-plaintext = Nếu tài khoản của bạn bị xóa, bạn vẫn sẽ nhận được email từ Mozilla Corporation và Mozilla Foundation, trừ khi bạn yêu cầu hủy đăng ký:
account-deletion-info-block-support-plaintext = Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với nhóm hỗ trợ của chúng tôi:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Tải xuống { $productName } trên { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Tải xuống { $productName } trên { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Cài đặt { $productName } trên <a data-l10n-name="anotherDeviceLink">một thiết bị máy tính để bàn khác</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Cài đặt { $productName } trên <a data-l10n-name="anotherDeviceLink">một thiết bị khác</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Tải xuống { $productName } trên Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Tải xuống { $productName } trên App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Cài đặt { $productName } trên một thiết bị khác:
automated-email-change-2 = Nếu bạn không thực hiện hành động này, hãy <a data-l10n-name="passwordChangeLink">thay đổi mật khẩu của bạn</a> ngay lập tức.
automated-email-support = Để biết thêm thông tin, hãy truy cập <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Nếu bạn không thực hiện hành động này, hãy thay đổi mật khẩu của bạn ngay lập tức:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Để biết thêm thông tin, hãy truy cập { -brand-mozilla } Support:
automated-email-inactive-account = Đây là một email tự động. Bạn nhận được nó bởi vì bạn có một { -product-mozilla-account } và bạn đã không đăng nhập nó trong vòng 2 năm gần đây.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext }Để biết thêm thông tin, hãy truy cập <<a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
automated-email-no-action-plaintext = Đây là một email tự động. Nếu bạn nhận nhầm, bạn không cần phải làm gì cả.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Đây là email tự động; nếu bạn không nhận ra hành động này, vui lòng thay đổi mật khẩu của bạn:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Yêu cầu này đến từ { $uaBrowser } trên { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Yêu cầu này đến từ { $uaBrowser } trên { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Yêu cầu này đến từ { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Yêu cầu này đến từ { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Yêu cầu này đến từ { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Nếu không phải là bạn, vui lòng <a data-l10n-name="revokeAccountRecoveryLink">xoá khoá mới tạo</a> hoặc <a data-l10n-name="passwordChangeLink">thay đổi mật khẩu của bạn</a>.
automatedEmailRecoveryKey-change-pwd-only = Nếu không phải là bạn, vui lòng <a data-l10n-name="passwordChangeLink">đổi mật khẩu của bạn</a>.
automatedEmailRecoveryKey-more-info = Để biết thêm thông tin, hãy truy cập <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Yêu cầu này đến từ:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Nếu đây không phải là bạn, hãy xóa khóa mới tạo:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Nếu đây không phải là bạn, hãy thay đổi mật khẩu của bạn:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = và thay đổi mật khẩu của bạn:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Để biết thêm thông tin, hãy truy cập { -brand-mozilla } Support:
automated-email-reset =
    Đây là một tự động; nếu bạn không nhận ra hành động này, <a data-l10n-name="resetLink">vui lòng đặt lại mật khẩu của bạn </a>.
    Để biết thêm thông tin, vui lòng truy cập <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Nếu bạn không cho phép hành động này, vui lòng đặt lại mật khẩu của bạn ngay bây giờ tại { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Nếu bạn không thực hiện hành động này, hãy <a data-l10n-name="resetLink">đặt lại mật khẩu của bạn</a> và <a data-l10n-name="twoFactorSettingsLink">đặt lại xác thực hai bước</a> ngay.
    Để biết thêm thông tin, vui lòng truy cập <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Nếu bạn không thực hiện hành động này, hãy đặt lại mật khẩu ngay tại:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Ngoài ra, hãy đặt lại xác thực hai bước tại:
brand-banner-message = Bạn có biết chúng tôi đã đổi tên từ { -product-firefox-accounts } thành { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Tìm hiểu thêm</a>
cancellationSurvey = Vui lòng giúp chúng tôi cải thiện dịch vụ của mình bằng cách thực hiện <a data-l10n-name="cancellationSurveyUrl">khảo sát ngắn</a> này.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Vui lòng giúp chúng tôi cải thiện dịch vụ của mình bằng cách thực hiện khảo sát ngắn này:
change-password-plaintext = Nếu bạn nghi ngờ rằng ai đó đang cố truy cập vào tài khoản của bạn, vui lòng thay đổi mật khẩu của bạn.
manage-account = Quản lý tài khoản
manage-account-plaintext = { manage-account }:
payment-details = Chi tiết thanh toán:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Số hóa đơn: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Đã tính phí: { $invoiceTotal } vào { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Hóa đơn tiếp theo: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Phương thức thanh toán:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Phương thức thanh toán: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Phương thức thanh toán: Thẻ { $cardName } kết thúc bằng { $lastFour }
payment-provider-card-ending-in-plaintext = Phương thức thanh toán: Thẻ kết thúc bằng { $lastFour }
payment-provider-card-ending-in = <b>Phương thức thanh toán:</b> Thẻ kết thúc bằng { $lastFour }
payment-provider-card-ending-in-card-name = <b>Phương thức thanh toán:</b> { $cardName } kết thúc bằng { $lastFour }
subscription-charges-invoice-summary = Tóm tắt hoá đơn

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Số hóa đơn:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Số hóa đơn: { $invoiceNumber }
subscription-charges-invoice-date = <b>Ngày:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Ngày: { $invoiceDateOnly }
subscription-charges-prorated-price = Giá theo tỷ lệ
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Giá theo tỷ lệ: { $remainingAmountTotal }
subscription-charges-list-price = Giá niêm yết
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Giá niêm yết: { $offeringPrice }
subscription-charges-credit-from-unused-time = Tín dụng từ thời gian chưa sử dụng
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Tín dụng từ thời gian chưa sử dụng: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Tổng tạm tính</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Tổng tạm tính: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Giảm giá một lần
subscription-charges-one-time-discount-plaintext = Giảm giá một lần: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
       *[other] Giảm giá { $discountDuration } tháng
    }
subscription-charges-repeating-discount-plaintext = Giảm giá { $discountDuration } tháng: { $invoiceDiscountAmount }
subscription-charges-discount = Giảm giá
subscription-charges-discount-plaintext = Giảm giá: { $invoiceDiscountAmount }
subscription-charges-taxes = Thuế & phí
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Thuế & phí: { $invoiceTaxAmount }
subscription-charges-total = <b>Tổng</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Tổng: { $invoiceTotal }
subscription-charges-credit-applied = Tín dụng được áp dụng
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Tín dụng được áp dụng: { $creditApplied }
subscription-charges-amount-paid = <b>Số tiền đã thanh toán</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Số tiền đã thanh toán: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Bạn đã nhận được khoản tín dụng tài khoản là { $creditReceived }, sẽ được áp dụng cho các thanh toán trong tương lai của bạn.

##

subscriptionSupport = Câu hỏi về thuê bao của bạn? <a data-l10n-name="subscriptionSupportUrl">Nhóm hỗ trợ</a> của chúng tôi sẵn sàng giúp đỡ bạn.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Có câu hỏi về thuê bao của bạn? Nhóm hỗ trợ của chúng tôi sẵn sàng giúp bạn:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Cảm ơn bạn đã đăng ký { $productName }. Nếu bạn có bất kỳ câu hỏi nào về thuê bao của mình hoặc cần thêm thông tin về { $productName }, vui lòng <a data-l10n-name="subscriptionSupportUrl">liên hệ với chúng tôi</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Cảm ơn bạn đã đăng ký { $productName }. Nếu bạn có bất kỳ câu hỏi nào về thuê bao của mình hoặc cần thêm thông tin về { $productName }, vui lòng liên hệ với chúng tôi:
subscription-support-get-help = Nhận trợ giúp với gói đăng ký của bạn
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Quản lý gói đăng ký của bạn</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Quản lý gói đăng ký của bạn:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Liên hệ hỗ trợ</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Liên hệ hỗ trợ:
subscriptionUpdateBillingEnsure = Bạn có thể đảm bảo rằng phương thức thanh toán và thông tin tài khoản của mình được cập nhật <a data-l10n-name="updateBillingUrl">tại đây</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Bạn có thể đảm bảo rằng phương thức thanh toán và thông tin tài khoản của mình được cập nhật tại đây:
subscriptionUpdateBillingTry = Chúng tôi sẽ thử lại khoản thanh toán của bạn trong vài ngày tới, nhưng bạn có thể cần giúp chúng tôi khắc phục bằng cách <a data-l10n-name="updateBillingUrl">cập nhật thông tin thanh toán của bạn</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Chúng tôi sẽ thử lại khoản thanh toán của bạn trong vài ngày tới, nhưng bạn có thể cần giúp chúng tôi khắc phục sự cố này bằng cách cập nhật thông tin thanh toán của bạn:
subscriptionUpdatePayment = Để ngăn chặn bất kỳ sự gián đoạn nào đối với dịch vụ của bạn, vui lòng <a data-l10n-name="updateBillingUrl">cập nhật thông tin thanh toán của bạn</a> càng sớm càng tốt.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Để ngăn chặn bất kỳ sự gián đoạn nào đối với dịch vụ của bạn, vui lòng cập nhật thông tin thanh toán của bạn càng sớm càng tốt:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Để biết thêm thông tin, hãy truy cập <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Để biết thêm thông tin, hãy truy cập { -brand-mozilla } Support: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } trên { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } trên { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (ước tính)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (ước tính)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (ước tính)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (ước tính)
view-invoice-link-action = Xem hoá đơn
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Xem hóa đơn: { $invoiceLink }
cadReminderFirst-subject-1 = Lời nhắc nhở! Hãy đồng bộ hóa { -brand-firefox }
cadReminderFirst-action = Đồng bộ hóa thiết bị khác
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Hai thiết bị để đồng bộ hóa
cadReminderFirst-description-v2 = Nhận các thẻ của bạn trên tất cả các thiết bị của bạn. Nhận dấu trang, mật khẩu và dữ liệu khác ở mọi nơi bạn sử dụng { -brand-firefox }.
cadReminderSecond-subject-2 = Đừng bỏ lỡ! Hãy hoàn tất thiết lập đồng bộ hóa của bạn
cadReminderSecond-action = Đồng bộ hóa thiết bị khác
cadReminderSecond-title-2 = Đừng quên đồng bộ hóa!
cadReminderSecond-description-sync = Đồng bộ hóa dấu trang, mật khẩu, thẻ đang mở và hơn thế nữa — ở mọi nơi bạn sử dụng { -brand-firefox }.
cadReminderSecond-description-plus = Ngoài ra, dữ liệu của bạn luôn được mã hóa. Chỉ bạn và các thiết bị bạn phê duyệt mới có thể nhìn thấy nó.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Chào mừng đến với { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Chào mừng đến với { $productName }
downloadSubscription-content-2 = Hãy bắt đầu sử dụng tất cả các tính năng có trong thuê bao của bạn:
downloadSubscription-link-action-2 = Bắt đầu
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } của bạn đã bị xoá
fraudulentAccountDeletion-title = Tài khoản của bạn đã bị xóa
fraudulentAccountDeletion-content-part1-v2 = Gần đây, một { -product-mozilla-account } đã được tạo và đăng ký được tính phí bằng địa chỉ email này. Như chúng tôi làm với tất cả các tài khoản mới, chúng tôi đã yêu cầu bạn xác nhận tài khoản của mình bằng cách xác thực địa chỉ email này trước tiên.
fraudulentAccountDeletion-content-part2-v2 = Hiện tại, chúng tôi thấy rằng tài khoản chưa bao giờ được xác nhận. Vì bước này chưa được hoàn thành nên chúng tôi không chắc liệu đây có phải là đăng ký được ủy quyền hay không. Do đó, { -product-mozilla-account } được đăng ký theo địa chỉ email này đã bị xóa và thuê bao của bạn đã bị hủy với tất cả các khoản phí đã được hoàn lại.
fraudulentAccountDeletion-contact = Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với<a data-l10n-name="mozillaSupportUrl">nhóm hỗ trợ</a> của chúng tôi.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với nhóm hỗ trợ của chúng tôi: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Cơ hội cuối cùng để giữ { -product-mozilla-account } của bạn
inactiveAccountFinalWarning-title = Tài khoản { -brand-mozilla } và dữ liệu của bạn sẽ bị xoá
inactiveAccountFinalWarning-preview = Đăng nhập để giữ tài khoản của bạn
inactiveAccountFinalWarning-account-description = { -product-mozilla-account } của bạn được sử dụng để truy cập các sản phẩm duyệt web và quyền riêng tư miễn phí như đồng bộ hoá { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay }, và { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Vào <strong>{ $deletionDate }</strong>, tài khoản của bạn và dữ liệu cá nhân của bạn sẽ bị xóa vĩnh viễn trừ khi bạn đăng nhập.
inactiveAccountFinalWarning-action = Đăng nhập để giữ tài khoản của bạn
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Đăng nhập để giữ tài khoản của bạn:
inactiveAccountFirstWarning-subject = Đừng để mất tài khoản của bạn
inactiveAccountFirstWarning-title = Bạn có muốn giữ lại tài khoản và dữ liệu { -brand-mozilla } của mình không?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } của bạn được sử dụng để truy cập các sản phẩm duyệt web và quyền riêng tư miễn phí như đồng bộ hoá { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay }, và { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Chúng tôi nhận thấy bạn đã không đăng nhập trong 2 năm.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tài khoản và dữ liệu cá nhân của bạn sẽ bị xóa vĩnh viễn vào <strong>{ $deletionDate }</strong> vì bạn không hoạt động.
inactiveAccountFirstWarning-action = Đăng nhập để giữ tài khoản của bạn
inactiveAccountFirstWarning-preview = Đăng nhập để giữ tài khoản của bạn
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Đăng nhập để giữ tài khoản của bạn:
inactiveAccountSecondWarning-subject = Cần hành động của bạn: Tài khoản sẽ bị xoá sau 7 ngày
inactiveAccountSecondWarning-title = Tài khoản và dữ liệu { -brand-mozilla } của bạn sẽ bị xóa sau 7 ngày nữa
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account } của bạn được sử dụng để truy cập các sản phẩm duyệt web và quyền riêng tư miễn phí như đồng bộ hoá { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay }, và { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tài khoản và dữ liệu cá nhân của bạn sẽ bị xóa vĩnh viễn vào <strong>{ $deletionDate }</strong> vì bạn không hoạt động.
inactiveAccountSecondWarning-action = Đăng nhập để giữ tài khoản của bạn
inactiveAccountSecondWarning-preview = Đăng nhập để giữ tài khoản của bạn
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Đăng nhập để giữ tài khoản của bạn:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Bạn đã hết mã xác thực dự phòng!
codes-reminder-title-one = Bạn đang sử dụng mã xác thực dự phòng cuối cùng của mình
codes-reminder-title-two = Đã đến lúc tạo thêm mã xác thực dự phòng
codes-reminder-description-part-one = Mã xác thực dự phòng giúp bạn khôi phục thông tin khi quên mật khẩu.
codes-reminder-description-part-two = Tạo mã mới ngay bây giờ để bạn không bị mất dữ liệu của mình sau này.
codes-reminder-description-two-left = Bạn chỉ còn lại hai mã.
codes-reminder-description-create-codes = Tạo mã xác thực dự phòng mới để giúp bạn vào lại tài khoản của mình nếu bạn bị khóa.
lowRecoveryCodes-action-2 = Tạo mã
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Không còn mã xác thực dự phòng nào
       *[other] Chỉ còn lại { $numberRemaining } mã xác thực dự phòng!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Đăng nhập mới vào { $clientName }
newDeviceLogin-subjectForMozillaAccount = Đăng nhập mới vào { -product-mozilla-account } của bạn
newDeviceLogin-title-3 = { -product-mozilla-account } của bạn đã được sử dụng để đăng nhập
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Không phải bạn? <a data-l10n-name="passwordChangeLink">Thay đổi mật khẩu của bạn</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Không phải bạn? Thay đổi mật khẩu của bạn:
newDeviceLogin-action = Quản lý tài khoản
passwordChanged-subject = Đã cập nhật mật khẩu
passwordChanged-title = Mật khẩu đã thay đổi thành công
passwordChanged-description-2 = Mật khẩu { -product-mozilla-account } của bạn đã được thay đổi thành công từ thiết bị sau:
passwordChangeRequired-subject = Phát hiện hoạt động đáng ngờ
passwordChangeRequired-preview = Hãy thay đổi mật khẩu ngay lập tức
passwordChangeRequired-title-2 = Đặt lại mật khẩu của bạn
passwordChangeRequired-suspicious-activity-3 = Chúng tôi đã khóa tài khoản của bạn để bảo vệ tài khoản khỏi hoạt động đáng ngờ. Bạn đã đăng xuất khỏi tất cả các thiết bị của mình và mọi dữ liệu đã đồng bộ hóa đã bị xóa như một biện pháp phòng ngừa.
passwordChangeRequired-sign-in-3 = Để đăng nhập lại vào tài khoản, tất cả những gì bạn cần làm là đặt lại mật khẩu.
passwordChangeRequired-different-password-2 = <b>Quan trọng:</b> Chọn một mật khẩu mạnh, khác với mật khẩu bạn đã từng sử dụng trước đây.
passwordChangeRequired-different-password-plaintext-2 = Quan trọng: Chọn một mật khẩu mạnh, khác với mật khẩu bạn đã từng sử dụng trước đây.
passwordChangeRequired-action = Đặt lại mật khẩu
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Sử dụng { $code } để thay đổi mật khẩu của bạn
password-forgot-otp-preview = Mã này sẽ hết hạn sau 10 phút.
password-forgot-otp-title = Bạn đã quên mật khẩu?
password-forgot-otp-request = Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu { -product-mozilla-account } của bạn từ:
password-forgot-otp-code-2 = Nếu đây là bạn, đây là mã xác minh để bạn tiếp tục:
password-forgot-otp-expiry-notice = Mã này sẽ hết hạn sau 10 phút.
passwordReset-subject-2 = Mật khẩu của bạn đã được đặt lại
passwordReset-title-2 = Mật khẩu của bạn đã được đặt lại
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Bạn đã đặt lại mật khẩu { -product-mozilla-account } của mình trên:
passwordResetAccountRecovery-subject-2 = Mật khẩu của bạn đã được đặt lại
passwordResetAccountRecovery-title-3 = Mật khẩu của bạn đã được đặt lại
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Bạn đã sử dụng khóa khôi phục tài khoản để đặt lại mật khẩu { -product-mozilla-account } của mình trên:
passwordResetAccountRecovery-information = Chúng tôi đã đăng xuất bạn khỏi tất cả các thiết bị được đồng bộ hóa của bạn. Chúng tôi đã tạo khóa khôi phục tài khoản mới để thay thế khóa bạn đã sử dụng. Bạn có thể thay đổi nó trong cài đặt tài khoản của bạn.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Chúng tôi đã đăng xuất bạn khỏi tất cả các thiết bị được đồng bộ hóa của bạn. Chúng tôi đã tạo khóa khôi phục tài khoản mới để thay thế khóa bạn đã sử dụng. Bạn có thể thay đổi nó trong cài đặt tài khoản của bạn:
passwordResetAccountRecovery-action-4 = Quản lý tài khoản
passwordResetRecoveryPhone-subject = Đã sử dụng số điện thoại khôi phục
passwordResetRecoveryPhone-preview = Hãy kiểm tra để chắc chắn rằng điều này do bạn làm
passwordResetRecoveryPhone-title = Số điện thoại khôi phục của bạn đã được sử dụng để xác nhận đặt lại mật khẩu
passwordResetRecoveryPhone-device = Số điện thoại khôi phục được sử dụng từ:
passwordResetRecoveryPhone-action = Quản lý tài khoản
passwordResetWithRecoveryKeyPrompt-subject = Mật khẩu của bạn đã được đặt lại
passwordResetWithRecoveryKeyPrompt-title = Mật khẩu của bạn đã được đặt lại
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Bạn đã đặt lại mật khẩu { -product-mozilla-account } của mình trên:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Tạo khóa khôi phục tài khoản
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Tạo khóa khôi phục tài khoản:
passwordResetWithRecoveryKeyPrompt-cta-description = Bạn sẽ cần đăng nhập lại trên tất cả các thiết bị đã đồng bộ hóa của mình. Giữ dữ liệu của bạn an toàn vào lần tiếp theo bằng khóa khôi phục tài khoản. Điều này cho phép bạn khôi phục dữ liệu nếu bạn quên mật khẩu.
postAddAccountRecovery-subject-3 = Đã tạo khóa khôi phục tài khoản mới
postAddAccountRecovery-title2 = Bạn đã tạo khóa khôi phục tài khoản mới
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Lưu khóa này ở nơi an toàn — bạn sẽ cần nó để khôi phục dữ liệu duyệt web được mã hóa nếu bạn quên mật khẩu.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Khóa này chỉ có thể được sử dụng một lần. Sau khi bạn sử dụng nó, chúng tôi sẽ tự động tạo một cái mới cho bạn. Hoặc bạn có thể tạo một tài khoản mới bất kỳ lúc nào từ cài đặt tài khoản của mình.
postAddAccountRecovery-action = Quản lý tài khoản
postAddLinkedAccount-subject-2 = Tài khoản mới được liên kết với { -product-mozilla-account } của bạn
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tài khoản { $providerName } của bạn đã được liên kết với { -product-mozilla-account }
postAddLinkedAccount-action = Quản lý tài khoản
postAddRecoveryPhone-subject = Đã thêm số điện thoại khôi phục
postAddRecoveryPhone-preview = Tài khoản được bảo vệ bằng xác thực hai bước
postAddRecoveryPhone-title-v2 = Bạn đã thêm số điện thoại khôi phục
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Bạn đã thêm { $maskedLastFourPhoneNumber } làm số điện thoại khôi phục của mình
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn
postAddRecoveryPhone-how-protect-plaintext = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn:
postAddRecoveryPhone-enabled-device = Bạn đã bật nó từ:
postAddRecoveryPhone-action = Quản lý tài khoản
postAddTwoStepAuthentication-preview = Tài khoản của bạn được bảo vệ
postAddTwoStepAuthentication-subject-v3 = Đã bật xác thực hai bước
postAddTwoStepAuthentication-title-2 = Bạn đã bật xác thực hai bước
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Bạn đã yêu cầu điều này từ:
postAddTwoStepAuthentication-action = Quản lý tài khoản
postAddTwoStepAuthentication-code-required-v4 = Mã bảo mật từ ứng dụng xác thực của bạn hiện được yêu cầu mỗi khi bạn đăng nhập.
postAddTwoStepAuthentication-recovery-method-codes = Bạn cũng đã thêm mã xác thực dự phòng làm phương pháp khôi phục của mình.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Bạn cũng đã thêm { $maskedPhoneNumber } làm số điện thoại khôi phục của mình.
postAddTwoStepAuthentication-how-protects-link = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn
postAddTwoStepAuthentication-how-protects-plaintext = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn:
postAddTwoStepAuthentication-device-sign-out-message = Để bảo vệ tất cả các thiết bị được kết nối, bạn nên đăng xuất ở mọi nơi bạn sử dụng tài khoản này, sau đó đăng nhập lại bằng xác thực hai bước.
postChangeAccountRecovery-subject = Khóa khôi phục tài khoản đã thay đổi
postChangeAccountRecovery-title = Bạn đã thay đổi khóa khôi phục tài khoản của mình
postChangeAccountRecovery-body-part1 = Bây giờ bạn đã có khóa khôi phục tài khoản mới. Khóa trước của bạn đã bị xóa.
postChangeAccountRecovery-body-part2 = Lưu khóa mới này ở nơi an toàn — bạn sẽ cần nó để khôi phục dữ liệu duyệt web được mã hóa nếu bạn quên mật khẩu.
postChangeAccountRecovery-action = Quản lý tài khoản
postChangePrimary-subject = Email chính đã xác minh
postChangePrimary-title = Email chính mới
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Bạn đã thay đổi thành công email chính của mình thành { $email }. Địa chỉ này hiện là tên người dùng để đăng nhập vào { -product-mozilla-account } của bạn cũng như nhận thông báo bảo mật và xác nhận đăng nhập.
postChangePrimary-action = Quản lý tài khoản
postChangeRecoveryPhone-subject = Đã cập nhật số điện thoại khôi phục
postChangeRecoveryPhone-preview = Tài khoản được bảo vệ bằng xác thực hai bước
postChangeRecoveryPhone-title = Bạn đã thay đổi số điện thoại khôi phục của mình
postChangeRecoveryPhone-description = Bây giờ bạn có số điện thoại khôi phục mới. Số điện thoại trước đó của bạn đã bị xóa.
postChangeRecoveryPhone-requested-device = Bạn đã yêu cầu nó từ:
postChangeTwoStepAuthentication-preview = Tài khoản của bạn được bảo vệ
postChangeTwoStepAuthentication-subject = Đã cập nhật xác thực hai bước
postChangeTwoStepAuthentication-title = Xác thực hai bước đã được cập nhật
postChangeTwoStepAuthentication-use-new-account = Bây giờ bạn cần sử dụng mục { -product-mozilla-account } mới trong ứng dụng xác thực của mình. Mục cũ sẽ không còn hoạt động nữa và bạn có thể xóa nó.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Bạn đã yêu cầu điều này từ:
postChangeTwoStepAuthentication-action = Quản lý tài khoản
postChangeTwoStepAuthentication-how-protects-link = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn
postChangeTwoStepAuthentication-how-protects-plaintext = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn:
postChangeTwoStepAuthentication-device-sign-out-message = Để bảo vệ tất cả các thiết bị được kết nối của bạn, bạn nên đăng xuất ở mọi nơi bạn sử dụng tài khoản này, sau đó đăng nhập lại bằng xác thực hai bước mới.
postConsumeRecoveryCode-title-3 = Mã xác thực dự phòng của bạn đã được sử dụng để xác nhận đặt lại mật khẩu
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Mã được sử dụng từ:
postConsumeRecoveryCode-action = Quản lý tài khoản
postConsumeRecoveryCode-subject-v3 = Đã sử dụng mã xác thực dự phòng
postConsumeRecoveryCode-preview = Hãy kiểm tra để chắc chắn rằng điều này do bạn làm
postNewRecoveryCodes-subject-2 = Đã tạo mã xác thực dự phòng mới
postNewRecoveryCodes-title-2 = Bạn đã tạo mã xác thực dự phòng mới
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Chúng được tạo vào:
postNewRecoveryCodes-action = Quản lý tài khoản
postRemoveAccountRecovery-subject-2 = Khóa khôi phục tài khoản đã bị xóa
postRemoveAccountRecovery-title-3 = Bạn đã xóa khóa khôi phục tài khoản của mình
postRemoveAccountRecovery-body-part1 = Khóa khôi phục tài khoản của bạn là bắt buộc để khôi phục dữ liệu duyệt web được mã hóa nếu bạn quên mật khẩu.
postRemoveAccountRecovery-body-part2 = Nếu bạn chưa tạo, hãy tạo khóa khôi phục tài khoản mới trong cài đặt tài khoản của bạn để tránh mất mật khẩu, dấu trang, lịch sử duyệt web đã lưu, v.v.
postRemoveAccountRecovery-action = Quản lý tài khoản
postRemoveRecoveryPhone-subject = Đã xóa số điện thoại khôi phục
postRemoveRecoveryPhone-preview = Tài khoản được bảo vệ bằng xác thực hai bước
postRemoveRecoveryPhone-title = Đã xóa số điện thoại khôi phục
postRemoveRecoveryPhone-description-v2 = Số điện thoại khôi phục của bạn đã bị xóa khỏi cài đặt xác thực hai bước.
postRemoveRecoveryPhone-description-extra = Bạn vẫn có thể sử dụng mã xác thực dự phòng để đăng nhập nếu bạn không thể sử dụng ứng dụng xác thực.
postRemoveRecoveryPhone-requested-device = Bạn đã yêu cầu nó từ:
postRemoveSecondary-subject = Đã xóa email phụ
postRemoveSecondary-title = Đã xóa email phụ
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Bạn đã xóa thành công { $secondaryEmail } làm email phụ khỏi { -product-mozilla-account } của mình. Thông báo bảo mật và xác nhận đăng nhập sẽ không còn được gửi tới địa chỉ này nữa.
postRemoveSecondary-action = Quản lý tài khoản
postRemoveTwoStepAuthentication-subject-line-2 = Xác thực hai bước đã tắt
postRemoveTwoStepAuthentication-title-2 = Bạn đã tắt xác thực hai bước
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Bạn đã tắt nó từ:
postRemoveTwoStepAuthentication-action = Quản lý tài khoản
postRemoveTwoStepAuthentication-not-required-2 = Bạn không còn cần mã bảo mật từ ứng dụng xác thực của mình khi đăng nhập.
postSigninRecoveryCode-subject = Mã xác thực dự phòng dùng để đăng nhập
postSigninRecoveryCode-preview = Xác nhận hoạt động tài khoản
postSigninRecoveryCode-title = Mã xác thực dự phòng của bạn đã được sử dụng để đăng nhập
postSigninRecoveryCode-description = Nếu không làm điều này, bạn nên thay đổi mật khẩu ngay lập tức để giữ an toàn cho tài khoản của mình.
postSigninRecoveryCode-device = Bạn đã đăng nhập từ:
postSigninRecoveryCode-action = Quản lý tài khoản
postSigninRecoveryPhone-subject = Số điện thoại khôi phục được dùng để đăng nhập
postSigninRecoveryPhone-preview = Xác nhận hoạt động tài khoản
postSigninRecoveryPhone-title = Số điện thoại khôi phục của bạn đã được sử dụng để đăng nhập
postSigninRecoveryPhone-description = Nếu không làm điều này, bạn nên thay đổi mật khẩu ngay lập tức để giữ an toàn cho tài khoản của mình.
postSigninRecoveryPhone-device = Bạn đã đăng nhập từ:
postSigninRecoveryPhone-action = Quản lý tài khoản
postVerify-sub-title-3 = Chúng tôi rất vui được gặp bạn!
postVerify-title-2 = Bạn muốn xem cùng một thẻ trên hai thiết bị?
postVerify-description-2 = Dễ thôi! Chỉ cần cài đặt { -brand-firefox } trên một thiết bị khác và đăng nhập để đồng bộ hóa. Nó giống như một phép thuật!
postVerify-sub-description = (Psst… Điều đó cũng có nghĩa là bạn có thể lấy dấu trang, mật khẩu và dữ liệu { -brand-firefox } khác ở mọi nơi bạn đăng nhập.)
postVerify-subject-4 = Chào mừng đến với { -brand-mozilla }!
postVerify-setup-2 = Kết nối thiết bị khác:
postVerify-action-2 = Kết nối thiết bị khác
postVerifySecondary-subject = Đã thêm email phụ
postVerifySecondary-title = Đã thêm email phụ
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Bạn đã xác nhận thành công { $secondaryEmail } làm email phụ cho { -product-mozilla-account } của mình. Thông báo bảo mật và xác nhận đăng nhập giờ đây sẽ được gửi đến cả hai địa chỉ email.
postVerifySecondary-action = Quản lý tài khoản
recovery-subject = Đặt lại mật khẩu của bạn
recovery-title-2 = Bạn đã quên mật khẩu?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu { -product-mozilla-account } của bạn từ:
recovery-new-password-button = Tạo mật khẩu mới bằng cách nhấp vào nút bên dưới. Liên kết này sẽ hết hạn trong vòng một giờ tới.
recovery-copy-paste = Tạo mật khẩu mới bằng cách sao chép và dán URL bên dưới vào trình duyệt của bạn. Liên kết này sẽ hết hạn trong vòng một giờ tới.
recovery-action = Tạo mật khẩu mới
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Thuê bao { $productName } của bạn đã bị hủy
subscriptionAccountDeletion-title = Rất tiếc vì bạn chuẩn bị ra đi
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Gần đây bạn đã xóa { -product-mozilla-account } của mình. Do đó, chúng tôi đã hủy đăng ký { $productName } của bạn. Khoản thanh toán cuối cùng của bạn là { $invoiceTotal } đã được thanh toán vào { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Chào mừng bạn đến với { $productName }: Vui lòng đặt mật khẩu của bạn.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Chào mừng đến với { $productName }
subscriptionAccountFinishSetup-content-processing = Thanh toán của bạn đang được xử lý và có thể mất đến bốn ngày làm việc để hoàn tất. Thuê bao của bạn sẽ tự động gia hạn mỗi kỳ thanh toán trừ khi bạn chọn hủy.
subscriptionAccountFinishSetup-content-create-3 = Tiếp theo, bạn sẽ tạo mật khẩu { -product-mozilla-account } để bắt đầu sử dụng thuê bao mới của mình.
subscriptionAccountFinishSetup-action-2 = Bắt đầu
subscriptionAccountReminderFirst-subject = Nhắc nhở: Hoàn tất thiết lập tài khoản của bạn
subscriptionAccountReminderFirst-title = Bạn chưa thể truy cập thuê bao của mình
subscriptionAccountReminderFirst-content-info-3 = Vài ngày trước bạn đã tạo { -product-mozilla-account } nhưng chưa bao giờ xác nhận nó. Chúng tôi hy vọng bạn sẽ hoàn tất việc thiết lập tài khoản của mình để có thể sử dụng thuê bao mới.
subscriptionAccountReminderFirst-content-select-2 = Chọn “Tạo mật khẩu” để thiết lập mật khẩu mới và hoàn tất việc xác minh tài khoản của bạn.
subscriptionAccountReminderFirst-action = Tạo mật khẩu
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Lời nhắc cuối cùng: Thiết lập tài khoản của bạn
subscriptionAccountReminderSecond-title-2 = Chào mừng đến với { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Vài ngày trước bạn đã tạo { -product-mozilla-account } nhưng chưa bao giờ xác nhận nó. Chúng tôi hy vọng bạn sẽ hoàn tất việc thiết lập tài khoản của mình để có thể sử dụng thuê bao mới.
subscriptionAccountReminderSecond-content-select-2 = Chọn “Tạo mật khẩu” để thiết lập mật khẩu mới và hoàn tất việc xác minh tài khoản của bạn.
subscriptionAccountReminderSecond-action = Tạo mật khẩu
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Thuê bao { $productName } của bạn đã bị hủy
subscriptionCancellation-title = Rất tiếc vì bạn chuẩn bị ra đi

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Chúng tôi đã hủy đăng ký { $productName } của bạn. Khoản thanh toán { $invoiceTotal } cuối cùng của bạn đã được thanh toán vào { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Chúng tôi đã hủy đăng ký { $productName } của bạn. Khoản thanh toán { $invoiceTotal } cuối cùng của bạn sẽ được thanh toán vào { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Dịch vụ của bạn sẽ tiếp tục cho đến khi kết thúc thời hạn thanh toán hiện tại, tức là { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Bạn đã được chuyển sang { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Bạn đã chuyển thành công từ { $productNameOld } sang { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Bắt đầu với hóa đơn tiếp theo, khoản phí của bạn sẽ thay đổi từ { $paymentAmountOld } trên { $productPaymentCycleOld } thành { $paymentAmountNew } trên { $productPaymentCycleNew }. Vào thời điểm đó, bạn cũng sẽ được nhận tín dụng một lần là { $paymentProrated } để phản ánh khoản phí thấp hơn cho phần còn lại của khoản { $productPaymentCycleOld } này.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Nếu có phần mềm mới để bạn cài đặt để sử dụng { $productName }, bạn sẽ nhận được một email riêng với hướng dẫn tải xuống.
subscriptionDowngrade-content-auto-renew = Thuê bao của bạn sẽ tự động gia hạn mỗi kỳ thanh toán trừ khi bạn chọn hủy.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Thuê bao { $productName } của bạn đã bị hủy
subscriptionFailedPaymentsCancellation-title = Thuê bao của bạn đã bị hủy
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Chúng tôi đã hủy thuê bao { $productName } của bạn vì nhiều lần thanh toán không thành công. Để có lại quyền truy cập, hãy bắt đầu thuê bao mới với phương thức thanh toán được cập nhật.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Đã xác nhận thanh toán { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Cảm ơn bạn đã đăng ký { $productName }
subscriptionFirstInvoice-content-processing = Thanh toán của bạn hiện đang xử lý và có thể mất tới bốn ngày làm việc để hoàn tất.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Bạn sẽ nhận được một email riêng về cách bắt đầu sử dụng { $productName }.
subscriptionFirstInvoice-content-auto-renew = Thuê bao của bạn sẽ tự động gia hạn mỗi kỳ thanh toán trừ khi bạn chọn hủy.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Hóa đơn tiếp theo của bạn sẽ được phát hành vào { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Phương thức thanh toán cho { $productName } đã hết hạn hoặc sắp hết hạn
subscriptionPaymentExpired-title-2 = Phương thức thanh toán của bạn đã hết hạn hoặc sắp hết hạn
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Phương thức thanh toán bạn đang sử dụng cho { $productName } đã hết hạn hoặc sắp hết hạn.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Thanh toán { $productName } không thành công
subscriptionPaymentFailed-title = Xin lỗi, chúng tôi gặp sự cố với thanh toán của bạn
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Chúng tôi đã gặp sự cố với khoản thanh toán mới nhất của bạn cho { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Có thể phương thức thanh toán của bạn đã hết hạn hoặc phương thức thanh toán hiện tại của bạn không chính xác.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Cần cập nhật thông tin thanh toán cho { $productName }
subscriptionPaymentProviderCancelled-title = Xin lỗi, chúng tôi đang gặp sự cố với phương thức thanh toán của bạn
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Chúng tôi đã phát hiện thấy sự cố với phương thức thanh toán của bạn cho { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Có thể phương thức thanh toán của bạn đã hết hạn hoặc phương thức thanh toán hiện tại của bạn không chính xác.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Đã kích hoạt lại thuê bao { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Cảm ơn bạn đã kích hoạt lại thuê bao { $productName } của bạn!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Chu kỳ lập hóa đơn và thanh toán của bạn sẽ vẫn như cũ. Khoản phí tiếp theo của bạn sẽ là { $invoiceTotal } vào { $nextInvoiceDateOnly }. Thuê bao của bạn sẽ tự động gia hạn mỗi kỳ thanh toán trừ khi bạn chọn hủy.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Thông báo gia hạn tự động của { $productName }
subscriptionRenewalReminder-title = Thuê bao của bạn sẽ sớm được gia hạn
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Kính gửi khách hàng { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Thuê bao hiện tại của bạn được đặt thành tự động gia hạn sau { $reminderLength } ngày. Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn thuê bao { $planIntervalCount } { $planInterval } của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng cho phương thức thanh toán trên tài khoản của bạn.
subscriptionRenewalReminder-content-closing = Trân trọng,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Nhóm { $productName }
subscriptionReplaced-subject = Gói đăng ký của bạn đã được cập nhật theo gói nâng cấp của bạn
subscriptionReplaced-title = Gói đăng ký của bạn đã được cập nhật
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Gói đăng ký cá nhân { $productName } của bạn đã được thay thế và hiện được bao gồm trong gói mới của bạn.
subscriptionReplaced-content-credit = Bạn sẽ nhận được khoản tín dụng cho bất kỳ thời gian chưa sử dụng nào từ gói đăng ký trước đó của bạn. Khoản tín dụng này sẽ tự động được áp dụng vào tài khoản của bạn và được sử dụng cho các khoản phí trong tương lai.
subscriptionReplaced-content-no-action = Bạn không cần phải thực hiện bất kỳ hành động nào.
subscriptionsPaymentExpired-subject-2 = Phương thức thanh toán cho gói đăng ký của bạn đã hết hạn hoặc sắp hết hạn
subscriptionsPaymentExpired-title-2 = Phương thức thanh toán của bạn đã hết hạn hoặc sắp hết hạn
subscriptionsPaymentExpired-content-2 = Phương thức thanh toán bạn đang sử dụng để thanh toán cho các gói đăng ký sau đã hết hạn hoặc sắp hết hạn.
subscriptionsPaymentProviderCancelled-subject = Cần cập nhật thông tin thanh toán cho các thuê bao { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Xin lỗi, chúng tôi đang gặp sự cố với phương thức thanh toán của bạn
subscriptionsPaymentProviderCancelled-content-detected = Chúng tôi đã phát hiện ra sự cố với phương thức thanh toán của bạn cho các thuê bao sau.
subscriptionsPaymentProviderCancelled-content-payment-1 = Có thể phương thức thanh toán của bạn đã hết hạn hoặc phương thức thanh toán hiện tại của bạn không chính xác.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Đã nhận thanh toán { $productName }
subscriptionSubsequentInvoice-title = Cảm ơn bạn đã là một thuê bao!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Chúng tôi đã nhận được khoản thanh toán mới nhất của bạn cho { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Hóa đơn tiếp theo của bạn sẽ được phát hành vào { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Bạn đã nâng cấp lên { $productName }
subscriptionUpgrade-title = Cảm ơn bạn đã nâng cấp!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Bạn đã nâng cấp thành công { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Bạn đã bị tính khoản phí một lần là { $invoiceAmountDue } để phản ánh mức giá cao hơn của gói đăng ký của bạn trong thời gian còn lại của kỳ thanh toán này ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Bạn đã nhận được khoản tín dụng tài khoản với số tiền là { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Bắt đầu từ hóa đơn tiếp theo, giá của gói đăng ký của bạn sẽ thay đổi.
subscriptionUpgrade-content-old-price-day = Mức giá trước đó là { $paymentAmountOld } mỗi ngày.
subscriptionUpgrade-content-old-price-week = Mức giá trước đó là { $paymentAmountOld } mỗi tuần.
subscriptionUpgrade-content-old-price-month = Mức giá trước đó là { $paymentAmountOld } mỗi tháng.
subscriptionUpgrade-content-old-price-halfyear = Mức giá trước đó là { $paymentAmountOld } mỗi sáu tháng.
subscriptionUpgrade-content-old-price-year = Mức giá trước đó là { $paymentAmountOld } mỗi năm.
subscriptionUpgrade-content-old-price-default = Mức giá trước đó là { $paymentAmountOld } cho mỗi kỳ thanh toán.
subscriptionUpgrade-content-old-price-day-tax = Mức giá trước đó là { $paymentAmountOld } + { $paymentTaxOld } thuế mỗi ngày.
subscriptionUpgrade-content-old-price-week-tax = Mức giá trước đó là { $paymentAmountOld } + { $paymentTaxOld } thuế mỗi tuần.
subscriptionUpgrade-content-old-price-month-tax = Mức giá trước đó là { $paymentAmountOld } + { $paymentTaxOld } thuế mỗi tháng.
subscriptionUpgrade-content-old-price-halfyear-tax = Mức giá trước đó là { $paymentAmountOld } + { $paymentTaxOld } thuế mỗi sáu tháng.
subscriptionUpgrade-content-old-price-year-tax = Mức giá trước đó là { $paymentAmountOld } + { $paymentTaxOld } thuế mỗi năm.
subscriptionUpgrade-content-old-price-default-tax = Mức giá trước đó là { $paymentAmountOld } + { $paymentTaxOld } thuế cho mỗi kỳ thanh toán.
subscriptionUpgrade-content-new-price-day = Từ giờ trở đi, bạn sẽ bị tính phí { $paymentAmountNew } mỗi ngày, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-week = Từ giờ trở đi, bạn sẽ bị tính phí { $paymentAmountNew } mỗi tuần, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-month = Từ giờ trở đi, bạn sẽ bị tính phí { $paymentAmountNew } mỗi tháng, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-halfyear = Từ giờ trở đi, bạn sẽ bị tính phí { $paymentAmountNew } mỗi sáu tháng, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-year = Từ giờ trở đi, bạn sẽ bị tính phí { $paymentAmountNew } mỗi năm, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-default = Từ giờ trở đi, bạn sẽ bị tính phí { $paymentAmountNew } cho mỗi kỳ thanh toán, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-day-dtax = Từ giờ trở đi, bạn sẽ phải trả { $paymentAmountNew } + { $paymentTaxNew } thuế mỗi ngày, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-week-tax = Từ giờ trở đi, bạn sẽ phải trả { $paymentAmountNew } + { $paymentTaxNew } thuế mỗi tuần, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-month-tax = Từ giờ trở đi, bạn sẽ phải trả { $paymentAmountNew } + { $paymentTaxNew } thuế mỗi tháng, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-halfyear-tax = Từ giờ trở đi, bạn sẽ phải trả { $paymentAmountNew } + { $paymentTaxNew } thuế mỗi sáu tháng, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-year-tax = Từ giờ trở đi, bạn sẽ phải trả { $paymentAmountNew } + { $paymentTaxNew } thuế mỗi năm, không bao gồm chiết khấu.
subscriptionUpgrade-content-new-price-default-tax = Từ giờ trở đi, bạn sẽ phải trả { $paymentAmountNew } + { $paymentTaxNew } thuế cho mỗi kỳ thanh toán, không bao gồm chiết khấu.
subscriptionUpgrade-existing = Nếu bất kỳ gói đăng ký hiện tại nào của bạn trùng với bản nâng cấp này, chúng tôi sẽ xử lý chúng và gửi cho bạn một email riêng có thông tin chi tiết. Nếu gói mới của bạn bao gồm các sản phẩm yêu cầu cài đặt, chúng tôi sẽ gửi cho bạn một email riêng có hướng dẫn thiết lập.
subscriptionUpgrade-auto-renew = Thuê bao của bạn sẽ tự động gia hạn mỗi kỳ thanh toán trừ khi bạn chọn hủy.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Sử dụng { $unblockCode } để đăng nhập
unblockCode-preview = Mã này hết hạn sau một giờ
unblockCode-title = Đây có phải là bạn đăng nhập không?
unblockCode-prompt = Nếu đúng, dưới đây là mã xác minh bạn cần:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Nếu đúng, đây là mã xác minh bạn cần: { $unblockCode }
unblockCode-report = Nếu không, hãy giúp chúng tôi chống lại những kẻ xâm nhập và <a data-l10n-name="reportSignInLink">báo cáo cho chúng tôi</a>.
unblockCode-report-plaintext = Nếu không, hãy giúp chúng tôi chống lại những kẻ xâm nhập và báo cáo cho chúng tôi.
verificationReminderFinal-subject = Lời nhắc cuối cùng để xác minh tài khoản của bạn
verificationReminderFinal-description-2 = Một vài tuần trước, bạn đã tạo { -product-mozilla-account } nhưng chưa bao giờ xác nhận nó. Để bảo mật cho bạn, chúng tôi sẽ xóa tài khoản nếu không được xác minh trong 24 giờ tới.
confirm-account = Xác minh tài khoản
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Hãy nhớ xác minh tài khoản của bạn
verificationReminderFirst-title-3 = Chào mừng đến với { -brand-mozilla }!
verificationReminderFirst-description-3 = Một vài ngày trước, bạn đã tạo { -product-mozilla-account } nhưng chưa bao giờ xác nhận nó. Vui lòng xác nhận tài khoản của bạn trong 15 ngày tới, nếu không tài khoản sẽ tự động bị xóa.
verificationReminderFirst-sub-description-3 = Đừng bỏ lỡ trình duyệt đặt bạn và quyền riêng tư của bạn lên hàng đầu.
confirm-email-2 = Xác minh tài khoản
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Xác minh tài khoản
verificationReminderSecond-subject-2 = Hãy nhớ xác minh tài khoản của bạn
verificationReminderSecond-title-3 = Đừng bỏ lỡ { -brand-mozilla }!
verificationReminderSecond-description-4 = Một vài ngày trước, bạn đã tạo { -product-mozilla-account } nhưng chưa bao giờ xác nhận nó. Vui lòng xác nhận tài khoản của bạn trong 10 ngày tới, nếu không nó sẽ tự động bị xóa.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } của bạn cho phép bạn đồng bộ hóa trải nghiệm { -brand-firefox } của bạn trên nhiều thiết bị và mở khóa quyền truy cập vào nhiều sản phẩm bảo vệ quyền riêng tư hơn từ { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Hãy là một phần trong sứ mệnh của chúng tôi là biến Internet thành một nơi mở cửa cho tất cả mọi người.
verificationReminderSecond-action-2 = Xác minh tài khoản
verify-title-3 = Mở ra thế giới internet với { -brand-mozilla }
verify-description-2 = Xác nhận tài khoản của bạn và tận dụng tối đa { -brand-mozilla } ở mọi nơi bạn đăng nhập, bắt đầu bằng:
verify-subject = Hoàn tất việc tạo tài khoản của bạn
verify-action-2 = Xác minh tài khoản
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Sử dụng { $code } để thay đổi tài khoản của bạn
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview = Mã này sẽ hết hạn sau { $expirationTime } phút.
verifyAccountChange-title = Bạn có đang thay đổi thông tin tài khoản của mình không?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Hãy giúp chúng tôi giữ an toàn cho tài khoản của bạn bằng cách chấp thuận thay đổi này trên:
verifyAccountChange-prompt = Nếu đúng, đây là mã xác minh của bạn:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice = Nó sẽ hết hạn sau { $expirationTime } phút.
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Bạn đã đăng nhập vào { $clientName } chưa?
verifyLogin-description-2 = Giúp chúng tôi giữ an toàn cho tài khoản của bạn bằng cách xác nhận rằng bạn đã đăng nhập vào:
verifyLogin-subject-2 = Xác nhận đăng nhập
verifyLogin-action = Xác nhận lần đăng nhập này
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Sử dụng { $code } để đăng nhập
verifyLoginCode-preview = Mã này sẽ hết hạn sau 5 phút.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Bạn đã đăng nhập vào { $serviceName } chưa?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Giúp chúng tôi giữ an toàn cho tài khoản của bạn bằng cách chấp thuận đăng nhập của bạn trên:
verifyLoginCode-prompt-3 = Nếu đúng, đây là mã xác minh của bạn:
verifyLoginCode-expiry-notice = Nó hết hạn sau 5 phút.
verifyPrimary-title-2 = Xác minh email chính
verifyPrimary-description = Yêu cầu thực hiện thay đổi tài khoản đã được thực hiện từ thiết bị sau:
verifyPrimary-subject = Xác nhận email chính
verifyPrimary-action-2 = Xác minh email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Sau khi được xác minh, các thay đổi tài khoản như thêm email phụ sẽ có thể thực hiện được từ thiết bị này.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Sử dụng { $code } để xác nhận email phụ của bạn
verifySecondaryCode-preview = Mã này sẽ hết hạn sau 5 phút.
verifySecondaryCode-title-2 = Xác minh email phụ
verifySecondaryCode-action-2 = Xác minh email
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Yêu cầu sử dụng { $email } làm địa chỉ email phụ đã được gửi từ { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Sử dụng mã xác minh này:
verifySecondaryCode-expiry-notice-2 = Nó hết hạn sau 5 phút. Sau khi được xác minh, địa chỉ này sẽ bắt đầu nhận được thông báo bảo mật và xác nhận.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Sử dụng { $code } để xác nhận tài khoản của bạn
verifyShortCode-preview-2 = Mã này sẽ hết hạn sau 5 phút
verifyShortCode-title-3 = Mở ra thế giới internet với { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Xác nhận tài khoản của bạn và tận dụng tối đa { -brand-mozilla } ở mọi nơi bạn đăng nhập, bắt đầu bằng:
verifyShortCode-prompt-3 = Sử dụng mã xác minh này:
verifyShortCode-expiry-notice = Nó hết hạn sau 5 phút.
