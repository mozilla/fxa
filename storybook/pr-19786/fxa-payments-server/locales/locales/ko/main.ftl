



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox 계정
-product-mozilla-account = Mozilla 계정
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla 계정
       *[lowercase] Mozilla 계정
    }
-product-firefox-account = Firefox 계정
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
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = 아메리칸 익스프레스
-brand-diners = 다이너스 클럽
-brand-discover = 디스커버 카드
-brand-jcb = JCB
-brand-mastercard = 마스터카드
-brand-unionpay = 은련페이
-brand-visa = 비자카드
-app-store = App Store
-google-play = Google Play

app-general-err-heading = 일반 애플리케이션 오류
app-general-err-message = 문제가 발생했습니다. 나중에 다시 시도하세요.
app-query-parameter-err-heading = 잘못된 요청: 유효하지 않은 쿼리 파라미터


app-footer-mozilla-logo-label = { -brand-mozilla } 로고
app-footer-privacy-notice = 웹 사이트 개인정보 보호정책
app-footer-terms-of-service = 이용 약관


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = 새 창에서 열림


app-loading-spinner-aria-label-loading = 로드 중…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m 로고



settings-home = 계정 홈
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = 프로모션 코드 적용됨
coupon-submit = 적용
coupon-remove = 삭제
coupon-error = 입력한 코드는 유효하지 않거나 만료되었습니다.
coupon-error-generic = 코드 처리 과정에서 오류가 발생했습니다. 다시 시도해 주세요.
coupon-error-expired = 입력한 코드가 만료되었습니다.
coupon-error-limit-reached = 입력한 코드가 제한에 도달했습니다.
coupon-error-invalid = 입력한 코드가 유효하지 않습니다.
coupon-enter-code =
    .placeholder = 코드 입력


default-input-error = 필수 항목입니다
input-error-is-required = { $label }이(가) 필요합니다


brand-name-mozilla-logo = { -brand-mozilla } 로고


new-user-sign-in-link-2 = 이미 { -product-mozilla-account }계정을 갖고 계신가요? <a>로그인</a>
new-user-enter-email =
    .label = 이메일 입력
new-user-confirm-email =
    .label = 이메일 확인
new-user-subscribe-product-updates-mozilla = { -brand-mozilla }로부터 제품 뉴스와 최신정보를 받습니다.
new-user-subscribe-product-updates-snp = { -brand-mozilla }로부터 보안과 개인 정보에 대한 소식 및 최신 정보를 받습니다.
new-user-subscribe-product-updates-hubs = { -product-mozilla-hubs } 및 { -brand-mozilla }에서 제품 소식과 업데이트를 받고 싶습니다.
new-user-subscribe-product-updates-mdnplus = { -product-mdn-plus } 및 { -brand-mozilla }에서 제품 소식 및 최신 정보를 받고 싶습니다.
new-user-subscribe-product-assurance = 이메일은 오직 계정을 만드는 데만 사용됩니다. 절대 제3자에게 판매하지 않습니다.
new-user-email-validate = 유효하지 않은 이메일
new-user-email-validate-confirm = 이메일이 맞지 않습니다.
new-user-already-has-account-sign-in = 이미 계정이 존재합니다. <a>로그인</a>
new-user-invalid-email-domain = 이메일을 잘못 입력하셨나요? { $domain }이 이메일 서비스를 제공하지 않습니다.


payment-confirmation-thanks-heading = 감사합니다!
payment-confirmation-thanks-heading-account-exists = 감사합니다. 지금 메일을 확인해 보세요!
payment-confirmation-thanks-subheading = { $product_name }를 시작하는 방법에 대한 자세한 내용이 담긴 확인 메일이 { $email } 주소로 발송되었습니다.
payment-confirmation-thanks-subheading-account-exists = { $email } 주소로 계정 설정 지침과 결제 세부정보가 포함된 이메일을 받게 됩니다.
payment-confirmation-order-heading = 주문 정보
payment-confirmation-invoice-number = 영수증 # { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = 결제 정보
payment-confirmation-amount = { $interval } 당 { $amount }
payment-confirmation-amount-day =
    { $intervalCount ->
       *[other] { $amount } 매 { $intervalCount } 일마다
    }
payment-confirmation-amount-week =
    { $intervalCount ->
       *[other] { $amount } 매 { $intervalCount } 주마다
    }
payment-confirmation-amount-month =
    { $intervalCount ->
       *[other] { $amount } 매 { $intervalCount } 개월마다
    }
payment-confirmation-amount-year =
    { $intervalCount ->
       *[other] { $amount } 매 { $intervalCount } 년마다
    }
payment-confirmation-download-button = 다운로드 계속 하기


