## Page

checkout-signin-or-create = 1. { -product-mozilla-account }를 생성하거나 로그인하세요
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = 또는
continue-signin-with-google-button = { -brand-google }로 계속하기
continue-signin-with-apple-button = { -brand-apple }로 계속하기
next-payment-method-header = 지불 방법 선택
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = 먼저 구독을 승인해야 합니다.
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = { $productName }에 대한 결제를 계속하려면 <p>국가와 우편 번호를 입력하세요.</p>
location-banner-info = 사용자 위치를 자동으로 감지할 수 없습니다.
location-required-disclaimer = 이 정보는 세금과 통화 계산에만 사용됩니다.
location-banner-currency-change = 통화 변경은 지원되지 않습니다. 계속하려면, 현재 청구 통화와 일치하는 국가를 선택하세요.

## Page - Upgrade page

upgrade-page-payment-information = 결제 정보
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = 요금제가 즉시 변경되며, 결제 주기의 나머지 기간 동안 비례 분배된 금액만큼 사용할 수 있습니다. { $nextInvoiceDate }일부터 전체 금액이 청구됩니다.

## Authentication Error page

auth-error-page-title = 로그인할 수 없습니다.
checkout-error-boundary-retry-button = 다시 시도
checkout-error-boundary-basic-error-message = 무언가 잘못되었습니다. 다시 시도하시거나 <contactSupportLink>지원 팀에 문의</contactSupportLink>하세요.
amex-logo-alt-text = { -brand-amex } 로고
diners-logo-alt-text = { -brand-diner } 로고
discover-logo-alt-text = { -brand-discover } 로고
jcb-logo-alt-text = { -brand-jcb } 로고
mastercard-logo-alt-text = { -brand-mastercard } 로고
paypal-logo-alt-text = { -brand-paypal } 로고
unionpay-logo-alt-text = { -brand-unionpay } 로고
visa-logo-alt-text = { -brand-visa } 로고
# Alt text for generic payment card logo
unbranded-logo-alt-text = 로고 없음
link-logo-alt-text = { -brand-link } 로고
apple-pay-logo-alt-text = { -brand-apple-pay } 로고
google-pay-logo-alt-text = { -brand-google-pay } 로고

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = 내 구독 관리
next-iap-blocked-contact-support = 이 제품과 충돌하는 모바일 앱 내부 구독이 있습니다 — 지원팀에 문의하시면 도와드리겠습니다.
next-payment-error-retry-button = 다시 시도하세요
next-basic-error-message = 문제가 발생했습니다. 나중에 다시 시도하세요.
checkout-error-contact-support-button = 연락하기
checkout-error-not-eligible = 이 제품을 구독할 권한이 없습니다. 지원 팀에 문의하시면 도와드리겠습니다.
checkout-error-already-subscribed = 이미 이 제품을 구독하고 있습니다.
checkout-error-contact-support = 도움을 드릴 수 있도록 지원팀에 문의하세요.
cart-error-currency-not-determined = 구매에 사용한 통화를 확인할 수 없습니다. 다시 시도하세요.
checkout-processing-general-error = 결제를 처리하는 동안 예기치 못한 오류가 발생했습니다. 다시 시도하세요.
cart-total-mismatch-error = 송장 금액이 변경되었습니다. 다시 시도하세요.

## Error pages - Payment method failure messages

intent-card-error = 거래를 처리할 수 없습니다. 신용 카드 정보를 확인한 후 다시 시도하세요.
intent-expired-card-error = 신용 카드 유효 기간이 만료된 것 같습니다. 다른 카드를 사용해보세요.
intent-payment-error-try-again = 결제를 승인하는 동안 문제가 발생했습니다. 다시 시도하거나 카드사에 연락하세요.
intent-payment-error-get-in-touch = 결제를 승인하는 동안 문제가 발생했습니다. 카드사에 연락하세요.
intent-payment-error-generic = 결제를 처리하는 동안 예기치 않은 오류가 발생했습니다. 다시 시도하십시오.
intent-payment-error-insufficient-funds = 카드 잔액이 부족한 것 같습니다. 다른 카드를 사용해보세요.
general-paypal-error = 결제를 처리하는 동안 예기치 않은 오류가 발생했습니다. 다시 시도하십시오.
paypal-active-subscription-no-billing-agreement-error = { -brand-paypal } 계정에서 결제에 문제가 발생한 것 같습니다. 구독에 대한 자동 결제를 다시 활성화하세요.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = 결제를 처리하는 동안 잠시 기다려 주세요…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = 감사합니다. 지금 메일을 확인해 보세요!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = { $email } 주소로 구독 안내와 결제 세부정보가 포함된 이메일을 받게 됩니다.
next-payment-confirmation-order-heading = 주문 정보
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = 영수증 # { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = 결제 정보

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = 다운로드 계속 하기

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = 끝자리가 { $last4 } 인 카드

