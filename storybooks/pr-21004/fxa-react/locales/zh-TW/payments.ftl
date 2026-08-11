# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = 帳號首頁
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = 已套用折扣碼
coupon-submit = 套用
coupon-remove = 移除
coupon-error = 您輸入的折扣碼無效或已失效。
coupon-error-generic = 處理代碼時發生錯誤，請再試一次。
coupon-error-expired = 您輸入的折扣碼已失效。
coupon-error-limit-reached = 您輸入的代碼已達使用次數上限。
coupon-error-invalid = 您輸入的代碼無效。
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = 輸入折扣碼

## Component - Fields

default-input-error = 此欄位必填
input-error-is-required = { $label } 必填

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } 標誌

## Component - NewUserEmailForm

new-user-sign-in-link-2 = 已經有 { -product-mozilla-account }了嗎？<a>點此登入</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = 輸入您的電子郵件地址
new-user-confirm-email =
    .label = 確認電子郵件信箱
new-user-subscribe-product-updates-mozilla = 我想要收到 { -brand-mozilla } 的產品新聞與更新資訊
new-user-subscribe-product-updates-snp = 我想要收到 { -brand-mozilla } 的安全性與隱私權新聞與更新資訊
new-user-subscribe-product-updates-hubs = 我想要收到 { -product-mozilla-hubs } 與 { -brand-mozilla } 的產品新聞與更新資訊
new-user-subscribe-product-updates-mdnplus = 我想要收到 { -product-mdn-plus } 與 { -brand-mozilla } 的產品新聞與更新資訊
new-user-subscribe-product-assurance = 我們只會使用您的電子郵件地址來註冊帳號，絕對不會銷售給第三方。
new-user-email-validate = 輸入的電子郵件信箱無效
new-user-email-validate-confirm = 兩次輸入的電子郵件信箱不相符
new-user-already-has-account-sign-in = 您已經註冊過帳號，<a>請登入</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = 輸錯信箱帳號了？{ $domain } 不提供郵件服務。

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = 感謝您！
payment-confirmation-thanks-heading-account-exists = 謝謝，接下來請到信箱收信！
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = 我們已將確認郵件發送到 { $email }，當中包含如何開始使用 { $product_name } 的相關資訊。
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = 您將會在 { $email } 收到一封信，當中包含如何設定帳號、付款方式的相關資訊。
payment-confirmation-order-heading = 訂單詳細資訊
payment-confirmation-invoice-number = 請款單號碼 #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = 付款資訊
payment-confirmation-amount = 每 { $interval } { $amount }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [1] 每天 { $amount }
       *[other] 每 { $intervalCount } 天 { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [1] 每週 { $amount }
       *[other] 每 { $intervalCount } 週 { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [1] 每個月 { $amount }
       *[other] 每 { $intervalCount } 個月 { $amount }
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [1] 每年 { $amount }
       *[other] 每 { $intervalCount } 年 { $amount }
    }
payment-confirmation-download-button = 前往下載

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = 我授權 { -brand-mozilla } 根據<termsOfServiceLink>服務條款</termsOfServiceLink>與<privacyNoticeLink>隱私權公告</privacyNoticeLink>的內容，對我的付款方式收取此費用，直到我主動取消訂閱為止。
payment-confirm-checkbox-error = 需要勾選此欄位才能繼續前往下一步

## Component - PaymentErrorView

payment-error-retry-button = 重試
payment-error-manage-subscription-button = 管理我的訂閱

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = 您已透過 { -brand-google } 或 { -brand-apple } 應用程式商店訂閱 { $productName }。
iap-upgrade-no-bundle-support = 我們目前暫時無法升級透過這些方式訂閱的方案，但此功能正在開發中。
iap-upgrade-contact-support = 您還是可以獲得此產品，請聯絡支援團隊，讓我們來協助。
iap-upgrade-get-help-button = 取得幫助

## Component - PaymentForm

payment-name =
    .placeholder = 持卡人姓名
    .label = 請輸入信用卡卡面上的姓名
payment-cc =
    .label = 您的卡片
payment-cancel-btn = 取消
payment-update-btn = 更新
payment-pay-btn = 現在付款
payment-pay-with-paypal-btn-2 = 使用 { -brand-paypal } 付款
payment-validate-name-error = 請輸入您的大名

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } 使用 { -brand-name-stripe } 與 { -brand-paypal } 來安全地處理交易款項。
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } 隱私權保護政策</stripePrivacyLink>&nbsp;<paypalPrivacyLink>{ -brand-paypal } 隱私權保護政策</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } 使用 { -brand-paypal } 來安全地處理交易款項。
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } 隱私權保護政策</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } 使用 { -brand-name-stripe } 來安全地處理交易款項。
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } 隱私權保護政策</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = 選擇付款方式
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = 請先授權付款訂閱