payment-confirm-with-legal-links-static-3 = <termsOfServiceLink>이용 약관</termsOfServiceLink> 및 <privacyNoticeLink>개인 정보 보호정책</privacyNoticeLink>에 따라, 구독을 취소하기 전까지 { -brand-mozilla }가 표시된 금액을 내 결제 수단에 청구하도록 허가합니다.
payment-confirm-checkbox-error = 계속 진행하기 전에 이 작업을 완료해야 합니다.


payment-error-retry-button = 다시 시도하세요
payment-error-manage-subscription-button = 내 구독 관리


iap-upgrade-already-subscribed-2 = 이미 { -brand-google } 또는 { -brand-apple } 앱 스토어를 통해 { $productName } 구독을 하고 있습니다.
iap-upgrade-no-bundle-support = 이러한 구독에 대한 업그레이드는 지원되지 않지만 곧 지원될 예정입니다.
iap-upgrade-contact-support = 아직 이 제품을 구매할 수 있습니다. 지원팀에 문의하시면 도와드리겠습니다.
iap-upgrade-get-help-button = 도움말


payment-name =
    .placeholder = 이름 (영문)
    .label = 신용 카드 내 이름
payment-cc =
    .label = 나의 카드
payment-cancel-btn = 취소
payment-update-btn = 업데이트
payment-pay-btn = 지금 지불
payment-pay-with-paypal-btn-2 = { -brand-paypal }로 결제
payment-validate-name-error = 이름을 입력하세요


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla }는 안전한 결제 처리를 위해 { -brand-name-stripe }와 { -brand-paypal }을 사용합니다.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } 개인정보 보호 정책</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } 개인정보 보호 정책</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla }는 안전한 결제 처리를 위해 { -brand-paypal }을 사용합니다.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } 개인정보 보호정책</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla }는 안전한 결제 처리를 위해 { -brand-name-stripe }를 사용합니다.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } 개인정보 처리방침</stripePrivacyLink>


payment-method-header = 지불 방법 선택
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = 먼저 구독을 승인해야 합니다.


payment-processing-message = 결제를 처리하는 동안 잠시 기다려 주세요…


payment-confirmation-cc-card-ending-in = 끝자리가 { $last4 } 인 카드


pay-with-heading-paypal-2 = { -brand-paypal }로 결제


plan-details-header = 제품 세부 정보
plan-details-list-price = 정가
plan-details-show-button = 상세 정보 보기
plan-details-hide-button = 상세 내용 숨기기
plan-details-total-label = 전체
plan-details-tax = 세금 및 수수료


product-no-such-plan = 이 제품에 관련 구독 정보가 없음


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } 세금
price-details-no-tax-day = { $intervalCount }일 마다 { $priceAmount }
    .title = { $intervalCount }일 마다 { $priceAmount }
price-details-no-tax-week = { $intervalCount }주 마다 { $priceAmount }
    .title = { $intervalCount }주 마다 { $priceAmount }
price-details-no-tax-month = { $intervalCount }달 마다 { $priceAmount }
    .title = { $intervalCount }달 마다 { $priceAmount }
price-details-no-tax-year = { $intervalCount }년 마다 { $priceAmount }
    .title = { $intervalCount }년 마다 { $priceAmount }
price-details-tax-day = { $intervalCount }일 마다 { $priceAmount } + 세금 { $taxAmount }
    .title = { $intervalCount }일 마다 { $priceAmount } + 세금 { $taxAmount }
price-details-tax-week = { $intervalCount }주 마다 { $priceAmount } + 세금 { $taxAmount }
    .title = { $intervalCount }주 마다 { $priceAmount } + 세금 { $taxAmount }
price-details-tax-month = { $intervalCount }달 마다 { $priceAmount } + 세금 { $taxAmount }
    .title = { $intervalCount }달 마다 { $priceAmount } + 세금 { $taxAmount }
price-details-tax-year = { $intervalCount }년 마다 { $priceAmount } + 세금 { $taxAmount }
    .title = { $intervalCount }년 마다 { $priceAmount } + 세금 { $taxAmount }


subscription-create-title = 구독 설정
subscription-success-title = 구독 확인
subscription-processing-title = 구독 확인 중…
subscription-error-title = 구독 확인 오류…
subscription-noplanchange-title = 해당 구독 일정 변경이 지원되지 않습니다.
subscription-iapsubscribed-title = 이미 구독 중
sub-guarantee = 30 일 환불 보장


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = 서비스 약관
privacy = 개인정보 보호정책
terms-download = 약관 다운로드


document =
    .title = Firefox 계정
close-aria =
    .aria-label = 모달 닫기
settings-subscriptions-title = 구독 정보
coupon-promo-code = 프로모션 코드


