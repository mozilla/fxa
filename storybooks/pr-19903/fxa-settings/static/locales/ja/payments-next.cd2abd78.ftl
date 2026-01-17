## Page

checkout-signin-or-create = 1. ログインするか { -product-mozilla-account }を作成する
continue-signin-with-google-button = { -brand-google } で続ける
continue-signin-with-apple-button = { -brand-apple } で続ける
next-payment-method-header = お支払い方法を選択してください
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = まず、サブスクリプションの承認が必要です。

## Authentication Error page

checkout-error-boundary-retry-button = 再試行
checkout-error-boundary-basic-error-message = 問題が発生しました。もう一度試すか、<contactSupportLink>サポートにお問い合わせください。</contactSupportLink>
amex-logo-alt-text = { -brand-amex } ロゴ
diners-logo-alt-text = { -brand-diner } ロゴ
discover-logo-alt-text = { -brand-discover } ロゴ
jcb-logo-alt-text = { -brand-jcb } ロゴ
mastercard-logo-alt-text = { -brand-mastercard } ロゴ
paypal-logo-alt-text = { -brand-paypal } ロゴ
unionpay-logo-alt-text = { -brand-unionpay } ロゴ
visa-logo-alt-text = { -brand-visa } ロゴ
link-logo-alt-text = { -brand-link } ロゴ
apple-pay-logo-alt-text = { -brand-apple-pay } ロゴ

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = サブスクリプションの管理
next-payment-error-retry-button = 再度お試しください
next-basic-error-message = 何か問題が発生しました。また後で試してください。

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = お支払いが処理されるまでお待ちください...

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = ありがとうございます。メールを確認してください。
next-payment-confirmation-order-heading = 注文詳細
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = 請求書番号 { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = 支払い情報

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = ダウンロードを続行

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = 下 4 桁が { $last4 } のカード

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = アカウントホーム

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = 私がサブスクリプションをキャンセルするまでの間、{ -brand-mozilla } が <termsOfServiceLink>サービス利用規約</termsOfServiceLink> と <privacyNoticeLink>プライバシーポリシー</privacyNoticeLink> に基づき、表示されている金額を指定の支払い方法で請求することを承認します。
next-payment-confirm-checkbox-error = 先へ進む前に、こちらに同意していただく必要があります。

## Checkout Form

next-new-user-submit = サブスクリプションを購入
next-pay-with-heading-paypal = { -brand-paypal } で支払う

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = コードを入力
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = プロモーションコード
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = プロモーションコードが適用されました
next-coupon-remove = 削除
next-coupon-submit = 適用

# Component - Header

payments-header-bento =
    .title = { -brand-mozilla } 製品
    .aria-label = { -brand-mozilla } 製品
    .alt = { -brand-mozilla } ロゴ
payments-header-bento-close =
    .alt = 閉じる
payments-header-bento-tagline = プライバシーを保護する他の { -brand-mozilla } の製品
payments-header-bento-firefox-desktop = デスクトップ版 { -brand-firefox } ブラウザー
payments-header-bento-firefox-mobile = モバイル版 { -brand-firefox } ブラウザー
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Made by { -brand-mozilla }
payments-header-avatar =
    .title = { -product-mozilla-account }メニュー
payments-header-avatar-icon =
    .alt = アカウントのプロファイル写真
payments-header-avatar-expanded-signed-in-as = ログイン中のアカウント
payments-header-avatar-expanded-sign-out = ログアウト
payments-client-loading-spinner =
    .aria-label = 読み込み中...
    .alt = 読み込み中...

## Component - PurchaseDetails

next-plan-details-header = 製品の詳細
next-plan-details-list-price = 定価
next-plan-details-tax = 税金と手数料
next-plan-details-total-label = 合計
next-plan-details-hide-button = 詳細を隠す
next-plan-details-show-button = 詳細を表示
next-coupon-success = プラン自動更新時の価格は定価になります。
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = プランは { $couponDurationDate } に自動更新され、価格は定価になります。

## Select Tax Location

select-tax-location-title = 地域
select-tax-location-edit-button = 編集
select-tax-location-save-button = 保存
select-tax-location-country-code-label = 国
select-tax-location-country-code-placeholder = 国を選択
select-tax-location-error-missing-country-code = 国を選択してください
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } はこの場所では利用できません。
select-tax-location-postal-code-label = 郵便番号
select-tax-location-postal-code =
    .placeholder = 郵便番号を入力
select-tax-location-error-missing-postal-code = 郵便番号を入力してください
select-tax-location-error-invalid-postal-code = 正しい郵便番号を入力してください
select-tax-location-successfully-updated = 地域情報が更新されました。
select-tax-location-error-location-not-updated = 地域情報を更新できませんでした。もう一度お試しください。
signin-form-continue-button = 続ける
signin-form-email-input = メールアドレスを入力
signin-form-email-input-missing = メールアドレスを入力してください
signin-form-email-input-invalid = 正しいメールアドレスを入力してください
next-new-user-subscribe-product-updates-mdnplus = { -product-mdn-plus } と { -brand-mozilla } から製品ニュースと最新情報を受け取りたい
next-new-user-subscribe-product-updates-mozilla = { -brand-mozilla } から製品ニュースと最新情報を受け取りたい
next-new-user-subscribe-product-updates-snp = { -brand-mozilla } からセキュリティとプライバシーに関するニュースと最新情報を受け取りたい
next-new-user-subscribe-product-assurance = 私たちは、あなたのメールアドレスをアカウント作成にのみ使用し、この個人情報を第三者に販売しません。

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = 毎日 { $amount }
plan-price-interval-weekly = 毎週 { $amount }
plan-price-interval-monthly = 毎月 { $amount }
plan-price-interval-yearly = 毎年 { $amount }

## Component - SubscriptionTitle

next-subscription-create-title = サブスクリプションを設定する
next-subscription-success-title = サブスクリプションの確認
next-subscription-processing-title = サブスクリプション確認中...
next-subscription-error-title = サブスクリプションの確認中にエラーが発生しました...
next-sub-guarantee = 30 日間の返金保証

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = 利用規約
next-privacy = プライバシー通知
next-terms-download = 利用規約をダウンロード
