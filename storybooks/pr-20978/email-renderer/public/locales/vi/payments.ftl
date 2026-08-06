# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Trang chủ tài khoản
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Đã áp dụng mã khuyến mãi
coupon-submit = Áp dụng
coupon-remove = Xóa
coupon-error = Mã bạn nhập không hợp lệ hoặc đã hết hạn.
coupon-error-generic = Đã xảy ra lỗi khi xử lý mã. Vui lòng thử lại.
coupon-error-expired = Mã bạn đã nhập đã hết hạn.
coupon-error-limit-reached = Mã bạn đã nhập đã đạt đến giới hạn.
coupon-error-invalid = Mã bạn đã nhập không hợp lệ.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Nhập mã

## Component - Fields

default-input-error = Trường này là bắt buộc
input-error-is-required = { $label } là bắt buộc

## Component - Header

brand-name-mozilla-logo = Biểu tượng { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Đã có { -product-mozilla-account }? <a>Đăng nhập</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Nhập email của bạn
new-user-confirm-email =
    .label = Xác nhận email của bạn
new-user-subscribe-product-updates-mozilla = Tôi muốn nhận tin tức sản phẩm và cập nhật từ { -brand-mozilla }
new-user-subscribe-product-updates-snp = Tôi muốn nhận tin tức và cập nhật về bảo mật và quyền riêng tư từ { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Tôi muốn nhận tin tức sản phẩm và cập nhật từ { -product-mozilla-hubs } và { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Tôi muốn nhận tin tức sản phẩm và cập nhật từ { -product-mdn-plus } và { -brand-mozilla }
new-user-subscribe-product-assurance = Chúng tôi chỉ sử dụng email của bạn để tạo tài khoản cho bạn. Chúng tôi sẽ không bao giờ cung cấp nó cho bên thứ ba.
new-user-email-validate = Email không hợp lệ
new-user-email-validate-confirm = Email không khớp
new-user-already-has-account-sign-in = Nếu bạn đã có tài khoản, hãy <a>đăng nhập</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Bạn đã nhập nhầm email phải không? { $domain } không cung cấp email.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Cảm ơn bạn!
payment-confirmation-thanks-heading-account-exists = Cảm ơn, bây giờ hãy kiểm tra email của bạn!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Một email xác nhận đã được gửi đến { $email } với các chi tiết về cách bắt đầu với { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Bạn sẽ nhận được một email tại { $email } với các hướng dẫn để thiết lập tài khoản, cũng như các chi tiết thanh toán của bạn.
payment-confirmation-order-heading = Chi tiết đơn hàng
payment-confirmation-invoice-number = Hóa đơn #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Thông tin thanh toán
payment-confirmation-amount = { $amount } mỗi { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } ngày
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } tuần
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } tháng
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } năm
    }
payment-confirmation-download-button = Tiếp tục tải xuống

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Tôi ủy quyền { -brand-mozilla } để tính phí phương thức thanh toán của tôi cho số tiền được hiển thị, theo <termsOfServiceLink>điều khoản sử dụng</termsOfServiceLink> và <privacyNoticeLink>thông báo về quyền riêng tư</privacyNoticeLink>, cho đến khi tôi hủy thuê bao.
payment-confirm-checkbox-error = Bạn cần hoàn thành việc này trước khi tiếp tục

## Component - PaymentErrorView

payment-error-retry-button = Thử lại
payment-error-manage-subscription-button = Quản lý thuê bao của tôi

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Bạn đã có thuê bao { $productName } qua cửa hàng ứng dụng { -brand-google } hoặc { -brand-apple }.
iap-upgrade-no-bundle-support = Chúng tôi không hỗ trợ nâng cấp cho các thuê bao này, nhưng chúng tôi sẽ sớm thực hiện.
iap-upgrade-contact-support = Bạn vẫn có thể nhận được sản phẩm này — vui lòng liên hệ với bộ phận hỗ trợ để chúng tôi có thể giúp bạn.
iap-upgrade-get-help-button = Nhận trợ giúp

## Component - PaymentForm

payment-name =
    .placeholder = Họ và tên
    .label = Tên ghi trên thẻ của bạn
payment-cc =
    .label = Thẻ của bạn