## Component - PaymentProcessing

payment-processing-message = 請稍候，正在處理付款…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = 卡號末四碼：{ $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = 使用 { -brand-paypal } 付款

## Component - PlanDetails

plan-details-header = 產品詳細資訊
plan-details-list-price = 原價
plan-details-show-button = 顯示詳細資訊
plan-details-hide-button = 隱藏詳細資訊
plan-details-total-label = 總計
plan-details-tax = 稅費

## Component - PlanErrorDialog

product-no-such-plan = 此產品無此方案。

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + 稅金 { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] 每天 { $priceAmount }
       *[other] 每 { $intervalCount } 天 { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每天 { $priceAmount }
           *[other] 每 { $intervalCount } 天 { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] 每週 { $priceAmount }
       *[other] 每 { $intervalCount } 週 { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每週 { $priceAmount }
           *[other] 每 { $intervalCount } 週 { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] 每個月 { $priceAmount }
       *[other] 每 { $intervalCount } 個月 { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每個月 { $priceAmount }
           *[other] 每 { $intervalCount } 個月 { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] 每年 { $priceAmount }
       *[other] 每 { $intervalCount } 年 { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每年 { $priceAmount }
           *[other] 每 { $intervalCount } 年 { $priceAmount }
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] 每天 { $priceAmount } + 稅金 { $taxAmount }
       *[other] 每 { $intervalCount } 天 { $priceAmount } + 稅金 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每天 { $priceAmount } + 稅金 { $taxAmount }
           *[other] 每 { $intervalCount } 天 { $priceAmount } + 稅金 { $taxAmount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] 每週 { $priceAmount } + 稅金 { $taxAmount }
       *[other] 每 { $intervalCount } 週 { $priceAmount }  + 稅金 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每週 { $priceAmount } + 稅金 { $taxAmount }
           *[other] 每 { $intervalCount } 週 { $priceAmount } + 稅金 { $taxAmount }
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] 每個月 { $priceAmount } + 稅金 { $taxAmount }
       *[other] 每 { $intervalCount } 個月 { $priceAmount } + 稅金 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每個月 { $priceAmount } + 稅金 { $taxAmount }
           *[other] 每 { $intervalCount } 個月 { $priceAmount } + 稅金 { $taxAmount }
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] 每年 { $priceAmount } + 稅金 { $taxAmount }
       *[other] 每 { $intervalCount } 年 { $priceAmount } + 稅金 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每年 { $priceAmount } + 稅金 { $taxAmount }
           *[other] 每 { $intervalCount } 年 { $priceAmount } + 稅金 { $taxAmount }
        }

## Component - SubscriptionTitle

subscription-create-title = 設定訂閱
subscription-success-title = 訂閱確認
subscription-processing-title = 正在確認訂閱…
subscription-error-title = 確認訂閱時發生錯誤…
subscription-noplanchange-title = 不支援更改此訂閱方案
subscription-iapsubscribed-title = 已經訂閱
sub-guarantee = 30 天內保證退款

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = 服務條款
privacy = 隱私權公告
terms-download = 下載條款

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox 帳號
# General aria-label for closing modals
close-aria =
    .aria-label = 關閉對話框
settings-subscriptions-title = 訂閱
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = 折扣碼

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] 每天 { $amount }
       *[other] 每 { $intervalCount } 天 { $amount }
    }
    .title =
        { $intervalCount ->
            [one] 每天 { $amount }
           *[other] 每 { $intervalCount } 天 { $amount }
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] 每週 { $amount }
       *[other] 每 { $intervalCount } 週 { $amount }
    }
    .title =
        { $intervalCount ->
            [one] 每週 { $amount }
           *[other] 每 { $intervalCount } 週 { $amount }
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] 每月 { $amount }
       *[other] 每 { $intervalCount } 個月 { $amount }
    }
    .title =
        { $intervalCount ->
            [one] 每月 { $amount }
           *[other] 每 { $intervalCount } 個月 { $amount }
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] 每年 { $amount }
       *[other] 每 { $intervalCount } 年 { $amount }
    }
    .title =
        { $intervalCount ->
            [one] 每年 { $amount }
           *[other] 每 { $intervalCount } 年 { $amount }
        }