## Page - Subscription Management

subscription-management-subscriptions-heading = 구독
subscription-management-button-add-payment-method-aria = 결제 수단 추가
subscription-management-button-add-payment-method = 추가
subscription-management-button-manage-payment-method-aria = 결제 방법 관리
subscription-management-button-manage-payment-method = 관리
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = 끝자리가 { $last4 } 인 카드
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = 만료 { $expirationDate }
subscription-management-button-support = 도움말
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = { $productName }에 대한 도움말 보기
subscription-management-your-apple-iap-subscriptions-aria = { -brand-apple } 앱 내부 구독
subscription-management-your-google-iap-subscriptions-aria = { -brand-google } 앱 내부 구독
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = { $productName } 구독 관리
paypal-payment-management-page-invalid-header = 유효하지 않은 결제 정보
paypal-payment-management-page-invalid-description = { -brand-paypal } 계정에 오류가 있는 것 같습니다. 이 결제 문제를 해결하기 위해 필요한 조치를 취해 주시기 바랍니다.
# Page - Not Found
page-not-found-title = 페이지를 찾을 수 없음
page-not-found-description = 요청하신 페이지를 찾을 수 없습니다. 알림을 받았으며 잘못된 모든 링크를 수정할 예정입니다.
page-not-found-back-button = 뒤로 가기

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = 계정 홈
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = 구독
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = { $page }로 가기

## CancelSubscription

subscription-cancellation-dialog-title = 가신다니 아쉽습니다.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = { $name } 구독이 취소되었습니다. { $date }까지 { $name }에 계속 접근할 수 있습니다.
subscription-cancellation-dialog-aside = 질문이 있으신가요? <LinkExternal>{ -brand-mozilla } 지원</LinkExternal> 을 방문하세요.

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = 결제 주기의 마지막 날인 { $currentPeriodEnd } 이후에는 더 이상 { $productName }를 사용할 수 없습니다.
subscription-content-cancel-access-message = { $currentPeriodEnd }에 { $productName } 안의 접근과 저장된 정보를 취소

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = <termsOfServiceLink>이용 약관</termsOfServiceLink> 및 <privacyNoticeLink>개인 정보 보호정책</privacyNoticeLink>에 따라, 구독을 취소하기 전까지 { -brand-mozilla }가 표시된 금액을 내 결제 수단에 청구하도록 허가합니다.
next-payment-confirm-checkbox-error = 계속 진행하기 전에 이 작업을 완료해야 합니다.

## Checkout Form

next-new-user-submit = 지금 구독하기
next-payment-validate-name-error = 이름을 입력하세요
next-pay-with-heading-paypal = { -brand-paypal }로 결제
# Label for the Full Name input
payment-name-label = 카드에 표시된 이름을 입력하세요
payment-name-placeholder = 이름

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = 코드 입력
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = 프로모션 코드
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = 프로모션 코드 적용됨
next-coupon-remove = 삭제
next-coupon-submit = 적용

# Component - Header

payments-header-help =
    .title = 도움말
    .aria-label = 도움말
    .alt = 도움말
payments-header-bento =
    .title = { -brand-mozilla } 제품
    .aria-label = { -brand-mozilla } 제품
    .alt = { -brand-mozilla } 로고
payments-header-bento-close =
    .alt = 닫기
payments-header-bento-tagline = 사용자의 개인 정보를 보호하는 더 많은 { -brand-mozilla }의 제품
payments-header-bento-firefox-desktop = 데스크톱 용 { -brand-firefox } 브라우저
payments-header-bento-firefox-mobile = 모바일 용 { -brand-firefox } 브라우저
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = { -brand-mozilla } 제작
payments-header-avatar =
    .title = { -product-mozilla-account } 메뉴
payments-header-avatar-icon =
    .alt = 계정 프로필 사진
