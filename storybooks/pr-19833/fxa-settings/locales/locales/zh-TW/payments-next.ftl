loyalty-discount-terms-heading = 條款與限制
loyalty-discount-terms-support = 聯絡支援團隊
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = 聯絡 { $productName } 的支援團隊
not-found-page-title-terms = 找不到頁面
not-found-page-description-terms = 找不到您想開啟的頁面。
not-found-page-button-terms-manage-subscriptions = 管理訂閱

## Page

checkout-signin-or-create = 1. 登入或註冊 { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = 或
continue-signin-with-google-button = 使用 { -brand-google } 帳號繼續
continue-signin-with-apple-button = 使用 { -brand-apple } 帳號繼續
next-payment-method-header = 選擇付款方式
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = 請先授權付款訂閱
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = 選擇您所在的國家並輸入您的郵遞區號，<p>即可繼續為 { $productName } 結帳</p>
location-banner-info = 無法自動偵測您的位置
location-required-disclaimer = 我們只使用此資訊來計算稅金與幣別。
location-banner-currency-change = 不支援以外幣結帳。若要繼續，請選擇符合您目前結帳幣別的國家。

## Page - Upgrade page

upgrade-page-payment-information = 付款資訊
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = 您的方案內容會立刻變更，且會向您收取本帳務週期剩餘天數的差額。自 { $nextInvoiceDate } 起將會向您收取全額。

## Authentication Error page

auth-error-page-title = 無法讓您登入
checkout-error-boundary-retry-button = 重試
checkout-error-boundary-basic-error-message = 有些東西不對勁，請再試一次或<contactSupportLink>聯絡我們的技術支援團隊。</contactSupportLink>
amex-logo-alt-text = { -brand-amex } 圖示
diners-logo-alt-text = { -brand-diner } 圖示
discover-logo-alt-text = { -brand-discover } 圖示
jcb-logo-alt-text = { -brand-jcb } 圖示
mastercard-logo-alt-text = { -brand-mastercard } 圖示
paypal-logo-alt-text = { -brand-paypal } 圖示
unionpay-logo-alt-text = { -brand-unionpay } 圖示
visa-logo-alt-text = { -brand-visa } 圖示
# Alt text for generic payment card logo
unbranded-logo-alt-text = 無品牌圖示
link-logo-alt-text = { -brand-link } 圖示
apple-pay-logo-alt-text = { -brand-apple-pay } 圖示
google-pay-logo-alt-text = { -brand-google-pay } 圖示

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = 管理我的訂閱
next-iap-blocked-contact-support = 您有一套行動版的應用程式內訂閱，與此產品相衝突。請聯絡支援團隊，讓我們來協助。
next-payment-error-retry-button = 重試
next-basic-error-message = 某些東西不對勁，請稍候再試一次。
checkout-error-contact-support-button = 聯絡支援團隊
checkout-error-not-eligible = 您無法訂閱此產品，請聯絡支援團隊，讓我們來協助。
checkout-error-already-subscribed = 您已訂閱此產品。
checkout-error-contact-support = 請聯絡支援團隊，讓我們來協助。
cart-error-currency-not-determined = 無法確認此次購買使用的貨幣，請重試。
checkout-processing-general-error = 處理付款時發生未知錯誤，請再試一次。
cart-total-mismatch-error = 金額已變動，請再試一次。

## Error pages - Payment method failure messages

intent-card-error = 無法處理本交易。請檢查您的信用卡資訊後再試一次。
intent-expired-card-error = 您的信用卡已經過期，請改用其他卡片。
intent-payment-error-try-again = 取得款項授權時發生問題，請再試一次或與您的發卡單位聯繫。
intent-payment-error-get-in-touch = 取得款項授權時發生問題，請與您的發卡單位聯繫。
intent-payment-error-generic = 處理付款時發生未知錯誤，請再試一次。
intent-payment-error-insufficient-funds = 您的卡片額度不足，請改用其他卡片。
general-paypal-error = 處理付款時發生未知錯誤，請再試一次。
paypal-active-subscription-no-billing-agreement-error = 看來向您的 { -brand-paypal } 帳號扣款時發生問題，請為您的訂閱項目重新開啟自動付款。

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = 請稍候，正在處理付款…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = 謝謝，接下來請到信箱收信！
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = 您將會在 { $email } 收到一封信，當中包含訂閱內容、付款方式的相關資訊。
next-payment-confirmation-order-heading = 訂單詳細資訊
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = 請款單號碼 #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = 付款資訊

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = 前往下載

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = 卡號末四碼：{ $last4 }

## Not found page

not-found-title-subscriptions = 找不到訂閱紀錄
not-found-description-subscriptions = 找不到您的訂閱紀錄，請再試一次或聯絡支援團隊。
not-found-button-back-to-subscriptions = 回到訂閱項目

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = 未新增付款方式
subscription-management-page-banner-warning-link-no-payment-method = 新增付款方式
subscription-management-subscriptions-heading = 訂閱項目
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = 跳到
subscription-management-nav-payment-details = 付款詳細資訊
subscription-management-nav-active-subscriptions = 有效訂閱
subscription-management-payment-details-heading = 付款詳細資訊
subscription-management-email-label = 電子郵件地址
subscription-management-credit-balance-label = 儲值餘額
subscription-management-credit-balance-message = 未來付款時，將自動使用儲值餘額折抵應付款項
subscription-management-payment-method-label = 付款方式
subscription-management-button-add-payment-method-aria = 新增付款方式
subscription-management-button-add-payment-method = 新增
subscription-management-page-warning-message-no-payment-method = 請新增付款方式以避免訂閱中斷。
subscription-management-button-manage-payment-method-aria = 管理付款方式
subscription-management-button-manage-payment-method = 管理
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = 卡號末四碼：{ $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = 到期於 { $expirationDate }
subscription-management-active-subscriptions-heading = 有效訂閱
subscription-management-you-have-no-active-subscriptions = 您沒有有效訂閱
subscription-management-new-subs-will-appear-here = 新的訂閱紀錄將顯示於此處。
subscription-management-your-active-subscriptions-aria = 您的有效訂閱
subscription-management-button-support = 取得幫助
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = 取得 { $productName } 的協助
subscription-management-your-apple-iap-subscriptions-aria = 您的 { -brand-apple } 應用程式內訂閱項目
subscription-management-apple-in-app-purchase-2 = { -brand-apple } 應用程式內購買
subscription-management-your-google-iap-subscriptions-aria = 您的 { -brand-google } 應用程式內訂閱項目
subscription-management-google-in-app-purchase-2 = { -brand-google } 應用程式內購買
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = 於 { $date } 到期
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = 管理 { $productName } 訂閱
subscription-management-button-manage-subscription-1 = 管理訂閱
error-payment-method-banner-title-expired-card = 卡片已過期
error-payment-method-banner-message-add-new-card = 請新增卡片或其他付款方式以避免訂閱中斷。
error-payment-method-banner-label-update-payment-method = 更新付款方式
error-payment-method-expired-card = 您的卡片已過期。請新增卡片或其他付款方式以避免訂閱中斷。
error-payment-method-banner-title-invalid-payment-information = 付款資訊無效
error-payment-method-banner-message-account-issue = 您的帳號發生問題。
subscription-management-button-manage-payment-method-1 = 管理付款方式
subscription-management-error-apple-pay = 您的 { -brand-apple-pay } 帳號發生問題。請解決此問題以繼續維持訂閱。
subscription-management-error-google-pay = 您的 { -brand-google-pay } 帳號發生問題。請解決此問題以繼續維持訂閱。
subscription-management-error-link = 您的 { -brand-link } 帳號發生問題。請解決此問題以繼續維持訂閱。
subscription-management-error-paypal-billing-agreement = 您的 { -brand-paypal } 帳號發生問題。請解決此問題以繼續維持訂閱。
subscription-management-error-payment-method = 您的付款方式發生問題。請解決此問題以繼續維持訂閱。
manage-payment-methods-heading = 管理付款方式
paypal-payment-management-page-invalid-header = 帳務資訊無效
paypal-payment-management-page-invalid-description = 您的 { -brand-paypal } 帳號似乎發生問題，請採取下列步驟處理付款問題。
# Page - Not Found
page-not-found-title = 找不到頁面
page-not-found-description = 找不到您想開啟的頁面。我們已經通知開發團隊來檢查網頁。
page-not-found-back-button = 回上一頁
alert-dialog-title = 警告對話框

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = 帳號首頁
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = 訂閱
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = 管理付款方式
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = 回到{ $page }

## CancelSubscription

subscription-cancellation-dialog-title = 很抱歉看到您離開
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = 已取消您對 { $name } 的訂閱，您仍可繼續使用 { $name } 到 { $date } 為止。
subscription-cancellation-dialog-aside = 有問題嗎？請到 <LinkExternal>{ -brand-mozilla } 技術支援站</LinkExternal>。
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = 取消訂閱 { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = 在帳務週期最後一天（{ $currentPeriodEnd }）之後，將無法繼續使用 { $productName }。
subscription-content-cancel-access-message = 在 { $currentPeriodEnd } 之後取消我對 { $productName } 的使用權限與儲存的所有資訊

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = 取消訂閱
    .aria-label = 取消您的 { $productName } 訂閱
cancel-subscription-button-stay-subscribed = 保持訂閱
    .aria-label = 保持訂閱 { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = 我授權 { -brand-mozilla } 根據<termsOfServiceLink>服務條款</termsOfServiceLink>與<privacyNoticeLink>隱私權公告</privacyNoticeLink>的內容，對我的付款方式收取此費用，直到我主動取消訂閱為止。
next-payment-confirm-checkbox-error = 需要勾選此欄位才能繼續前往下一步

## Checkout Form

next-new-user-submit = 立刻訂閱
next-pay-with-heading-paypal = 使用 { -brand-paypal } 付款

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = 輸入折扣碼
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = 折扣碼
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = 已套用折扣碼
next-coupon-remove = 移除
next-coupon-submit = 套用

# Component - Header

payments-header-help =
    .title = 說明
    .aria-label = 說明
    .alt = 說明
payments-header-bento =
    .title = { -brand-mozilla } 產品
    .aria-label = { -brand-mozilla } 產品
    .alt = { -brand-mozilla } 圖示
payments-header-bento-close =
    .alt = 關閉
payments-header-bento-tagline = { -brand-mozilla } 更多會保護您隱私的產品
payments-header-bento-firefox-desktop = { -brand-firefox } 瀏覽器桌面版
payments-header-bento-firefox-mobile = { -brand-firefox } 瀏覽器行動版
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = 由 { -brand-mozilla } 打造
payments-header-avatar =
    .title = { -product-mozilla-account } 選單
payments-header-avatar-icon =
    .alt = 帳號個人資料照片
payments-header-avatar-expanded-signed-in-as = 已登入為
payments-header-avatar-expanded-sign-out = 登出
payments-client-loading-spinner =
    .aria-label = 載入中…
    .alt = 載入中…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = 設為預設付款方式
# Save button for saving a new payment method
payment-method-management-save-method = 儲存付款方式
manage-stripe-payments-title = 管理付款方式

## Component - PurchaseDetails

next-plan-details-header = 產品詳細資訊
next-plan-details-list-price = 原價
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = { $productName } 按比例破月計算的價格
next-plan-details-tax = 稅費
next-plan-details-total-label = 總計
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = 未使用期間轉儲值餘額
purchase-details-subtotal-label = 小計
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = 已套用儲值餘額
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = 應收總額
next-plan-details-hide-button = 隱藏詳細資訊
next-plan-details-show-button = 顯示詳細資訊
next-coupon-success = 您的訂閱方案將以牌告原價自動續約。
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = 您的方案將在 { $couponDurationDate } 之後依牌告原價自動續訂。

## Select Tax Location

select-tax-location-title = 位置
select-tax-location-edit-button = 編輯
select-tax-location-save-button = 儲存
select-tax-location-continue-to-checkout-button = 繼續結帳
select-tax-location-country-code-label = 國家
select-tax-location-country-code-placeholder = 選擇您的國家
select-tax-location-error-missing-country-code = 請選擇您的國家
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = 此地點無法使用 { $productName }。
select-tax-location-postal-code-label = 郵遞區號
select-tax-location-postal-code =
    .placeholder = 請輸入您的郵遞區號
select-tax-location-error-missing-postal-code = 請輸入您的郵遞區號
select-tax-location-error-invalid-postal-code = 請輸入有效的郵遞區號
select-tax-location-successfully-updated = 已更新您的地點。
select-tax-location-error-location-not-updated = 無法更新您的地點，請再試一次。
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = 您的帳號以 { $currencyDisplayName } 收費。請選擇使用 { $currencyDisplayName } 的國家。
select-tax-location-invalid-currency-change-default = 請選擇符合您目前有效訂閱的幣別的國家。
select-tax-location-new-tax-rate-info = 更新您所在的地點後，新的稅率將套用至您帳號中的所有有效訂閱，並從下一個帳務週期開始生效。
signin-form-continue-button = 繼續
signin-form-email-input = 輸入您的電子郵件地址
signin-form-email-input-missing = 請輸入您的電子郵件地址
signin-form-email-input-invalid = 請提供您的電子郵件地址
next-new-user-subscribe-product-updates-mdnplus = 我想要收到 { -product-mdn-plus } 與 { -brand-mozilla } 的產品新聞與更新資訊
next-new-user-subscribe-product-updates-mozilla = 我想要收到 { -brand-mozilla } 的產品新聞與更新資訊
next-new-user-subscribe-product-updates-snp = 我想要收到 { -brand-mozilla } 的安全性與隱私權新聞與更新資訊
next-new-user-subscribe-product-assurance = 我們只會使用您的電子郵件地址來註冊帳號，絕對不會銷售給第三方。

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = 想要繼續使用 { $productName } 嗎？
stay-subscribed-access-will-continue = 將繼續保留您的 { $productName } 使用權，帳單週期與付款方式維持不變。
subscription-content-button-resubscribe = 重新訂閱
    .aria-label = 重新訂閱 { $productName }
resubscribe-success-dialog-title = 處理完成，感謝您！

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = 下期將於 { $currentPeriodEnd } 收費 { $nextInvoiceTotal } + { $taxDue } 稅。
stay-subscribed-next-charge-no-tax = 下期將於 { $currentPeriodEnd } 收費 { $nextInvoiceTotal }。

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = 將套用「{ $promotionName }」折扣
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = 最新帳單 • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } 稅
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = 檢視請款單
subscription-management-link-view-invoice-aria = 檢視 { $productName } 的請款單
subscription-content-expires-on-expiry-date = 於 { $date } 到期
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = 次期帳單 • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } 稅
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = 保持訂閱
    .aria-label = 保持訂閱 { $productName }
subscription-content-button-cancel-subscription = 取消訂閱
    .aria-label = 取消訂閱 { $productName }

##

dialog-close = 關閉對話框
button-back-to-subscriptions = 回到訂閱項目
subscription-content-cancel-action-error = 發生未知錯誤，請再試一次。
paypal-unavailable-error = { -brand-paypal } 目前無法使用，請改用其他付款方式或稍後再試。

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = 每天 { $amount }
plan-price-interval-weekly = 每週 { $amount }
plan-price-interval-monthly = 每月 { $amount }
plan-price-interval-halfyearly = 每 6 個月 { $amount }
plan-price-interval-yearly = 每年 { $amount }

## Component - SubscriptionTitle

next-subscription-create-title = 設定訂閱
next-subscription-success-title = 訂閱確認
next-subscription-processing-title = 正在確認訂閱…
next-subscription-error-title = 確認訂閱時發生錯誤…
subscription-title-sub-exists = 您已經訂閱過了
subscription-title-plan-change-heading = 確認變更內容
subscription-title-not-supported = 不支援更改此訂閱方案
next-sub-guarantee = 30 天內保證退款

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = 服務條款
next-privacy = 隱私權公告
next-terms-download = 下載條款
terms-and-privacy-stripe-label = { -brand-mozilla } 使用 { -brand-name-stripe } 來安全地處理交易款項。
terms-and-privacy-stripe-link = { -brand-name-stripe } 隱私權保護政策
terms-and-privacy-paypal-label = { -brand-mozilla } 使用 { -brand-paypal } 來安全地處理交易款項。
terms-and-privacy-paypal-link = { -brand-paypal } 隱私權保護政策
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } 使用 { -brand-name-stripe } 與 { -brand-paypal } 來安全地處理交易款項。

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = 目前方案
upgrade-purchase-details-new-plan-label = 新方案
upgrade-purchase-details-promo-code = 折扣碼
upgrade-purchase-details-tax-label = 稅費
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = 已將餘額儲存至帳號
upgrade-purchase-details-credit-will-be-applied = 已儲值至帳號，將於未來帳單中折抵。

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName }（每日收費）
upgrade-purchase-details-new-plan-weekly = { $productName }（每週收費）
upgrade-purchase-details-new-plan-monthly = { $productName }（每月收費）
upgrade-purchase-details-new-plan-halfyearly = { $productName }（每 6 個月收費）
upgrade-purchase-details-new-plan-yearly = { $productName }（每年收費）

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = 結帳 | { $productTitle }
metadata-description-checkout-start = 請輸入您的詳細付款資訊完成購買。
# Checkout processing
metadata-title-checkout-processing = 付款處理中 | { $productTitle }
metadata-description-checkout-processing = 請稍候，我們正在處理付款…
# Checkout error
metadata-title-checkout-error = 付款錯誤 | { $productTitle }
metadata-description-checkout-error = 處理您的訂閱時發生錯誤。若此問題持續存在，請聯絡支援團隊。
# Checkout success
metadata-title-checkout-success = 付款成功 | { $productTitle }
metadata-description-checkout-success = 恭喜！您已成功完成購買！
# Checkout needs_input
metadata-title-checkout-needs-input = 需要處理 | { $productTitle }
metadata-description-checkout-needs-input = 請完成要求的操作，以繼續付款。
# Upgrade start
metadata-title-upgrade-start = 升級 | { $productTitle }
metadata-description-upgrade-start = 請輸入您的詳細付款資訊完成升級。
# Upgrade processing
metadata-title-upgrade-processing = 升級處理中 | { $productTitle }
metadata-description-upgrade-processing = 請稍候，我們正在處理付款…
# Upgrade error
metadata-title-upgrade-error = 升級錯誤 | { $productTitle }
metadata-description-upgrade-error = 處理您的升級時發生錯誤。若此問題持續存在，請聯絡支援團隊。
# Upgrade success
metadata-title-upgrade-success = 升級成功 | { $productTitle }
metadata-description-upgrade-success = 恭喜！您已成功完成升級！
# Upgrade needs_input
metadata-title-upgrade-needs-input = 需要處理 | { $productTitle }
metadata-description-upgrade-needs-input = 請完成要求的操作，以繼續付款。
# Default
metadata-title-default = 找不到頁面 | { $productTitle }
metadata-description-default = 找不到您要求的頁面。

## Coupon Error Messages

next-coupon-error-cannot-redeem = 您輸入的代碼無法兌換 — 您的帳號已訂閱我們任一服務。
next-coupon-error-expired = 您輸入的折扣碼已失效。
next-coupon-error-generic = 處理折扣碼時發生錯誤，請再試一次。
next-coupon-error-invalid = 您輸入的折扣碼無效。
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = 您輸入的折扣碼已達使用次數上限。

## Stay Subscribed Error Messages

stay-subscribed-error-expired = 此活動已經結束。
stay-subscribed-error-discount-used = 已經套用此折扣碼。
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = 此折扣僅適用於目前的 { $productTitle } 訂閱者。
stay-subscribed-error-still-active = 您的 { $productTitle } 訂閱仍然有效。
stay-subscribed-error-general = 續訂時發生問題。