payment-cancel-btn = Hủy bỏ
payment-update-btn = Cập nhật
payment-pay-btn = Thanh toán ngay
payment-pay-with-paypal-btn-2 = Thanh toán bằng { -brand-paypal }
payment-validate-name-error = Vui lòng nhập tên của bạn

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } sử dụng { -brand-name-stripe } và { -brand-paypal } để xử lý thanh toán an toàn.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Chính sách riêng tư của { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Chính sách riêng tư của { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } sử dụng { -brand-paypal } để xử lý thanh toán an toàn.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Chính sách riêng tư của { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } sử dụng { -brand-name-stripe } để xử lý thanh toán an toàn.
payment-legal-link-stripe-3 = <stripePrivacyLink>Chính sách riêng tư của { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Chọn phương thức thanh toán của bạn
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Trước tiên, bạn sẽ cần phê duyệt thuê bao của mình

## Component - PaymentProcessing

payment-processing-message = Vui lòng đợi trong khi chúng tôi xử lý thanh toán của bạn…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Thẻ kết thúc bằng { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Thanh toán bằng { -brand-paypal }

## Component - PlanDetails

plan-details-header = Thông tin chi tiết sản phẩm
plan-details-list-price = Bảng giá
plan-details-show-button = Hiện chi tiết
plan-details-hide-button = Ẩn chi tiết
plan-details-total-label = Tổng
plan-details-tax = Thuế và phí

## Component - PlanErrorDialog

product-no-such-plan = Không có lịch như vậy cho sản phẩm này.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + thuế { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
       *[other] { $priceAmount } mỗi { $intervalCount } ngày
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } mỗi { $intervalCount } ngày
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
       *[other] { $priceAmount } mỗi { $intervalCount } tuần
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } mỗi { $intervalCount } tuần
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
       *[other] { $priceAmount } mỗi { $intervalCount } tháng
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } mỗi { $intervalCount } tháng
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
       *[other] { $priceAmount } mỗi { $intervalCount } năm
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } mỗi { $intervalCount } năm
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
       *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } ngày
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } ngày
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
       *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } tuần
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } tuần
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
       *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } tháng
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } tháng
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
       *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } năm
    }
    .title =
        { $intervalCount ->
           *[other] { $priceAmount } + thuế { $taxAmount } mỗi { $intervalCount } năm
        }

## Component - SubscriptionTitle

subscription-create-title = Thiết lập thuê bao của bạn
subscription-success-title = Xác nhận thuê bao
subscription-processing-title = Đang xác nhận thuê bao…
subscription-error-title = Lỗi khi xác nhận thuê bao…
subscription-noplanchange-title = Thay đổi gói thuê bao này không được hỗ trợ
subscription-iapsubscribed-title = Đã đăng ký
sub-guarantee = Đảm bảo hoàn tiền trong 30 ngày

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Điều khoản dịch vụ
privacy = Chính sách riêng tư
terms-download = Tải xuống các điều khoản

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Tài khoản Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Đóng phương thức
settings-subscriptions-title = Thuê bao
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Mã khuyến mãi

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } ngày
    }
    .title =
        { $intervalCount ->
           *[other] { $amount } mỗi { $intervalCount } ngày
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } tuần
    }
    .title =
        { $intervalCount ->
           *[other] { $amount } mỗi { $intervalCount } tuần
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } tháng
    }
    .title =
        { $intervalCount ->
           *[other] { $amount } mỗi { $intervalCount } tháng
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
       *[other] { $amount } mỗi { $intervalCount } năm
    }
    .title =
        { $intervalCount ->
           *[other] { $amount } mỗi { $intervalCount } năm
        }

## Error messages

