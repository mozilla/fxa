## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account }에 로그인하시겠습니까?
session-verify-send-push-body-2 = 본인 확인을 위해 여기를 클릭하세요
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code }는 { -brand-mozilla } 인증 코드입니다. 5분 후에 만료됩니다.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } 인증 코드: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code }는 { -brand-mozilla } 복구 코드입니다. 5분 후에 만료됩니다.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } 코드: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code }는 { -brand-mozilla } 복구 코드입니다. 5분 후에 만료됩니다.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } 코드: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } 로고">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } 로고">
subplat-automated-email = 자동으로 발송된 이메일입니다; 잘못 온 경우, 별도의 조치가 필요하지 않습니다.
subplat-privacy-notice = 개인정보 보호정책
subplat-privacy-plaintext = 개인정보 보호정책:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = 이 이메일은 { $email }에 { -product-mozilla-account }가 있고 { $productName }에 가입했기 때문에 발송되었습니다.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = 이 이메일은 { $email }에 { -product-mozilla-account }가 있기 때문에 발송되었습니다.
subplat-explainer-multiple-2 = 이 이메일은 { $email }에 { -product-mozilla-account }가 있고 여러 제품을 구독했기 때문에 발송되었습니다.
subplat-explainer-was-deleted-2 = 이 이메일은 { $email }에 { -product-mozilla-account }가 등록되어 있어 발송되었습니다.
subplat-manage-account-2 = <a data-l10n-name="subplat-account-page">계정 페이지</a>를 방문하여 { -product-mozilla-account } 설정을 관리하세요.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = 다음 계정 페이지를 방문하여 { -product-mozilla-account } 설정을 관리하세요. { $accountSettingsUrl }
subplat-terms-policy = 약관 및 취소 정책
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = 구독 취소
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = 구독 재활성
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = 결제 정보 업데이트
subplat-privacy-policy = { -brand-mozilla } 개인 정보 보호 정책
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } 개인정보 보호정책
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } 이용 약관
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = 법적 고지
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = 개인 정보 정책
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = 간단한 <a data-l10n-name="cancellationSurveyUrl">설문 조사</a>에 참여하여, 서비스 개선에 도움을 주세요.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = 이 짧은 설문조사에 참여하셔서 서비스 개선에 도움을 주십시오.
payment-details = 지불 상세 사항:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = 청구서 번호: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = 청구됨: { $invoiceDateOnly }에 { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = 다음 청구일자: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>결제 수단:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = 결제 수단: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = 결제 수단: { $lastFour }로 끝나는 { $cardName }
payment-provider-card-ending-in-plaintext = 결제 수단: 끝자리 { $lastFour } 카드
payment-provider-card-ending-in = <b>결제 수단:</b> 끝자리 { $lastFour } 카드
payment-provider-card-ending-in-card-name = <b>결제 수단:</b> { $lastFour }로 끝나는 { $cardName }
subscription-charges-invoice-summary = 청구서 요약

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>청구서 번호:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = 청구서 번호: { $invoiceNumber }
subscription-charges-invoice-date = <b>날짜:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = 날짜: { $invoiceDateOnly }
subscription-charges-prorated-price = 비례 가격
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = 비례 가격: { $remainingAmountTotal }
subscription-charges-list-price = 정가
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = 정가: { $offeringPrice }
subscription-charges-credit-from-unused-time = 미 사용 기간 크레딧
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = 미 사용 기간 크레딧: { $unUsedAmountTotal }
subscription-charges-subtotal = <b>소계</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 소계: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = 일회성 할인
subscription-charges-one-time-discount-plaintext = 일회성 할인: { $invoiceDiscountAmount }
subscription-charges-repeating-discount = { $discountDuration }개월 할인
subscription-charges-repeating-discount-plaintext = { $discountDuration }개월 할인: { $invoiceDiscountAmount }
subscription-charges-discount = 할인
subscription-charges-discount-plaintext = 할인: { $invoiceDiscountAmount }
subscription-charges-taxes = 세금과 수수료
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = 세금과 수수료: { $invoiceTaxAmount }
subscription-charges-total = <b>총계</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = 총계: { $invoiceTotal }
subscription-charges-credit-applied = 크레딧 적용됨
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = 크레딧 적용됨: { $creditApplied }
subscription-charges-amount-paid = <b>결제 금액</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = 결제 금액: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = { $creditReceived }의 계정 크레딧을 받았습니다. 이는 향후 청구서에 적용됩니다.

##

subscriptionSupport = 구독에 관해 궁금한 점이 있으신가요? <a data-l10n-name="subscriptionSupportUrl">지원팀</a>이 도와드리겠습니다.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = 구독에 대한 질문이 있으십니까? 지원팀이 도와드리겠습니다.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName }를 구독해 주셔서 감사합니다. 구독에 대해 문의하거나 { $productName }에 대해 더 알아보려면 <a data-l10n-name="subscriptionSupportUrl">연락</a>을 해주세요.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName }를 구독해 주셔서 감사합니다. 구독에 대해 문의하거나 { $productName }에 대해 더 알아보려면 다음으로 연락을 해주세요.
subscription-support-get-help = 구독에 대한 도움 받기
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">구독 관리</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = 구독 관리:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">지원팀에 문의</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = 연락하기:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">여기</a>에서 귀하의 결제 방법과 계정 정보가 최신 상태인지 확인할 수 있습니다.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 다음에서 결제 방법과 계정 정보가 최신 상태인지 확인할 수 있습니다:
subscriptionUpdateBillingTry = 며칠 동안 귀하의 결제를 다시 시도하겠지만, <a data-l10n-name="updateBillingUrl">결제 정보를 업데이트</a>하여 문제를 해결하는 데 귀하의 도움이 필요할 수 있습니다.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 며칠 동안 귀하의 결제를 다시 시도하겠지만 결제 정보를 업데이트하여 문제를 해결하는 데 귀하의 도움이 필요할 수 있습니다.
subscriptionUpdatePayment = 서비스 중단을 방지하려면 가능한 한 빨리 <a data-l10n-name="updateBillingUrl">결제 정보를 업데이트</a>하시기 바랍니다.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = 서비스 중단을 방지하려면 가능한 한 빨리 결제 정보를 업데이트하십시오.
view-invoice-link-action = 청구서 보기
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 청구서 보기: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName }에 오신 것을 환영합니다.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName }에 오신 것을 환영합니다.
downloadSubscription-content-2 = 구독에 포함된 모든 기능을 사용해보세요
downloadSubscription-link-action-2 = 시작하기
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account }가 삭제되었습니다
fraudulentAccountDeletion-title = 계정이 삭제되었습니다
fraudulentAccountDeletion-content-part1-v2 = 최근에 이 이메일 주소로 { -product-mozilla-account }가 생성되었고 구독이 청구되었습니다. 모든 새 계정에 필요한 절차와 같이, 이 이메일 주소를 인증하여 계정을 확인하세요.
fraudulentAccountDeletion-content-part2-v2 = 현재 계정을 승인하지 않은 것으로 확인됩니다. 이 절차를 완료하지 않아, 이 구독이 의도한 것인지 확인할 수 없었습니다. 결과적으로, 이 이메일에 등록된 { -product-mozilla-account }가 구독을 취소하고 모든 청구 요금을 환불했습니다.
fraudulentAccountDeletion-contact = 궁금하신 점이 있다면, <a data-l10n-name="mozillaSupportUrl">지원 팀</a>에 문의하세요.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = 궁금하신 점이 있다면, 지원 팀에 문의하세요: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } 구독이 취소되었습니다.
subscriptionAccountDeletion-title = 가까운 시일 내에 다시 뵐 수 있기를 희망합니다.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 최근에 { -product-mozilla-account }를 삭제했습니다. 그 결과 귀하의 { $productName } 구독이 취소되었습니다. { $invoiceTotal }의 최종 결제는 { $invoiceDateOnly }에 이루어졌습니다.
subscriptionAccountReminderFirst-subject = 알림: 계정 설정 완료
subscriptionAccountReminderFirst-title = 아직 구독에 접근할 수 없습니다.
subscriptionAccountReminderFirst-content-info-3 = 며칠 전에 { -product-mozilla-account }을 만들었지만 아직 승인하지 않았습니다. 새로운 구독을 사용하기 위해 계정 생성을 마치시기 바랍니다.
subscriptionAccountReminderFirst-content-select-2 = 새로운 비밀번호 생성을 위해 "비밀번호 생성"을 클릭하고 계정 승인을 완료하세요.
subscriptionAccountReminderFirst-action = 비밀번호 생성
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = 마지막 알림: 계정 설정
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla }에 오신 것을 환영합니다!
subscriptionAccountReminderSecond-content-info-3 = 며칠 전에 { -product-mozilla-account }을 만들었지만 아직 승인하지 않았습니다. 새로운 구독을 사용하기 위해 계정 생성을 마치시기 바랍니다.
subscriptionAccountReminderSecond-content-select-2 = 새로운 비밀번호 생성을 위해 "비밀번호 생성"을 클릭하고 계정 승인을 완료하세요.
subscriptionAccountReminderSecond-action = 비밀번호 생성
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = { $productName } 구독이 취소됨
subscriptionCancellation-title = 가까운 시일 내에 다시 뵐 수 있기를 희망합니다.

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = { $productName } 구독을 취소했습니다. { $invoiceDateOnly }에 최종 결제 금액 { $invoiceTotal }이 지불되었습니다.
subscriptionCancellation-outstanding-content-2 = { $productName } 구독을 취소했습니다. { $invoiceDateOnly }에 최종 결제 금액 { $invoiceTotal }이 지불될 예정됩니다.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = 서비스는 현재 청구 기간인 { $serviceLastActiveDateOnly }까지 계속 제공됩니다.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = { $productName }로 전환 완료
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld }에서 { $productName }로 성공적으로 전환했습니다.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = 다음 청구서부터 청구 금액이 { $productPaymentCycleOld } 당 { $paymentAmountOld }에서 { $productPaymentCycleNew } 당 { $paymentAmountNew }로 변경됩니다. 또한 { $productPaymentCycleOld }의 나머지 부분에 대해 더 높은 요금을 반영하기 위해 { $paymentProrated }의 일회성 요금이 청구됩니다.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = { $productName }를 사용하기 위해 설치할 새 소프트웨어가 있는 경우 다운로드 지침이 포함된 별도의 이메일을 받게 됩니다.
subscriptionDowngrade-content-auto-renew = 취소를 선택하지 않는 한 구독은 각 청구 기간을 자동으로 갱신합니다.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = { $productName } 구독이 취소됨
subscriptionFailedPaymentsCancellation-title = 구독이 취소됨
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = 여러 번의 결제 시도가 실패하여 { $productName } 구독을 취소했습니다. 다시 사용하시려면, 결제 수단을 변경하고 새 구독을 시작하세요.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } 결제 승인
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName }를 구독해주셔셔 감사합니다.
subscriptionFirstInvoice-content-processing = 결제가 진행중이며 최대 4 영업일이 소요될 수 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = { $productName }를 사용하기 위한 방법을 별도의 이메일로 받게 됩니다.
subscriptionFirstInvoice-content-auto-renew = 구독은 구독을 취소하지 않는 한 매 결제 시기마다 자동으로 갱신됩니다.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = 다음 청구서는 { $nextInvoiceDateOnly }에 발급됩니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName }의 결제 수단이 만료되었거나 곧 만료 예정
subscriptionPaymentExpired-title-2 = 만료되었거나 곧 만료될 결제 수단입니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = { $productName }에 사용 중인 결제 방법이 만료되었거나 곧 만료될 예정입니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } 결제 실패
subscriptionPaymentFailed-title = 죄송합니다, 결제에 문제가 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName }에 대한 최근 결제에 문제가 있습니다.
subscriptionPaymentFailed-content-outdated-1 = 결제 방법이 만료되었거나 현재 결제 방법이 오래되었을 수 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName }에 대한 결제 정보 업데이트 필요
subscriptionPaymentProviderCancelled-title = 죄송합니다, 결제 수단에 문제가 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName }에 대한 결제 방법에 문제가 있습니다.
subscriptionPaymentProviderCancelled-content-reason-1 = 결제 방법이 만료되었거나 현재 결제 방법이 오래되었을 수 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } 구독 재활성화됨
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = { $productName } 구독을 다시 활성화해 주셔서 감사합니다!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = 결제 주기와 결제는 동일하게 유지됩니다. 다음 청구 금액은 { $nextInvoiceDateOnly }에 { $invoiceTotal }입니다. 취소를 선택하지 않는 한 구독은 각 청구 기간을 자동으로 갱신합니다.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } 자동 갱신 알림
subscriptionRenewalReminder-title = 구독이 곧 갱신됩니다
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = { $productName } 고객님께,
subscriptionRenewalReminder-content-closing = 진심으로,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } 팀 드림
subscriptionReplaced-subject = 업그레이드의 일부로 구독이 업데이트되었습니다.
subscriptionReplaced-title = 구독 정보가 업데이트 되었습니다.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = 개별 { $productName } 구독이 대체되었으며 이제 새 번들에 포함되었습니다.
subscriptionReplaced-content-credit = 이전 구독에서 사용하지 않은 시간에 대한 크레딧을 받게 됩니다. 이 크레딧은 자동으로 계정에 적용되며 향후 청구에 사용됩니다.
subscriptionReplaced-content-no-action = 별도의 조치가 필요하지 않습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } 결제 수신됨
subscriptionSubsequentInvoice-title = 구독해 주셔서 감사합니다!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName }에 대한 최근 결제가 접수되었습니다.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = 다음 청구서는 { $nextInvoiceDateOnly }에 발급됩니다.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = { $productName }로 업그레이드 완료
subscriptionUpgrade-title = 업그레이드 해주셔서 감사합니다!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = { $productName }으로 성공적으로 업그레이드했습니다.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = 이 결제 기간의 나머지 기간 동안({ $productPaymentCycleOld }) 더 높은 구독 가격을 반영하기 위해 { $invoiceAmountDue }의 일회성 수수료가 청구되었습니다.
subscriptionUpgrade-content-charge-credit = { $paymentProrated }의 계정 크레딧을 받았습니다.
subscriptionUpgrade-content-subscription-next-bill-change = 다음 청구서부터 구독 가격이 변경됩니다.
subscriptionUpgrade-content-old-price-day = 이전 요율은 하루에 { $paymentAmountOld }였습니다.
subscriptionUpgrade-content-old-price-week = 이전 요율은 주당 { $paymentAmountOld }였습니다.
subscriptionUpgrade-content-old-price-month = 이전 요율은 월간 { $paymentAmountOld }였습니다.
subscriptionUpgrade-content-old-price-halfyear = 이전 요율은 월간 { $paymentAmountOld }였습니다.
subscriptionUpgrade-content-old-price-year = 이전 요율은 연간 { $paymentAmountOld }였습니다.
subscriptionUpgrade-content-old-price-default = 이전 요율은 결제 간격당 { $paymentAmountOld }였습니다.
subscriptionUpgrade-content-old-price-day-tax = 이전 요율은 하루에 { $paymentAmountOld } + 세금 { $paymentTaxOld }이었습니다.
subscriptionUpgrade-content-old-price-week-tax = 이전 요율은 주당 { $paymentAmountOld } + 세금 { $paymentTaxOld }이었습니다.
subscriptionUpgrade-content-old-price-month-tax = 이전 요율은 월간 { $paymentAmountOld } + 세금 { $paymentTaxOld }이었습니다.
subscriptionUpgrade-content-old-price-halfyear-tax = 이전 요율은 6개월에 { $paymentAmountOld } + 세금 { $paymentTaxOld }이었습니다.
subscriptionUpgrade-content-old-price-year-tax = 이전 요율은 연간 { $paymentAmountOld } + 세금 { $paymentTaxOld }이었습니다.
subscriptionUpgrade-content-old-price-default-tax = 이전 요율은 결제 간격당 { $paymentAmountOld } + 세금 { $paymentTaxOld }이었습니다.
subscriptionUpgrade-content-new-price-day = 앞으로는 하루에 { $paymentAmountNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-week = 앞으로 주당 { $paymentAmountNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-month = 앞으로 월간 { $paymentAmountNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-halfyear = 앞으로 6개월 단위로 { $paymentAmountNew }가 청구됩니다.
subscriptionUpgrade-content-new-price-year = 앞으로 연간 { $paymentAmountNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-default = 앞으로 할인을 제외하고 결제 간격당 { $paymentAmountNew }의 요금이 청구됩니다.
subscriptionUpgrade-content-new-price-day-dtax = 앞으로 하루에 { $paymentAmountNew } + 세금 { $paymentTaxNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-week-tax = 앞으로 주당 { $paymentAmountNew } + 세금 { $paymentTaxNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-month-tax = 앞으로는 매월 { $paymentAmountNew } + 세금 { $paymentTaxNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-halfyear-tax = 앞으로 6개월당 { $paymentAmountNew } + 세금 { $paymentTaxNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-year-tax = 앞으로 연간 { $paymentAmountNew } + 세금 { $paymentTaxNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-content-new-price-default-tax = 앞으로 결제 간격당 { $paymentAmountNew } + 세금 { $paymentTaxNew }의 요금이 할인을 제외하고 청구됩니다.
subscriptionUpgrade-existing = 기존 구독이 이번 업그레이드와 중복되는 경우, 이를 처리하여 세부 사항이 담긴 별도의 이메일을 보내드립니다. 새 요금제에 설치가 필요한 제품이 포함 된 경우 설정 지침이 포함된 별도의 이메일을 보내드립니다.
subscriptionUpgrade-auto-renew = 취소를 선택하지 않는 한 구독은 각 청구 기간을 자동으로 갱신합니다.
subscriptionsPaymentExpired-subject-2 = 구독에 대한 결제 방법이 만료되었거나 곧 만료될 예정입니다.
subscriptionsPaymentExpired-title-2 = 만료되었거나 곧 만료될 결제 수단입니다.
subscriptionsPaymentExpired-content-2 = 다음 구독에 대한 결제에 사용 중인 결제 방법은 만료되었거나 곧 만료될 예정입니다.
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } 구독에 대한 결제 정보 갱신 필요
subscriptionsPaymentProviderCancelled-title = 죄송합니다. 선택하신 결제 수단에 문제가 있습니다.
subscriptionsPaymentProviderCancelled-content-detected = 다음 구독에 대한 결제 방법에 문제가 있음을 감지했습니다.
subscriptionsPaymentProviderCancelled-content-payment-1 = 결제 방법이 만료되었거나 현재 결제 방법이 오래되었을 수 있습니다.
