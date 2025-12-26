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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } 로고">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="기기 동기화">
body-devices-image = <img data-l10n-name="devices-image" alt="기기">
fxa-privacy-url = { -brand-mozilla } 개인정보처리방침
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } 개인정보 보호정책
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } 이용 약관
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
account-deletion-info-block-communications = <a data-l10n-name="unsubscribeLink">구독 해지를 요청</a>하지 않는 한, 계정이 삭제되어도 Mozilla Corporation과 Mozilla Foundation으로부터 이메일을 계속 받을 수 있습니다.
account-deletion-info-block-support = 궁금하신 점이 있거나 도움이 필요하면 언제든지 <a data-l10n-name="supportLink">지원 팀</a>에 문의하세요.
account-deletion-info-block-communications-plaintext = 계정이 삭제되어도, 구독 해지를 요청하지 않는 한 Mozilla Corporation과 Mozilla Foundation으로부터 이메일을 계속 받을 수 있습니다:
account-deletion-info-block-support-plaintext = 궁금하신 점이 있거나 도움이 필요하면 언제든지 지원 팀에 문의하세요.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ -google-play }에서 { $productName } 다운로드">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ -app-store }에서 { $productName } 다운로드">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = { $productName }를 <a data-l10n-name="anotherDeviceLink">다른 데스크톱 기기</a>에 설치하세요.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = { $productName }을 <a data-l10n-name="anotherDeviceLink">다른 기기</a>에 설치하세요.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Google Play에서 { $productName } 다운로드:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = App Store에서 { $productName } 다운로드:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = 다른 기기에 { $productName } 설치:
automated-email-change-2 = 이 조치를 취하지 않았다면 즉시 <a data-l10n-name="passwordChangeLink">비밀번호를 변경</a>하세요.
automated-email-support = 자세한 내용은 <a data-l10n-name="supportLink">{ -brand-mozilla } 지원</a>을 참조하세요.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = 이 조치를 취하지 않았다면 즉시 비밀번호를 변경하세요:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = 자세한 내용은 { -brand-mozilla } 지원을 참조하세요:
automated-email-inactive-account = 이 이메일은 자동으로 전송되었습니다. 이 이메일은 { -product-mozilla-account }가 있고 마지막 로그인 이후 2년이 지났기 때문에 발송되었습니다.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } 자세한 내용은 <a data-l10n-name="supportLink">{ -brand-mozilla } 지원</a>을 참조하세요.
automated-email-no-action-plaintext = 이것은 자동 이메일입니다. 실수로 받은 경우에는 아무 조치도 취할 필요가 없습니다.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = 자동으로 발송된 이메일입니다. 이 작업을 승인하지 않았다면 비밀번호를 변경해 주세요:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = 이 요청은 { $uaOS } { $uaOSVersion } 버전의 { $uaBrowser }에서 발송되었습니다.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = 이 요청은 { $uaOS }의 { $uaBrowser }에서 발송되었습니다.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = 이 요청은 { $uaBrowser }에서 발송되었습니다.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = 이 요청은 { $uaOS } { $uaOSVersion } 버전에서 발송되었습니다.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = 이 요청은 { $uaOS }에서 발송되었습니다.
automatedEmailRecoveryKey-delete-key-change-pwd = 본인이 아니라면, <a data-l10n-name="revokeAccountRecoveryLink">새 키를 삭제</a>하시고 <a data-l10n-name="passwordChangeLink">비밀번호를 변경하세요</a>.
automatedEmailRecoveryKey-change-pwd-only = 본인이 아니라면, <a data-l10n-name="passwordChangeLink">비밀번호를 변경하세요</a>.
automatedEmailRecoveryKey-more-info = 자세한 내용은 <a data-l10n-name="supportLink">{ -brand-mozilla } 지원</a>을 참조하세요.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = 이 요청은 다음 기기에서 발송되었습니다.
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = 본인이 아니라면, 다음 주소에서 새 키를 삭제하세요.
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = 본인이 아니라면, 다음 주소에서 비밀번호를 변경하세요.
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = 그리고 다음 주소에서 비밀번호를 변경하세요.
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = 자세한 내용은 { -brand-mozilla } 지원을 참조하세요:
automated-email-reset =
    자동으로 발송된 이메일입니다. 승인하지 않은 작업인 경우 <a data-l10n-name="resetLink">비밀번호를 재설정</a>하십시오.
    자세한 내용은 <a data-l10n-name="supportLink">{ -brand-mozilla }지원 페이지</a>를 참조하십시오.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = 이 작업을 승인하지 않으셨다면 지금 { $resetLink }에서 비밀번호를 재설정하세요.
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    이 행동을 하지 않았다면 즉시 <a data-l10n-name="resetLink">비밀번호를 재설정</a>하고 <a data-l10n-name="twoFactorSettingsLink">2단계 인증을 재설정</a>하세요.
    자세한 내용은 <a data-l10n-name="supportLink">{ -brand-mozilla } 지원</a>을 참조하세요.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = 이 행동을 하지 않았다면 즉시 비밀번호를 변경하세요:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = 또한, 2단계 인증 재설정하세요:
brand-banner-message = { -product-firefox-accounts } 명칭이 { -product-mozilla-accounts }으로 변경되었다는 사실을 알고 계신가요? <a data-l10n-name="learnMore">자세히 알아보세요</a>
cancellationSurvey = 간단한 <a data-l10n-name="cancellationSurveyUrl">설문 조사</a>에 참여하여, 서비스 개선에 도움을 주세요.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = 이 짧은 설문조사에 참여하셔서 서비스 개선에 도움을 주십시오.
change-password-plaintext = 만약 누군가가 당신의 계정에 접근 시도를 했다고 의심이 된다면, 비밀번호를 변경해주세요.
manage-account = 계정 관리
manage-account-plaintext = { manage-account }:
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

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 소계: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = 총계: { $invoiceTotal }

##

subscriptionSupport = 구독에 관해 궁금한 점이 있으신가요? <a data-l10n-name="subscriptionSupportUrl">지원팀</a>이 도와드리겠습니다.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = 구독에 대한 질문이 있으십니까? 지원팀이 도와드리겠습니다.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName }를 구독해 주셔서 감사합니다. 구독에 대해 문의하거나 { $productName }에 대해 더 알아보려면 <a data-l10n-name="subscriptionSupportUrl">연락</a>을 해주세요.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName }를 구독해 주셔서 감사합니다. 구독에 대해 문의하거나 { $productName }에 대해 더 알아보려면 다음으로 연락을 해주세요.
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">여기</a>에서 귀하의 결제 방법과 계정 정보가 최신 상태인지 확인할 수 있습니다.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 다음에서 결제 방법과 계정 정보가 최신 상태인지 확인할 수 있습니다:
subscriptionUpdateBillingTry = 며칠 동안 귀하의 결제를 다시 시도하겠지만, <a data-l10n-name="updateBillingUrl">결제 정보를 업데이트</a>하여 문제를 해결하는 데 귀하의 도움이 필요할 수 있습니다.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 며칠 동안 귀하의 결제를 다시 시도하겠지만 결제 정보를 업데이트하여 문제를 해결하는 데 귀하의 도움이 필요할 수 있습니다.
subscriptionUpdatePayment = 서비스 중단을 방지하려면 가능한 한 빨리 <a data-l10n-name="updateBillingUrl">결제 정보를 업데이트</a>하시기 바랍니다.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = 서비스 중단을 방지하려면 가능한 한 빨리 결제 정보를 업데이트하십시오.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = 자세한 내용은 <a data-l10n-name="supportLink">{ -brand-mozilla } 지원</a>을 참조하세요.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = 자세한 내용은 { -brand-mozilla } 지원을 참조하세요: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaOS } { $uaOSVersion }의 { $uaBrowser }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaOS }의 { $uaBrowser }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (추정)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (추정)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (추정)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (추정)
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 청구서 보기: { $invoiceLink }
cadReminderFirst-subject-1 = 다시 안내드려요! { -brand-firefox }를 동기화하세요.
cadReminderFirst-action = 다른 기기 동기화
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = 동기화를 위해 둘 이상의 기기가 필요합니다.
cadReminderFirst-description-v2 = 모든 장치에서 탭을 사용하세요. { -brand-firefox }를 사용하는 어디서나 북마크, 비밀번호, 그리고 그 밖의 데이터를 이용하세요.
cadReminderSecond-subject-2 = 잊지 마세요! 동기화 설정을 완료해야 합니다.
cadReminderSecond-action = 다른 기기 동기화
cadReminderSecond-title-2 = 동기화를 잊지 마세요!
cadReminderSecond-description-sync = { -brand-firefox }를 사용하는 모든 곳에서 — 북마크, 비밀번호, 열린 탭 등을 동기화하세요.
cadReminderSecond-description-plus = 또한, 데이터는 언제나 암호화됩니다. 사용자와 승인된 기기만이 볼 수 있어요.
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
inactiveAccountFinalWarning-subject = { -product-mozilla-account }를 유지할 수 있는 마지막 기회
inactiveAccountFinalWarning-title = { -brand-mozilla } 계정과 데이터가 삭제됩니다.
inactiveAccountFinalWarning-preview = 계정을 유지하려면 로그인하세요.
inactiveAccountFinalWarning-account-description = { -product-mozilla-account }는 무료 개인정보 보호에 접근하고 { -brand-firefox } Sync나 { -product-mozilla-monitor }, { -product-firefox-relay }, { -product-mdn }과 같은 제품을 탐색하는 데 사용됩니다.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = 로그인하지 않으면 <strong>{ $deletionDate }</strong>에 계정과 개인정보가 영구적으로 삭제됩니다.
inactiveAccountFinalWarning-action = 계정을 유지하려면 로그인하세요.
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = 계정을 유지하려면 로그인하세요:
inactiveAccountFirstWarning-subject = 계정을 잃어 버리지 마세요.
inactiveAccountFirstWarning-title = { -brand-mozilla } 계정과 데이터를 유지하시겠습니까?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account }는 무료 개인정보 보호에 접근하고 { -brand-firefox } Sync나 { -product-mozilla-monitor }, { -product-firefox-relay }, { -product-mdn }과 같은 제품을 탐색하는 데 사용됩니다..
inactiveAccountFirstWarning-inactive-status = 2년 동안 로그인하지 않은 것으로 확인되었습니다.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = 활성 상태가 아니기 때문에 <strong>{ $deletionDate }</strong>에 계정과 개인 정보가 영구적으로 삭제됩니다.
inactiveAccountFirstWarning-action = 계정을 유지하려면 로그인하세요.
inactiveAccountFirstWarning-preview = 계정을 유지하려면 로그인하세요.
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = 계정을 유지하려면 로그인하세요.
inactiveAccountSecondWarning-subject = 조치 필요: 7일 후 계정 삭제
inactiveAccountSecondWarning-title = { -brand-mozilla } 계정과 데이터가 7일 후에 삭제됩니다.
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account }는 무료 개인정보 보호에 접근하고 { -brand-firefox } sync나 { -product-mozilla-monitor }, { -product-firefox-relay }, { -product-mdn }과 같은 제품을 탐색하는 데 사용됩니다.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = 활성 상태가 아니기 때문에 <strong>{ $deletionDate }</strong>에 계정과 개인 정보가 영구적으로 삭제됩니다.
inactiveAccountSecondWarning-action = 계정을 유지하려면 로그인하세요.
inactiveAccountSecondWarning-preview = 계정을 유지하려면 로그인하세요.
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = 계정을 유지하려면 로그인하세요.
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = 백업 인증 코드가 부족합니다!
codes-reminder-title-one = 마지막 백업 인증 코드를 사용 중입니다.
codes-reminder-title-two = 백업 인증 코드를 더 많이 생성하세요.
codes-reminder-description-part-one = 백업 인증 코드는 비밀번호를 잊어버렸을 때 정보를 복원하는 데 도움이 됩니다.
codes-reminder-description-part-two = 지금 새 코드를 생성하여 나중에 데이터를 잃어버리지 않도록 하세요.
codes-reminder-description-two-left = 코드가 두 개만 남았습니다.
codes-reminder-description-create-codes = 계정이 잠긴 경우 다시 로그인할 수 있도록 새 백업 인증 코드를 만드세요.
lowRecoveryCodes-action-2 = 코드 생성
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] 백업 인증 코드가 남아있지 않습니다
       *[other] 백업 인증 코드가 { $numberRemaining }개 남았습니다!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName }에 대한 새 로그인