# App error dialog
general-error-heading = Lỗi ứng dụng chung
basic-error-message = Có gì đó không ổn. Vui lòng thử lại sau.
payment-error-1 = Hmm. Đã xảy ra sự cố khi cho phép thanh toán của bạn. Hãy thử lại hoặc liên lạc với công ty phát hành thẻ của bạn.
payment-error-2 = Hmm. Đã xảy ra sự cố khi cho phép thanh toán của bạn. Hãy liên lạc với công ty phát hành thẻ của bạn.
payment-error-3b = Đã xảy ra lỗi không mong muốn khi xử lý thanh toán của bạn, vui lòng thử lại.
expired-card-error = Có vẻ như thẻ tín dụng của bạn đã hết hạn. Hãy thử một thẻ khác.
insufficient-funds-error = Có vẻ như thẻ của bạn không đủ tiền. Hãy thử một thẻ khác.
withdrawal-count-limit-exceeded-error = Có vẻ như đã vượt quá giới hạn tín dụng của bạn. Hãy thử một thẻ khác.
charge-exceeds-source-limit = Có vẻ đã vượt quá giới hạn tín dụng hàng ngày của bạn. Hãy thử một thẻ khác hoặc trong 24 giờ.
instant-payouts-unsupported = Có vẻ như thẻ ghi nợ của bạn không được thiết lập để thanh toán ngay lập tức. Hãy thử một thẻ ghi nợ hoặc thẻ tín dụng khác.
duplicate-transaction = Hừm. Có vẻ như một giao dịch giống hệt nhau vừa được gửi. Hãy kiểm tra lịch sử thanh toán của bạn.
coupon-expired = Có vẻ như mã khuyến mãi đã hết hạn.
card-error = Không thể xử lý giao dịch của bạn. Vui lòng xác minh thông tin thẻ tín dụng của bạn và thử lại.
country-currency-mismatch = Đơn vị tiền tệ của thuê bao này không hợp lệ cho quốc gia được liên kết với khoản thanh toán của bạn.
currency-currency-mismatch = Xin lỗi. Bạn không thể chuyển đổi giữa các loại tiền tệ.
location-unsupported = Địa điểm hiện tại của bạn không được hỗ trợ theo điều khoản dịch vụ của chúng tôi.
no-subscription-change = Rất tiếc. Bạn không thể thay đổi gói thuê bao của mình.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Bạn đã đăng ký qua { $mobileAppStore }
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Lỗi hệ thống khiến quá trình đăng ký { $productName } của bạn không thành công. Phương thức thanh toán của bạn chưa bị tính phí. Vui lòng thử lại.
fxa-post-passwordless-sub-error = Thuê bao đã được xác nhận, nhưng trang xác nhận không tải được. Vui lòng kiểm tra email của bạn để thiết lập tài khoản của bạn.
newsletter-signup-error = Bạn chưa đăng ký nhận email cập nhật sản phẩm. Bạn có thể thử lại trong cài đặt tài khoản của mình.
product-plan-error =
    .title = Sự cố khi tải lịch
product-profile-error =
    .title = Sự cố khi tải hồ sơ
product-customer-error =
    .title = Sự cố tải thông tin khách hàng
product-plan-not-found = Không tìm thấy lịch
product-location-unsupported-error = Địa điểm không được hỗ trợ

## Hooks - coupons

coupon-success = Gói của bạn sẽ tự động gia hạn theo giá niêm yết.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Gói của bạn sẽ tự động gia hạn sau { $couponDurationDate } theo giá niêm yết.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Tạo { -product-mozilla-account }
new-user-card-title = Nhập thông tin thẻ của bạn
new-user-submit = Theo dõi ngay

## Routes - Product and Subscriptions