payments-header-avatar-expanded-signed-in-as = 로그인 됨
payments-header-avatar-expanded-sign-out = 로그아웃
payments-client-loading-spinner =
    .aria-label = 읽는 중…
    .alt = 읽는 중…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = 기본 결제 방법으로 설정
# Save button for saving a new payment method
payment-method-management-save-method = 결제 방법 저장
manage-stripe-payments-title = 결제 방법 관리

## Payment Section

next-new-user-card-title = 카드 정보를 입력하세요.

## Component - PurchaseDetails

next-plan-details-header = 제품 세부 정보
next-plan-details-list-price = 정가
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = { $productName }의 가격을 비례 배분함
next-plan-details-tax = 세금 및 수수료
next-plan-details-total-label = 전체
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = 사용하지 않은 시간부터 크레딧
purchase-details-subtotal-label = 소계
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = 크레딧 적용됨
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = 총 결제 기한
next-plan-details-hide-button = 상세 내용 숨기기
next-plan-details-show-button = 상세 정보 보기
next-coupon-success = 요금제는 정가로 자동 갱신됩니다.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = 요금제는 { $couponDurationDate } 이후 정가로 자동 갱신됩니다.

## Select Tax Location

select-tax-location-title = 위치
select-tax-location-edit-button = 편집
select-tax-location-save-button = 저장
select-tax-location-continue-to-checkout-button = 결제 계속하기
select-tax-location-country-code-label = 국가
select-tax-location-country-code-placeholder = 국가 선택
select-tax-location-error-missing-country-code = 국가를 선택하세요
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName }는 현재 위치에서 구입할 수 없습니다.
select-tax-location-postal-code-label = 우편 번호
select-tax-location-postal-code =
    .placeholder = 우편번호 입력
select-tax-location-error-missing-postal-code = 우편 번호 입력
select-tax-location-error-invalid-postal-code = 올바른 우편번호 입력
select-tax-location-successfully-updated = 위치 정보가 업데이트되었습니다.
select-tax-location-error-location-not-updated = 위치 정보를 업데이트할 수 없습니다. 다시 시도하세요.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = 청구서는 { $currencyDisplayName }로 청구됩니다. { $currencyDisplayName }를 사용하는 국가를 선택하세요.
select-tax-location-invalid-currency-change-default = 활성 구독의 통화와 일치하는 국가를 선택하세요.
select-tax-location-new-tax-rate-info = 위치를 변경하면 다음 결제 주기부터 계정의 모든 활성 구독에 새로운 세율을 적용합니다.
signin-form-continue-button = 계속
signin-form-email-input = 이메일 입력
signin-form-email-input-missing = 이메일 입력
signin-form-email-input-invalid = 유효한 이메일 입력
next-new-user-subscribe-product-updates-mdnplus = { -product-mdn-plus } 및 { -brand-mozilla }에서 제품 소식 및 최신 정보를 받고 싶습니다.
next-new-user-subscribe-product-updates-mozilla = { -brand-mozilla }로부터 제품 뉴스와 최신정보를 받습니다.
next-new-user-subscribe-product-updates-snp = { -brand-mozilla }로부터 보안과 개인 정보에 대한 소식 및 최신 정보를 받습니다.
next-new-user-subscribe-product-assurance = 이메일은 오직 계정을 만드는 데만 사용됩니다. 절대 제3자에게 판매하지 않습니다.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = { $name } 사용을 계속 하시겠습니까?
subscription-content-button-resubscribe = 재구독
    .aria-label = { $productName } 재구독
resubscribe-success-dialog-title = 감사합니다! 모두 준비되었습니다.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-button-stay-subscribed = 구독 유지
    .aria-label = { $productName } 구독 유지
subscription-content-button-cancel-subscription = 구독 취소
    .aria-label = { $productName } 구독 취소

##

dialog-close = 대화상자 닫기
subscription-content-cancel-action-error = 알 수 없는 오류가 발생하였습니다. 다시 시도해 주세요.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = 매일 { $amount }
plan-price-interval-weekly = 매주 { $amount }
plan-price-interval-monthly = 매월 { $amount }
plan-price-interval-halfyearly = 6개월마다 { $amount }
plan-price-interval-yearly = 매년 { $amount }

## Component - SubscriptionTitle