newDeviceLogin-subjectForMozillaAccount = { -product-mozilla-account }에 대한 새 로그인
newDeviceLogin-title-3 = 귀하의 { -product-mozilla-account }이 로그인에 사용되었습니다.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = 본인이 아닌가요? <a data-l10n-name="passwordChangeLink">비밀번호를 바꾸세요</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = 본인이 아닌가요? 비밀번호를 바꾸세요:
newDeviceLogin-action = 계정 관리
passwordChanged-subject = 비밀번호 수정 완료
passwordChanged-title = 비밀번호 변경 성공
passwordChanged-description-2 = { -product-mozilla-account } 비밀번호가 다음 기기에서 성공적으로 변경됨:
passwordChangeRequired-subject = 의심스러운 활동 감지
passwordChangeRequired-preview = 즉시 비밀번호를 변경하세요
passwordChangeRequired-title-2 = 비밀번호 재설정
passwordChangeRequired-suspicious-activity-3 = 의심스러운 활동으로부터 보호하기 위해 계정을 잠갔습니다. 모든 기기에서 로그아웃되었으며 예방책으로 모든 동기화 데이터가 삭제되었습니다.
passwordChangeRequired-sign-in-3 = 계정에 다시 로그인하려면 비밀번호를 재설정하기만 하면 됩니다.
passwordChangeRequired-different-password-2 = <b>중요:</b> 이전에 사용했던 것과 다른 강력한 비밀번호를 선택하세요.
passwordChangeRequired-different-password-plaintext-2 = 중요: 이전에 사용했던 것과 다른 강력한 비밀번호를 선택하세요.
passwordChangeRequired-action = 비밀번호 재설정
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-title = 비밀번호를 잊으셨나요?
password-forgot-otp-request = 다음으로부터 { -product-mozilla-account } 비밀번호 변경 요청을 받았습니다:
password-forgot-otp-code-2 = 본인이 확인했다면 진행을 위한 확인 코드는 다음과 같습니다:
password-forgot-otp-expiry-notice = 이 코드는 10분 후에 만료됩니다.
passwordReset-subject-2 = 비밀번호가 재설정되었습니다
passwordReset-title-2 = 비밀번호가 재설정되었습니다
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = { -product-mozilla-account } 비밀번호 재설정 정보:
passwordResetAccountRecovery-subject-2 = 비밀번호가 재설정되었습니다.
passwordResetAccountRecovery-title-3 = 비밀번호가 재설정되었습니다
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = 계정 복구 키를 사용한 { -product-mozilla-account } 비밀번호 재설정 정보:
passwordResetAccountRecovery-information = 동기화된 모든 기기에서 로그아웃되었습니다. 기존의 계정 복구 키를 대체할 새로운 계정 복구 키를 만들었습니다. 계정 설정에서 변경할 수 있습니다.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = 동기화된 모든 기기에서 로그아웃되었습니다. 기존의 계정 복구 키를 대체할 새로운 계정 복구 키를 만들었습니다. 계정 설정에서 변경할 수 있습니다:
passwordResetAccountRecovery-action-4 = 계정 관리
passwordResetRecoveryPhone-subject = 사용된 복구 전화번호
passwordResetRecoveryPhone-preview = 본인인지 확인하세요.
passwordResetRecoveryPhone-title = 비밀번호 재설정을 확인하는데 복구 전화번호가 사용되었습니다.
passwordResetRecoveryPhone-device = 다음에서 복구 전화 사용됨:
passwordResetRecoveryPhone-action = 계정 관리
passwordResetWithRecoveryKeyPrompt-subject = 비밀번호가 재설정되었습니다
passwordResetWithRecoveryKeyPrompt-title = 비밀번호가 재설정되었습니다
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = { -product-mozilla-account } 비밀번호 재설정 정보:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = 계정 복구 키 생성
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = 계정 복구 키 생성:
passwordResetWithRecoveryKeyPrompt-cta-description = 동기화된 모든 기기에서 다시 로그인해야 합니다. 다음을 위해 계정 복구 키로 데이터를 안전하게 지키세요. 비밀번호를 잊어도 데이터를 복구할 수 있습니다.
postAddAccountRecovery-subject-3 = 새 계정 복구 키 생성됨
postAddAccountRecovery-title2 = 새 계정 복구 키를 생성했습니다
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = 이 키를 안전한 장소에 저장하세요 — 비밀번호를 잊어 버렸을 때 암호화된 브라우저 데이터를 복원하는 용도로 필요합니다.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = 이 키는 한 번만 사용할 수 있습니다. 사용한 후에는 자동으로 새 키를 생성해드립니다. 혹은 언제든 계정 설정에서 새 키를 생성할 수 있습니다.
postAddAccountRecovery-action = 계정 관리
postAddLinkedAccount-subject-2 = { -product-mozilla-account }에 새 계정 연결됨
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName } 계정이 { -product-mozilla-account } 계정에 연결되었습니다.
postAddLinkedAccount-action = 계정 관리
postAddRecoveryPhone-subject = 복구 전화번호가 추가됨
postAddRecoveryPhone-preview = 2단계 인증으로 보호되는 계정
postAddRecoveryPhone-title-v2 = 복구 전화번호를 추가했습니다.
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = { $maskedLastFourPhoneNumber } 번호를 복구 전화번호로 추가했습니다.
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = 계정을 보호하는 방법
postAddRecoveryPhone-how-protect-plaintext = 계정을 보호하는 방법:
postAddRecoveryPhone-enabled-device = 다음에서 활성화했습니다:
postAddRecoveryPhone-action = 계정 관리
postAddTwoStepAuthentication-preview = 계정이 보호됩니다
postAddTwoStepAuthentication-subject-v3 = 2단계 인증이 켜져 있습니다
postAddTwoStepAuthentication-title-2 = 2단계 인증을 켰습니다
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = 다음에서 요청함:
postAddTwoStepAuthentication-action = 계정 관리
postAddTwoStepAuthentication-code-required-v4 = 이제 로그인할 때마다 인증 앱의 보안 코드가 필요합니다.
postAddTwoStepAuthentication-recovery-method-codes = 복구 방법으로 백업 인증 코드도 추가했습니다.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = 복구 전화번호로 { $maskedPhoneNumber }도 추가하였습니다.
postAddTwoStepAuthentication-how-protects-link = 계정을 보호하는 방법
postAddTwoStepAuthentication-how-protects-plaintext = 계정을 보호하는 방법:
postChangeAccountRecovery-subject = 계정 복구 키 변경됨
postChangeAccountRecovery-title = 계정 복구 키를 변경했습니다.
postChangeAccountRecovery-body-part1 = 새로운 계정 복구 키가 생성되었습니다. 이전 키는 삭제되었습니다.
postChangeAccountRecovery-body-part2 = 새 복구 키를 안전한 장소에 저장하세요 — 비밀번호를 잊어 버렸을 때 암호화된 브라우저 데이터를 복원하는 용도로 필요합니다.
postChangeAccountRecovery-action = 계정 관리
postChangePrimary-subject = 기본 이메일 수정 완료
postChangePrimary-title = 새 기본 이메일
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = 기본 이메일을 { $email }으로 성공적으로 변경했습니다. 이 주소는 이제 { -product-mozilla-account }에 로그인하고 보안 알림 및 로그인 확인을 받는 사용자 이름입니다.
postChangePrimary-action = 계정 관리
postChangeRecoveryPhone-subject = 복구 전화번호 업데이트됨
postChangeRecoveryPhone-preview = 2단계 인증으로 보호되는 계정
postChangeRecoveryPhone-title = 복구 전화번호를 변경했습니다.
postChangeRecoveryPhone-description = 새로운 계정 복구 전화번호가 생성되었습니다. 이전 전화번호는 삭제되었습니다.
postChangeRecoveryPhone-requested-device = 다음에서 요청했습니다:
postChangeTwoStepAuthentication-preview = 계정 보호됨
postChangeTwoStepAuthentication-subject = 2단계 인증 업데이트됨
postChangeTwoStepAuthentication-title = 2단계 인증 업데이트 완료
postChangeTwoStepAuthentication-use-new-account = 이제 인증 앱에서 새로운 { -product-mozilla-account } 항목을 사용해야 합니다. 오래된 것은 더이상 작동하지 않으므로 제거하실 수 있습니다.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = 다음에서 요청함:
postChangeTwoStepAuthentication-action = 계정 관리
postChangeTwoStepAuthentication-how-protects-link = 계정을 보호하는 방법
postChangeTwoStepAuthentication-how-protects-plaintext = 계정을 보호하는 방법:
postConsumeRecoveryCode-title-3 = 백업 인증 코드가 비밀번호 재설정 확인에 사용되었습니다.
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = 코드 사용됨:
postConsumeRecoveryCode-action = 계정 관리
postConsumeRecoveryCode-subject-v3 = 백업 인증 코드 사용됨
postConsumeRecoveryCode-preview = 본인인지 확인하세요.
postNewRecoveryCodes-subject-2 = 새 백업 인증 코드가 생성됨
postNewRecoveryCodes-title-2 = 새 백업 인증 코드를 생성했습니다
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = 생성 일시:
postNewRecoveryCodes-action = 계정 관리
postRemoveAccountRecovery-subject-2 = 계정 복구 키 삭제됨
postRemoveAccountRecovery-title-3 = 계정 복구 키를 삭제했습니다
postRemoveAccountRecovery-body-part1 = 비밀번호를 잊어버린 경우 암호화된 검색 데이터를 복원하려면 계정 복구 키가 필요합니다.
postRemoveAccountRecovery-body-part2 = 아직 계정 복구 키를 만들지 않았다면 계정 설정에서 새 계정 복구 키를 만들어 저장된 비밀번호, 북마크, 검색 기록 등을 잃어버리지 않도록 하세요.
postRemoveAccountRecovery-action = 계정 관리
postRemoveRecoveryPhone-subject = 복구 전화번호 삭제됨
postRemoveRecoveryPhone-preview = 2단계 인증으로 보호되는 계정
postRemoveRecoveryPhone-title = 복구 전화번호 삭제됨
postRemoveRecoveryPhone-description-v2 = 복구 전화번호가 2단계 인증 설정에서 제거되었습니다.
postRemoveRecoveryPhone-description-extra = 인증 앱을 사용할 수 없는 경우에도 백업 인증 코드를 사용하여 로그인할 수 있습니다.
postRemoveRecoveryPhone-requested-device = 다음에서 요청했습니다:
postRemoveSecondary-subject = 보조 이메일 삭제됨
postRemoveSecondary-title = 보조 이메일 삭제됨
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = { -product-mozilla-account }에서 보조 이메일인 { $secondaryEmail }을 성공적으로 제거했습니다. 보안 알림 및 로그인 확인이 더 이상 이 주소로 전달되지 않습니다.
postRemoveSecondary-action = 계정 관리
postRemoveTwoStepAuthentication-subject-line-2 = 2단계 인증이 꺼져 있습니다
postRemoveTwoStepAuthentication-title-2 = 2단계 인증을 껐습니다
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = 다음에서 비활성화했습니다:
postRemoveTwoStepAuthentication-action = 계정 관리
postRemoveTwoStepAuthentication-not-required-2 = 로그인할 때 더 이상 인증 앱의 보안 코드가 필요하지 않습니다.
postSigninRecoveryCode-subject = 로그인에 사용된 백업 인증 코드
postSigninRecoveryCode-preview = 계정 활동 확인
postSigninRecoveryCode-title = 백업 인증 코드가 로그인에 사용되었습니다.
postSigninRecoveryCode-description = 이 일을 하지 않았다면 계정을 안전하게 보호하기 위해 즉시 비밀번호를 변경해야 합니다.
postSigninRecoveryCode-device = 다음에서 로그인:
postSigninRecoveryCode-action = 계정 관리
postSigninRecoveryPhone-subject = 로그인에 사용된 복구 전화번호
postSigninRecoveryPhone-preview = 계정 활동 확인
postSigninRecoveryPhone-title = 로그인에 복구 전화번호가 사용되었습니다.
postSigninRecoveryPhone-description = 이 일을 직접 하지 않았다면 계정을 안전하게 보호하기 위해 즉시 비밀번호를 변경해야 합니다.
postSigninRecoveryPhone-device = 다음에서 로그인:
postSigninRecoveryPhone-action = 계정 관리
postVerify-sub-title-3 = 만나서 반갑습니다!
postVerify-title-2 = 두 기기에서 동일한 탭을 보고 싶은가요?
postVerify-description-2 = 간단합니다! 다른 기기에 { -brand-firefox }를 설치하고 로그인하여 동기화하세요. 마법처럼요!
postVerify-sub-description = (잠깐… 또한 로그인 한 모든 곳에서 북마크, 암호 및 기타 { -brand-firefox } 데이터를 가져올 수 있습니다.)
postVerify-subject-4 = { -brand-mozilla }에 오신 것을 환영합니다!
postVerify-setup-2 = 다른 기기 연결:
postVerify-action-2 = 다른 기기 연결
postVerifySecondary-subject = 보조 이메일 주소를 추가했습니다
postVerifySecondary-title = 보조 이메일 주소를 추가했습니다
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = { -product-mozilla-account }에서 { $secondaryEmail }을 보조 이메일로 검증했습니다. 이제 보안 알림 및 로그인 확인은 두 이메일 주소로 전송됩니다.
postVerifySecondary-action = 계정 관리
recovery-subject = 비밀번호 재설정
recovery-title-2 = 비밀번호를 잊으셨습니까?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = 다음으로부터 { -product-mozilla-account } 비밀번호 변경 요청을 받았습니다:
recovery-new-password-button = 아래의 버튼을 클릭하여, 새 비밀번호를 만드세요. 링크는 한 시간 후 만료됩니다.
recovery-copy-paste = 아래 URL을 복사하고 브라우저에 붙여 넣어 새 비밀번호를 만드세요. 링크는 한 시간 후에 만료됩니다.
recovery-action = 새로운 비밀번호 생성
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = { $productName } 구독이 취소되었습니다.
subscriptionAccountDeletion-title = 가까운 시일 내에 다시 뵐 수 있기를 희망합니다.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 최근에 { -product-mozilla-account }를 삭제했습니다. 그 결과 귀하의 { $productName } 구독이 취소되었습니다. { $invoiceTotal }의 최종 결제는 { $invoiceDateOnly }에 이루어졌습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = { $productName }에 오신 것을 환영합니다: 비밀번호를 설정해주세요.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName }에 오신 것을 환영합니다.
subscriptionAccountFinishSetup-content-processing = 결제가 진행중이며 최대 4 영업일이 소요될 수 있습니다. 구독은 구독을 취소하지 않는 한 매 결제 시기마다 자동으로 갱신됩니다.
subscriptionAccountFinishSetup-content-create-3 = 다음으로 새로운 구독을 사용하기 위해 { -product-mozilla-account }의 비밀번호를 생성해야 합니다.
subscriptionAccountFinishSetup-action-2 = 시작하기
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
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName }의 결제 수단이 만료되었거나 곧 만료 예정
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } 결제 실패
subscriptionPaymentFailed-title = 죄송합니다, 결제에 문제가 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName }에 대한 최근 결제에 문제가 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName }에 대한 결제 정보 업데이트 필요
subscriptionPaymentProviderCancelled-title = 죄송합니다, 결제 수단에 문제가 있습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName }에 대한 결제 방법에 문제가 있습니다.
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
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = 현재 구독은 { $reminderLength }일 후 자동 갱신됩니다. { -brand-mozilla }가 { $planIntervalCount } { $planInterval } 구독을 갱신하고 계정에 등록된 결제 수단에 { $invoiceTotal } 상당을 청구할 예정입니다.
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
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } 구독에 대한 결제 정보 갱신 필요
subscriptionsPaymentProviderCancelled-title = 죄송합니다. 선택하신 결제 수단에 문제가 있습니다.
subscriptionsPaymentProviderCancelled-content-detected = 다음 구독에 대한 결제 방법에 문제가 있음을 감지했습니다.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } 결제 수신됨
subscriptionSubsequentInvoice-title = 구독해 주셔서 감사합니다!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName }에 대한 최근 결제가 접수되었습니다.
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
subscriptionUpgrade-existing = 기존 구독이 이번 업그레이드와 중복되는 경우, 이를 처리하여 세부 사항이 담긴 별도의 이메일을 보내드립니다. 새 요금제에 설치가 필요한 제품이 포함 된 경우 설정 지침이 포함된 별도의 이메일을 보내드립니다.
subscriptionUpgrade-auto-renew = 취소를 선택하지 않는 한 구독은 각 청구 기간을 자동으로 갱신합니다.
unblockCode-title = 로그인하신 게 맞나요?
unblockCode-prompt = 그렇다면 인증 코드를 사용하세요:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = 그렇다면 인증 코드를 사용하세요: { $unblockCode }
unblockCode-report = 그렇지 않은 경우, 침입자를 차단할 수 있도록 <a data-l10n-name="reportSignInLink">신고</a>바랍니다.
unblockCode-report-plaintext = 그렇지 않다면 침입자를 방어할 수 있도록 우리에게 알려 주세요.
verificationReminderFinal-subject = 계정 확인을 위한 최종 알림
verificationReminderFinal-description-2 = 몇 주 전에 { -product-mozilla-account }을 생성했지만 승인하지 않았습니다. 보안을 위해 24시간 내에 확인하지 않으면 계정이 삭제됩니다.
confirm-account = 계정 확인
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = 계정 확인을 잊지 마세요
verificationReminderFirst-title-3 = { -brand-mozilla }에 오신 것을 환영합니다!
verificationReminderFirst-description-3 = 며칠 전 { -product-mozilla-account }을 생성했지만 승인하지 않았습니다. 15일 내에 계정을 확인하지 않으면 자동으로 삭제됩니다.
verificationReminderFirst-sub-description-3 = 개인 정보 보호를 최우선으로 하는 브라우저를 놓치지 마세요.
confirm-email-2 = 계정 확인
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = 계정 확인
verificationReminderSecond-subject-2 = 계정 확인을 잊지 마세요
verificationReminderSecond-title-3 = { -brand-mozilla }를 놓치지 마세요!
verificationReminderSecond-description-4 = 며칠 전 { -product-mozilla-account } 계정을 생성했지만 승인하지 않았습니다. 10일 내에 계정을 확인하지 않으면 자동으로 삭제됩니다.
verificationReminderSecond-second-description-3 = { -product-mozilla-account }으로 기기 간 { -brand-firefox } 경험을 동기화하고 개인정보를 더욱 보호하는 { -brand-mozilla } 제품을 이용할 수 있습니다.
verificationReminderSecond-sub-description-2 = 인터넷을 모두에게 개방된 공간으로 변화시키려는 우리의 사명에 동참해 주세요.
verificationReminderSecond-action-2 = 계정 확인
verify-title-3 = { -brand-mozilla }로 인터넷을 여세요.
verify-description-2 = 계정을 확인하고, 모든 곳에서 { -brand-mozilla }를 최대한 활용하세요.
verify-subject = 계정 생성 완료
verify-action-2 = 계정 확인
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = { $clientName }에 로그인하셨나요?
verifyLogin-description-2 = 다음 서비스에서 발생한 로그인을 확인하여 계정을 안전하게 보호하세요.
verifyLogin-subject-2 = 로그인 확인
verifyLogin-action = 로그인 확인
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = { $serviceName }에 로그인하셨나요?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = 다음 기기에서 발생한 로그인을 확인하여 계정을 안전하게 보호하세요.
verifyLoginCode-prompt-3 = 만약 그렇다면, 검증 코드는 다음과 같습니다.
verifyLoginCode-expiry-notice = 5분 후에 만료됩니다.
verifyPrimary-title-2 = 기본 이메일 확인
verifyPrimary-description = 다음 기기에서 계정 변경을 수행하라는 요청이 있었습니다:
verifyPrimary-subject = 기본 이메일 확인
verifyPrimary-action-2 = 이메일 확인
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = 검증이 되면 이 기기에서 보조 이메일 추가와 같은 계정 변경이 가능합니다.
verifySecondaryCode-title-2 = 보조 이메일 확인
verifySecondaryCode-action-2 = 이메일 확인
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = 다음 { -product-mozilla-account }으로부터 { $email } 이메일을 보조 이메일 주소로 사용하기 위한 요청이 왔습니다:
verifySecondaryCode-prompt-2 = 인증 코드 사용:
verifySecondaryCode-expiry-notice-2 = 5분 후에 만료됩니다. 확인되면 이 주소는 보안 알림 및 확인을 받기 시작합니다.
verifyShortCode-title-3 = { -brand-mozilla }로 인터넷을 여세요.
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = 계정을 확인하고, 모든 곳에서 { -brand-mozilla }를 최대한 활용하세요.
verifyShortCode-prompt-3 = 인증 코드 사용:
verifyShortCode-expiry-notice = 5분 후에 만료됩니다.