plan-price-interval-day = { $intervalCount }일 마다 { $amount }
    .title = { $intervalCount }일 마다 { $amount }
plan-price-interval-week = { $intervalCount }주 마다 { $amount }
    .title = { $intervalCount }주 마다 { $amount }
plan-price-interval-month = { $intervalCount }달 마다 { $amount }
    .title = { $intervalCount }달 마다 { $amount }
plan-price-interval-year = { $intervalCount }년 마다 { $amount }
    .title = { $intervalCount }년 마다 { $amount }


general-error-heading = 일반 응용 프로그램 오류
basic-error-message = 문제가 발생했습니다. 나중에 다시 시도하세요.
payment-error-1 = 결제를 승인하는 동안 문제가 발생했습니다. 다시 시도하거나 카드사에 연락하세요.
payment-error-2 = 결제를 승인하는 동안 문제가 발생했습니다. 카드사에 연락하세요.
payment-error-3b = 결제를 처리하는 동안 예기치 않은 오류가 발생했습니다. 다시 시도하십시오.
expired-card-error = 신용 카드 유효 기간이 만료된 것 같습니다. 다른 카드를 사용해보세요.
insufficient-funds-error = 카드 잔액이 부족한 것 같습니다. 다른 카드를 사용해보세요.
withdrawal-count-limit-exceeded-error = 이 거래로 신용 한도를 초과한 것으로 보입니다. 다른 카드를 사용해보세요.
charge-exceeds-source-limit = 이 거래로 일일 신용 한도를 초과한 것으로 보입니다. 다른 카드를 사용하거나 24시간 후에 시도해 보세요.
instant-payouts-unsupported = 직불 카드가 즉시 결제를 할 수 있도록 설정되어 있지 않은 것 같습니다. 다른 직불 카드나 신용 카드를 사용해 보세요.
duplicate-transaction = 방금 전 동일한 거래가 이뤄진 것 같습니다. 결제 내역을 확인해 보세요.
coupon-expired = 프로모션 코드가 만료된 것 같습니다.
card-error = 거래를 처리할 수 없습니다. 신용 카드 정보를 확인한 후 다시 시도하세요.
country-currency-mismatch = 이 구독의 통화는 결제한 국가에서 유효하지 않습니다.
currency-currency-mismatch = 죄송합니다. 통화간의 전환을 할 수 없습니다.
location-unsupported = 이용 약관에 따라 현재 지역에서는 지원하지 않습니다.
no-subscription-change = 죄송합니다. 구독 일정을 변경할 수 없습니다.
iap-already-subscribed = { $mobileAppStore }를 통해 이미 구독 중입니다.
fxa-account-signup-error-2 = 시스템 오류로 { $productName } 가입에 실패했습니다. 귀하의 지불 방식은 청구되지 않았습니다. 다시 시도해 주세요.
fxa-post-passwordless-sub-error = 구독이 확인되었지만 확인 페이지를 로드하지 못했습니다. 이메일을 확인하여 계정을 설정하세요.
newsletter-signup-error = 제품 업데이트 이메일에 가입되지 않았습니다. 계정 설정에서 다시 시도해 보세요.
product-plan-error =
    .title = 구독 정보 읽기 문제
product-profile-error =
    .title = 프로필 로드 문제
product-customer-error =
    .title = 고객 정보 읽기 문제
product-plan-not-found = 사용 계획 찾을 수 없음
product-location-unsupported-error = 지원되지 않는 지역


coupon-success = 요금제는 정가로 자동 갱신됩니다.
coupon-success-repeating = 요금제는 { $couponDurationDate } 이후 정가로 자동 갱신됩니다.


new-user-step-1-2 = 1. { -product-mozilla-account }를 생성하세요.
new-user-card-title = 카드 정보를 입력하세요.
new-user-submit = 지금 구독하기


sub-update-payment-title = 결제 정보


pay-with-heading-card-only = 카드로 결제
product-invoice-preview-error-title = 송장 미리보기 로딩 중 문제 발생
product-invoice-preview-error-text = 송장 미리보기를 로드할 수 없습니다.


subscription-iaperrorupgrade-title = 아직 업그레이드할 수 없습니다.


brand-name-google-play-2 = { -google-play } 스토어
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = 변경사항 검토
sub-change-failed = 플랜 변경 실패
sub-update-acknowledgment =
    요금제가 즉시 변경되며 
    결제 주기의 나머지 기간 동안 비례 배분된 금액입니다. { $startingDate }일 부터
    전체 금액이 청구됩니다.
sub-change-submit = 변경 확인
sub-update-current-plan-label = 현재 구독 정보
sub-update-new-plan-label = 신규 구독 정보
sub-update-total-label = 총
sub-update-prorated-upgrade = 비례 업그레이드