next-subscription-create-title = 구독 설정
next-subscription-success-title = 구독 확인
next-subscription-processing-title = 구독 확인 중…
next-subscription-error-title = 구독 확인 오류…
subscription-title-sub-exists = 이미 구독 중입니다
subscription-title-plan-change-heading = 변경사항 검토
subscription-title-not-supported = 해당 구독 일정 변경이 지원되지 않습니다.
next-sub-guarantee = 30 일 환불 보장

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = 서비스 약관
next-privacy = 개인정보 보호정책
next-terms-download = 약관 다운로드
terms-and-privacy-stripe-label = { -brand-mozilla }는 안전한 결제 처리를 위해 { -brand-name-stripe }를 사용합니다.
terms-and-privacy-stripe-link = { -brand-name-stripe } 개인 정보 보호 정책
terms-and-privacy-paypal-label = { -brand-mozilla }는 안전한 결제 처리를 위해 { -brand-paypal }을 사용합니다.
terms-and-privacy-paypal-link = { -brand-paypal } 개인 정보 보호 정책
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla }는 안전한 결제 처리를 위해 { -brand-name-stripe }와 { -brand-paypal }을 사용합니다.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = 현재 구독 정보
upgrade-purchase-details-new-plan-label = 신규 구독 정보
upgrade-purchase-details-promo-code = 프로모션 코드
upgrade-purchase-details-tax-label = 세금 및 수수료
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = 계정에 추가된 크레딧
upgrade-purchase-details-credit-will-be-applied = 크레딧은 계정에 적용되고 향후 청구서에 사용됩니다.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (매일)
upgrade-purchase-details-new-plan-weekly = { $productName } (매주)
upgrade-purchase-details-new-plan-monthly = { $productName } (월간)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6개월)
upgrade-purchase-details-new-plan-yearly = { $productName } (연간)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = 결제 | { $productTitle }
metadata-description-checkout-start = 결제 세부 정보를 입력하여 구매를 완료하세요.
# Checkout processing
metadata-title-checkout-processing = 처리 | { $productTitle }
metadata-description-checkout-processing = 결제 처리를 완료하는 동안 잠시 기다려 주세요.
# Checkout error
metadata-title-checkout-error = 오류 | { $productTitle }
metadata-description-checkout-error = 구독을 처리하는 동안 오류가 발생했습니다. 문제가 지속되면 지원팀에 문의하세요.
# Checkout success
metadata-title-checkout-success = 성공 | { $productTitle }
metadata-description-checkout-success = 축하합니다! 구매를 완료했습니다.
# Checkout needs_input
metadata-title-checkout-needs-input = 조치 필요 | { $productTitle }
metadata-description-checkout-needs-input = 결제를 계속 하려면 필수 절차를 완료해 주세요.
# Upgrade start
metadata-title-upgrade-start = 업그레이드 | { $productTitle }
metadata-description-upgrade-start = 업그레이드를 완료하려면 결제 세부 정보를 입력하세요.
# Upgrade processing
metadata-title-upgrade-processing = 처리 | { $productTitle }
metadata-description-upgrade-processing = 결제 처리를 완료하는 동안 잠시 기다려 주세요.
# Upgrade error
metadata-title-upgrade-error = 오류 | { $productTitle }
metadata-description-upgrade-error = 업그레이드를 처리하는 중 오류가 발생했습니다. 문제가 지속되면 지원팀에 문의하세요.
# Upgrade success
metadata-title-upgrade-success = 성공 | { $productTitle }
metadata-description-upgrade-success = 축하합니다! 성공적으로 업그레이드를 완료했습니다.
# Upgrade needs_input
metadata-title-upgrade-needs-input = 조치 필요 | { $productTitle }
metadata-description-upgrade-needs-input = 결제를 계속 하려면 필수 절차를 완료해 주세요.
# Default
metadata-title-default = 페이지를 찾을 수 없음 | { $productTitle }
metadata-description-default = 요청하신 페이지를 찾을 수 없습니다.

## Coupon Error Messages

next-coupon-error-cannot-redeem = 입력한 코드는 사용할 수 없습니다. — 이 계정은 이전에 우리 서비스 중 하나를 구독하고 있습니다.
next-coupon-error-expired = 입력한 코드가 만료되었습니다.
next-coupon-error-generic = 코드 처리 과정에서 오류가 발생했습니다. 다시 시도해 주세요.
next-coupon-error-invalid = 입력한 코드가 유효하지 않습니다.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = 입력한 코드가 제한에 도달했습니다.