## Error messages

# App error dialog
general-error-heading = 應用程式一般錯誤
basic-error-message = 某些東西不對勁，請稍候再試一次。
payment-error-1 = 取得款項授權時發生問題，請再試一次或與您的發卡單位聯繫。
payment-error-2 = 取得款項授權時發生問題，請與您的發卡單位聯繫。
payment-error-3b = 處理付款時發生未知錯誤，請再試一次。
expired-card-error = 您的信用卡已經過期，請改用其他卡片。
insufficient-funds-error = 您的卡片額度不足，請改用其他卡片。
withdrawal-count-limit-exceeded-error = 此交易會超過您的卡片可用額度，請改用其他卡片。
charge-exceeds-source-limit = 此交易會超過您的卡片單日可用額度，請改用其他卡片，或等 24 小時後再刷一次。
instant-payouts-unsupported = 看來您的 Debit Card 不允許即時付款，請改用其他卡片或信用卡。
duplicate-transaction = 看來已經有相同的交易發生過了，請檢查您的付款紀錄。
coupon-expired = 看來折扣碼已經失效。
card-error = 無法處理本交易。請檢查您的信用卡資訊後再試一次。
country-currency-mismatch = 您的付款方式所在的國家，無法使用此訂閱紀錄要使用的貨幣。
currency-currency-mismatch = 很抱歉，不能切換貨幣。
location-unsupported = 您目前的所在地點，不在我們的服務條款所支援的位置。
no-subscription-change = 很抱歉，無法更改您的訂閱方案。
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = 您已透過 { $mobileAppStore } 訂閱。
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = 系統發生錯誤，導致您的 { $productName } 註冊失敗。您並未被收費，請再試一次。
fxa-post-passwordless-sub-error = 已確認訂閱完成，但無法載入確認頁面。請到您的電子郵件信箱收信，繼續設定帳號。
newsletter-signup-error = 您並未註冊接收產品更新郵件，可以到帳戶設定頁面中再試一次。
product-plan-error =
    .title = 載入方案內容時發生問題
product-profile-error =
    .title = 載入個人資料時發生問題
product-customer-error =
    .title = 載入客戶資料時發生問題
product-plan-not-found = 找不到方案內容
product-location-unsupported-error = 不支援的地點

## Hooks - coupons

coupon-success = 您的訂閱方案將以牌告原價自動續約。
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = 您的方案將在 { $couponDurationDate } 之後依牌告原價自動續訂。

## Routes - Checkout - New user

new-user-step-1-2 = 1. 註冊 { -product-mozilla-account }
new-user-card-title = 輸入您的卡片資訊
new-user-submit = 立刻訂閱

## Routes - Product and Subscriptions