sub-update-new-plan-daily = { $productName } (매일)
sub-update-new-plan-weekly = { $productName }(매주)
sub-update-new-plan-monthly = { $productName } (월간)
sub-update-new-plan-yearly = { $productName } (연간)
sub-update-prorated-upgrade-credit = 표시된 음수 잔액은 귀하의 계정에 크레딧으로 적용되고 향후 청구서 결제에 사용됩니다.


sub-item-cancel-sub = 구독 취소
sub-item-stay-sub = 구독 유지


sub-item-cancel-msg =
    이후에는 더 이상 { $name }을 사용할 수 없습니다.
    { $period } 결제 주기의 마지막 날입니다.
sub-item-cancel-confirm =
    내 접근 정보 취소
    { $period } 중 { $name }
sub-promo-coupon-applied = { $promotion_name } 쿠폰 적용됨: <priceDetails></priceDetails>
subscription-management-account-credit-balance = 이 구독 결제로 계정 잔액에 크레딧이 추가됐습니다: <priceDetails></priceDetails>


sub-route-idx-reactivating = 구독 재활성 실패
sub-route-idx-cancel-failed = 구독 취소 실패
sub-route-idx-contact = 연락하기
sub-route-idx-cancel-msg-title = 계속 진행할 수 없어 죄송합니다.
sub-route-idx-cancel-msg =
    { $name } 구독이 취소되었습니다.
          <br />
          { $date }까지 { $name }에 계속 접근할 수 있습니다.
sub-route-idx-cancel-aside-2 = 질문이 있으신가요? <a>{ -brand-mozilla } 지원</a>을 방문하세요.


sub-customer-error =
    .title = 고객 정보 읽기 문제
sub-invoice-error =
    .title = 청구서 읽기 오류
sub-billing-update-success = 결제 정보가 성공적으로 업데이트되었습니다.
sub-invoice-previews-error-title = 송장 미리보기 로딩 문제
sub-invoice-previews-error-text = 송장 미리보기를 로드할 수 없습니다.


pay-update-change-btn = 변경
pay-update-manage-btn = 관리


sub-next-bill = 다음 청구일: { $date }
sub-next-bill-due-date = 다음 청구서는 { $date }까지 입니다.
sub-expires-on = { $date }에 만료




pay-update-card-exp = 만료 { $expirationDate }
sub-route-idx-updating = 결제 정보 업데이트중…
sub-route-payment-modal-heading = 유효하지 않은 결제 정보
sub-route-payment-modal-message-2 = { -brand-paypal } 계정에 오류가 있는 것 같습니다. 이 결제 문제를 해결하기 위해 필요한 조치를 취해 주시기 바랍니다.
sub-route-missing-billing-agreement-payment-alert = 유효하지 않은 결제 정보입니다. 계정에 오류가 있습니다. <div>관리</div>
sub-route-funding-source-payment-alert = 유효하지 않은 결제 정보입니다. 계정에 오류가 있습니다. 정보를 성공적으로 업데이트한 후 이 알림이 지워지는 데까지 시간이 걸릴 수 있습니다. <div>관리</div>


sub-item-no-such-plan = 관련 구독 정보가 없습니다.
invoice-not-found = 다음 청구서를 찾을 수 없습니다.
sub-item-no-such-subsequent-invoice = 이 구독에 대한 다음 청구서를 찾을 수 없습니다.
sub-invoice-preview-error-title = 송장 미리보기를 찾을 수 없습니다
sub-invoice-preview-error-text = 이 구독에 대한 송장 미리보기를 찾을 수 없습니다.


reactivate-confirm-dialog-header = { $name }을 계속 사용하시겠습니까?
reactivate-confirm-copy =
    { $name }에 대한 접근은 계속되며 
    결제 주기 지불은 동일하게 유지됩니다. 다음 청구는
    { $amount }을 { $endDate }에 { $last }로 끝나는 카드로 결제됩니다.
reactivate-confirm-without-payment-method-copy =
    { $name }에 대한 접근은 계속되며 결제 주기와
    지불은 동일하게 유지됩니다. 다음에는
    { $endDate }의 { $amount }을 청구 합니다.
reactivate-confirm-button = 재구독


reactivate-panel-copy = <strong> { $date } </strong>에 { $name }에 대한 접근 권한이 해지됩니다.
reactivate-success-copy = 감사합니다! 모두 준비되었습니다.
reactivate-success-button = 닫기


sub-iap-item-google-purchase-2 = { -brand-google }: 앱 내 구매
sub-iap-item-apple-purchase-2 = { -brand-apple }: 앱 내 구매
sub-iap-item-manage-button = 관리
