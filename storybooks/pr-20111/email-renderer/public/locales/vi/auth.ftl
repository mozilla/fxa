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
cancellationSurvey = Vui lòng giúp chúng tôi cải thiện dịch vụ của mình bằng cách thực hiện <a data-l10n-name="cancellationSurveyUrl">khảo sát ngắn</a> này.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Vui lòng giúp chúng tôi cải thiện dịch vụ của mình bằng cách thực hiện khảo sát ngắn này:
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
view-invoice-link-action = Xem hoá đơn
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Xem hóa đơn: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Thuê bao { $productName } của bạn đã bị hủy
subscriptionAccountDeletion-title = Rất tiếc vì bạn chuẩn bị ra đi
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Gần đây bạn đã xóa { -product-mozilla-account } của mình. Do đó, chúng tôi đã hủy đăng ký { $productName } của bạn. Khoản thanh toán cuối cùng của bạn là { $invoiceTotal } đã được thanh toán vào { $invoiceDateOnly }.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Gói đăng ký { $productName } của bạn sắp hết hạn
subscriptionEndingReminder-title = Gói đăng ký { $productName } của bạn sắp hết hạn
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Quyền truy cập của bạn vào { $productName } sẽ kết thúc vào <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Nếu bạn muốn tiếp tục sử dụng { $productName }, bạn có thể kích hoạt lại gói đăng ký của mình tại <a data-l10n-name="subscriptionEndingReminder-account-settings">cài đặt tài khoản</a> trước <strong>{ $serviceLastActiveDateOnly }</strong>. Nếu bạn cần hỗ trợ, <a data-l10n-name="subscriptionEndingReminder-contact-support">hãy liên hệ với nhóm hỗ trợ của chúng tôi</a>.
subscriptionEndingReminder-content-line1-plaintext = Quyền truy cập của bạn vào { $productName } sẽ kết thúc vào { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Nếu bạn muốn tiếp tục sử dụng { $productName }, bạn có thể kích hoạt lại gói đăng ký của mình trong Cài đặt tài khoản trước { $serviceLastActiveDateOnly }. Nếu cần hỗ trợ, vui lòng liên hệ với Nhóm hỗ trợ của chúng tôi.
subscriptionEndingReminder-content-closing = Cảm ơn bạn đã là một người đăng ký quý giá!
subscriptionEndingReminder-churn-title = Bạn muốn tiếp tục truy cập chứ?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Áp dụng các điều khoản và hạn chế nhất định</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Áp dụng các điều khoản và hạn chế nhất định: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Liên hệ với nhóm hỗ trợ của chúng tôi: { $subscriptionSupportUrlWithUtm }
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
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Gói đăng ký hiện tại của bạn sẽ tự động gia hạn sau { $reminderLength } ngày.
subscriptionRenewalReminder-content-discount-change = Hóa đơn tiếp theo của bạn sẽ phản ánh sự thay đổi về giá, vì chương trình giảm giá trước đó đã kết thúc và chương trình giảm giá mới đã được áp dụng.
subscriptionRenewalReminder-content-discount-ending = Do chương trình giảm giá trước đó đã kết thúc, gói đăng ký của bạn sẽ được gia hạn với giá tiêu chuẩn.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng ngày của bạn và khoản phí { $invoiceTotalExcludingTax } + { $invoiceTax } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-with-tax-week = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng tuần của bạn và khoản phí { $invoiceTotalExcludingTax } + { $invoiceTax } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-with-tax-month = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng tháng của bạn và khoản phí { $invoiceTotalExcludingTax } + { $invoiceTax } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký mỗi sáu tháng của bạn và khoản phí { $invoiceTotalExcludingTax } + { $invoiceTax } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-with-tax-year = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng năm của bạn và khoản phí { $invoiceTotalExcludingTax } + { $invoiceTax } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-with-tax-default = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký của bạn và khoản phí { $invoiceTotalExcludingTax } + { $invoiceTax } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng ngày của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-invoice-total-week = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng tuần của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-invoice-total-month = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng tháng của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký mỗi sáu tháng của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-invoice-total-year = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký hàng năm của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
subscriptionRenewalReminder-content-charge-invoice-total-default = Vào thời điểm đó, { -brand-mozilla } sẽ gia hạn gói đăng ký của bạn và khoản phí { $invoiceTotal } sẽ được áp dụng vào phương thức thanh toán trong tài khoản của bạn.
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
subscriptionsPaymentExpired-subject-2 = Phương thức thanh toán cho gói đăng ký của bạn đã hết hạn hoặc sắp hết hạn
subscriptionsPaymentExpired-title-2 = Phương thức thanh toán của bạn đã hết hạn hoặc sắp hết hạn
subscriptionsPaymentExpired-content-2 = Phương thức thanh toán bạn đang sử dụng để thanh toán cho các gói đăng ký sau đã hết hạn hoặc sắp hết hạn.
subscriptionsPaymentProviderCancelled-subject = Cần cập nhật thông tin thanh toán cho các thuê bao { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Xin lỗi, chúng tôi đang gặp sự cố với phương thức thanh toán của bạn
subscriptionsPaymentProviderCancelled-content-detected = Chúng tôi đã phát hiện ra sự cố với phương thức thanh toán của bạn cho các thuê bao sau.
subscriptionsPaymentProviderCancelled-content-payment-1 = Có thể phương thức thanh toán của bạn đã hết hạn hoặc phương thức thanh toán hiện tại của bạn không chính xác.