sub-update-payment-title = 付款資訊

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = 刷卡付款
product-invoice-preview-error-title = 載入請款單預覽頁面時發生問題
product-invoice-preview-error-text = 無法載入請款單預覽頁面

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = 我們暫時無法為您升級

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } 商店
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = 確認變更內容
sub-change-failed = 方案變更失敗
sub-update-acknowledgment = 您的方案內容會立刻變更，且會向您收取本帳務週期剩餘天數的差額。自 { $startingDate } 起將會向您收取全額。
sub-change-submit = 確認變更
sub-update-current-plan-label = 目前方案
sub-update-new-plan-label = 新方案
sub-update-total-label = 新方案金額
sub-update-prorated-upgrade = 按比例破月升級

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName }（每日收費）
sub-update-new-plan-weekly = { $productName }（每週收費）
sub-update-new-plan-monthly = { $productName }（每月收費）
sub-update-new-plan-yearly = { $productName }（每年收費）
sub-update-prorated-upgrade-credit = 下方的負值將轉為您帳號中的儲值餘額，並在後續付款時折抵。

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = 取消訂閱
sub-item-stay-sub = 保持訂閱

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = 在帳務週期最後一天（{ $period }）之後，將無法再使用 { $name }。
sub-item-cancel-confirm = 在 { $period }之後取消我對 { $name } 的使用權限與儲存的所有資訊
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
sub-promo-coupon-applied = 已套用「{ $promotion_name }」折扣碼：<priceDetails></priceDetails>
subscription-management-account-credit-balance = 這筆訂閱付款將把部分金額轉為您的儲值餘額：<priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = 重新訂閱失敗
sub-route-idx-cancel-failed = 訂閱取消失敗
sub-route-idx-contact = 聯絡支援團隊
sub-route-idx-cancel-msg-title = 很遺憾看到您離開
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg = 已取消您對 { $name } 的訂閱。<br />仍可繼續使用 { $name } 到 { $date }為止。
sub-route-idx-cancel-aside-2 = 有問題嗎？請到 <a>{ -brand-mozilla } Support</a>。

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = 載入客戶資料時發生問題
sub-invoice-error =
    .title = 載入請款單時發生問題
sub-billing-update-success = 成功更新帳務資訊！
sub-invoice-previews-error-title = 載入請款單預覽頁面時發生問題
sub-invoice-previews-error-text = 無法載入請款單預覽頁面

## Routes - Subscription - ActionButton

pay-update-change-btn = 變更
pay-update-manage-btn = 管理

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = 下次收費時間：{ $date }
sub-next-bill-due-date = 下次收費時間 { $date }
sub-expires-on = 於 { $date } 到期

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = 到期於 { $expirationDate }
sub-route-idx-updating = 正在更新帳務資訊…
sub-route-payment-modal-heading = 帳務資訊無效
sub-route-payment-modal-message-2 = 您的 { -brand-paypal } 帳號似乎發生問題，請採取下列步驟處理付款問題。
sub-route-missing-billing-agreement-payment-alert = 您的帳號發生問題，付款資訊無效。<div>點此管理</div>
sub-route-funding-source-payment-alert = 您的帳號發生問題，付款資訊無效。當您成功更新資訊後，可能要過一點時間此警示才會消失。<div>點此管理</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = 此訂閱內容無此方案。
invoice-not-found = 找不到後續請款單
sub-item-no-such-subsequent-invoice = 找不到此訂閱後續的請款單
sub-invoice-preview-error-title = 找不到請款單預覽頁面
sub-invoice-preview-error-text = 找不到此訂閱的請款單預覽頁面

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = 想要繼續使用 { $name } 嗎？
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy = 您可繼續使用 { $name }，帳務週期與付款內容將保持不變。下次將於 { $endDate }，對卡號結尾為 { $last } 的卡片收取 { $amount }。
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy = 您可繼續使用 { $name }，帳務週期與付款內容將保持不變。下次將於 { $endDate } 收取 { $amount }。
reactivate-confirm-button = 重新訂閱

## $date (Date) - Last day of product access

reactivate-panel-copy = 在 <strong>{ $date }</strong>之後，將無法再使用 { $name }。
reactivate-success-copy = 處理完成，感謝您！
reactivate-success-button = 關閉

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }：應用程式內購買
sub-iap-item-apple-purchase-2 = { -brand-apple }：應用程式內購買
sub-iap-item-manage-button = 管理