sub-update-payment-title = Thông tin thanh toán

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Thanh toán bằng thẻ
product-invoice-preview-error-title = Sự cố khi tải bản xem trước hóa đơn
product-invoice-preview-error-text = Không thể tải bản xem trước hóa đơn

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Chúng tôi chưa thể nâng cấp cho bạn

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Cửa hàng { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Xem lại thay đổi của bạn
sub-change-failed = Thay đổi gói không thành công
sub-update-acknowledgment =
    Gói của bạn sẽ thay đổi ngay lập tức và bạn sẽ bị tính phí theo tỷ lệ
    ngày hôm nay cho phần còn lại của chu kỳ thanh toán này. Bắt đầu
    vào { $startingDate } bạn sẽ bị tính toàn bộ số tiền này.
sub-change-submit = Xác nhận thay đổi
sub-update-current-plan-label = Lịch hiện tại
sub-update-new-plan-label = Lịch mới
sub-update-total-label = Tổng số mới
sub-update-prorated-upgrade = Nâng cấp theo tỷ lệ

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (Hàng ngày)
sub-update-new-plan-weekly = { $productName } (Hàng tuần)
sub-update-new-plan-monthly = { $productName } (Hàng tháng)
sub-update-new-plan-yearly = { $productName } (Hàng năm)
sub-update-prorated-upgrade-credit = Số dư âm được hiển thị sẽ được coi là khoản tiền được ghi vào tài khoản của bạn và sẽ được dùng để thanh toán các hóa đơn sau này.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Hủy đăng ký
sub-item-stay-sub = Vẫn đăng ký

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Bạn sẽ không còn có thể sử dụng { $name } sau
    { $period }, ngày cuối cùng của chu kỳ thanh toán của bạn.
sub-item-cancel-confirm =
    Hủy quyền truy cập của tôi và thông tin đã lưu của tôi trong
    { $name } vào { $period }
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = Phiếu giảm giá { $promotion_name } đã được áp dụng: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Khoản thanh toán gói đăng ký này đã được ghi vào số dư tài khoản của bạn: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Không thể kích hoạt lại thuê bao
sub-route-idx-cancel-failed = Không thể hủy kích hoạt thuê bao
sub-route-idx-contact = Liên hệ hỗ trợ
sub-route-idx-cancel-msg-title = Chúng tôi rất tiếc khi bạn rời đi
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Thuê bao { $name } của bạn đã bị hủy.
          <br />
          Bạn vẫn sẽ có quyền truy cập vào { $name } cho đến { $date }.
sub-route-idx-cancel-aside-2 = Có một vài câu hỏi? Truy cập <a>Hỗ trợ { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Sự cố tải thông tin khách hàng
sub-invoice-error =
    .title = Sự cố khi tải hóa đơn
sub-billing-update-success = Thông tin thanh toán của bạn đã được cập nhật thành công
sub-invoice-previews-error-title = Sự cố khi tải bản xem trước hóa đơn
sub-invoice-previews-error-text = Không thể tải bản xem trước hóa đơn

## Routes - Subscription - ActionButton

pay-update-change-btn = Thay đổi
pay-update-manage-btn = Quản lý

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Thanh toán tiếp theo vào { $date }
sub-next-bill-due-date = Hoá đơn tiếp theo vào { $date }
sub-expires-on = Hết hạn vào { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Hết hạn vào { $expirationDate }
sub-route-idx-updating = Đang cập nhật thông tin thanh toán…
sub-route-payment-modal-heading = Thông tin thanh toán không hợp lệ
sub-route-payment-modal-message-2 = Có vẻ như đã xảy ra lỗi với tài khoản { -brand-paypal } của bạn, chúng tôi cần bạn thực hiện các bước cần thiết để giải quyết vấn đề thanh toán này.
sub-route-missing-billing-agreement-payment-alert = Thông tin thanh toán không hợp lệ; có lỗi với tài khoản của bạn. <div>Quản lý</div>
sub-route-funding-source-payment-alert = Thông tin thanh toán không hợp lệ; Có lỗi xảy ra với tài khoản của bạn. Cảnh báo này có thể mất một thời gian để xóa sau khi bạn cập nhật thành công thông tin của mình. <div>Quản lý</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Không có lịch như vậy cho đăng ký này.
invoice-not-found = Không tìm thấy hóa đơn tiếp theo
sub-item-no-such-subsequent-invoice = Không tìm thấy hóa đơn tiếp theo cho thuê bao này.
sub-invoice-preview-error-title = Không tìm thấy bản xem trước hóa đơn
sub-invoice-preview-error-text = Không tìm thấy bản xem trước hóa đơn cho thuê bao này

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Bạn muốn tiếp tục sử dụng { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Quyền truy cập của bạn vào { $name } sẽ tiếp tục và chu kỳ
    thanh toán của bạn sẽ giữ nguyên. Khoản phí tiếp theo của bạn
    sẽ là { $amount } cho thẻ kết thúc bằng { $last } vào { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Quyền truy cập của bạn vào { $name } sẽ tiếp tục và chu kỳ
    thanh toán của bạn sẽ giữ nguyên. Khoản phí tiếp theo của bạn
    sẽ là { $amount } vào { $endDate }.
reactivate-confirm-button = Đăng ký lại

## $date (Date) - Last day of product access

reactivate-panel-copy = Bạn sẽ mất quyền truy cập vào { $name } vào <strong>{ $date }</strong>.
reactivate-success-copy = Cảm ơn! Bạn đã sẵn sàng.
reactivate-success-button = Đóng

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Mua hàng trong ứng dụng
sub-iap-item-apple-purchase-2 = { -brand-apple }: Mua hàng trong ứng dụng
sub-iap-item-manage-button = Quản lý
