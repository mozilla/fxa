## Non-email strings

session-verify-send-push-title-2 = 要登入您的 { -product-mozilla-account } 嗎？
session-verify-send-push-body-2 = 請點擊此處確認是您
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = 您的{ -brand-mozilla }驗證碼為{ $code }，有效期限5分鐘。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } 驗證碼：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = 您的{ -brand-mozilla }救援碼為{ $code }，有效期限5分鐘。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } 備用驗證碼：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = 您的{ -brand-mozilla }救援碼為{ $code }，有效期限5分鐘。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } 密碼重設驗證碼：{ $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } 標誌">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } 標誌">
subplat-automated-email = 這是電腦自動發送的郵件，若您突然收到這封信，不需要做任何事。
subplat-privacy-notice = 隱私權公告
subplat-privacy-plaintext = 隱私權公告：
subplat-update-billing-plaintext = { subplat-update-billing }：
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = 您會收到這封信，是因為 { $email } 註冊了 { -product-mozilla-account }，並且訂閱了 { $productName }。
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = 您會收到這封郵件，是因為 { $email } 註冊了 { -product-mozilla-account }。
subplat-explainer-multiple-2 = 您會收到這封信，是因為 { $email } 註冊了 { -product-mozilla-account }，並且訂閱了多套產品。
subplat-explainer-was-deleted-2 = 您會收到這封郵件，是因為 { $email } 註冊了 { -product-mozilla-account }。
subplat-manage-account-2 = 到您的<a data-l10n-name="subplat-account-page">帳號頁面</a>來管理 { -product-mozilla-account }設定。
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = 可到您的帳號頁面來管理 { -product-mozilla-account }設定：{ $accountSettingsUrl }
subplat-terms-policy = 條款及取消政策
subplat-terms-policy-plaintext = { subplat-terms-policy }：
subplat-cancel = 取消訂閱
subplat-cancel-plaintext = { subplat-cancel }：
subplat-reactivate = 重新啟用訂閱
subplat-reactivate-plaintext = { subplat-reactivate }：
subplat-update-billing = 更新帳務資訊
subplat-privacy-policy = { -brand-mozilla } 隱私權保護政策
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") }隱私權公告
subplat-privacy-policy-plaintext = { subplat-privacy-policy }：
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }：
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") }服務條款
subplat-moz-terms-plaintext = { subplat-moz-terms }：
subplat-legal = 法律資訊
subplat-legal-plaintext = { subplat-legal }：
subplat-privacy = 隱私權
subplat-privacy-website-plaintext = { subplat-privacy }：
cancellationSurvey = 請填寫這份<a data-l10n-name="cancellationSurveyUrl">簡短問卷</a>幫助我們改善服務品質。
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = 請填寫這份簡短問卷幫助我們改善服務品質：
payment-details = 付款詳細資訊：
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = 請款單號碼：{ $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = 已於 { $invoiceDateOnly } 收取 { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = 下次扣款日：{ $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>付款方式：</b>{ $paymentProviderName }
payment-method-payment-provider-plaintext = 付款方式：{ $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = 付款方式：卡號尾碼為 { $lastFour } 的 { $cardName } 卡片
payment-provider-card-ending-in-plaintext = 付款方式：卡號尾碼為 { $lastFour } 的卡片
payment-provider-card-ending-in = <b>付款方式：</b>卡號尾碼為 { $lastFour } 的卡片
payment-provider-card-ending-in-card-name = <b>付款方式：</b>卡號尾碼為 { $lastFour } 的 { $cardName } 卡片
subscription-charges-invoice-summary = 請款單摘要

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>請款單號碼：</b>{ $invoiceNumber }
subscription-charges-invoice-number-plaintext = 請款單號碼：{ $invoiceNumber }
subscription-charges-invoice-date = <b>日期：</b>{ $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = 日期：{ $invoiceDateOnly }
subscription-charges-prorated-price = 按比例破月計算價格
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = 按比例破月計算價格：{ $remainingAmountTotal }
subscription-charges-list-price = 牌價
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = 牌價：{ $offeringPrice }
subscription-charges-credit-from-unused-time = 未使用期間轉儲值餘額
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = 未使用期間轉儲值餘額：{ $unusedAmountTotal }
subscription-charges-subtotal = <b>小計</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 小計：{ $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = 單次折扣
subscription-charges-one-time-discount-plaintext = 單次折扣：{ $invoiceDiscountAmount }
subscription-charges-repeating-discount = { $discountDuration } 個月折扣
subscription-charges-repeating-discount-plaintext = { $discountDuration } 個月折扣：{ $invoiceDiscountAmount }
subscription-charges-discount = 折扣
subscription-charges-discount-plaintext = 折扣：{ $invoiceDiscountAmount }
subscription-charges-taxes = 稅金與其他費用
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = 稅金與其他費用：{ $invoiceTaxAmount }
subscription-charges-total = <b>總計</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = 總計：{ $invoiceTotal }
subscription-charges-credit-applied = 已套用儲值餘額
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = 已套用儲值餘額：{ $creditApplied }
subscription-charges-amount-paid = <b>已付款金額</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = 已付款金額：{ $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = 您已收到 { $creditReceived } 的儲值餘額，可在未來使用。

##

subscriptionSupport = 有關於訂閱服務的任何問題嗎？我們的<a data-l10n-name="subscriptionSupportUrl">技術支援團隊</a>在此為您服務。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = 有訂閱內容的相關問題嗎？我們的技術支援團隊在此幫忙：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = 感謝您訂閱 { $productName }。若有關於訂閱內容的任何疑問，或需要有關 { $productName } 的更多資訊，<a data-l10n-name="subscriptionSupportUrl">請聯絡我們</a>。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = 感謝您訂閱 { $productName }。若有關於訂閱內容的任何疑問，或需要 { $productName } 的更多資訊，請透過下列方式聯絡我們：
subscription-support-get-help = 獲得有關訂閱項目的協助
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">管理您的訂閱項目</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = 管理您的訂閱項目：
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">聯絡支援團隊</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = 聯絡支援團隊：
subscriptionUpdateBillingEnsure = 您可以到<a data-l10n-name="updateBillingUrl">此處</a>確認您的付款方式與帳號資訊。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 您可以到下列位置確認付款方式與帳號資訊：
subscriptionUpdateBillingTry = 接下來幾天內我們會再次嘗試處理付款，但您也可以<a data-l10n-name="updateBillingUrl">更新付款資訊</a>，協助修正這個問題。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 接下來幾天內我們會再次嘗試處理付款，但您也可以更新付款資訊，協助修正這個問題：
subscriptionUpdatePayment = 為了避免服務中斷，請及早<a data-l10n-name="updateBillingUrl">更新付款資訊</a>。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = 為了避免服務中斷，請及早更新付款資訊：
view-invoice-link-action = 檢視請款單
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 檢視請款單：{ $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = 歡迎使用 { $productName }。
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = 歡迎使用 { $productName }。
downloadSubscription-content-2 = 讓我們開始使用訂閱中包含的各種功能：
downloadSubscription-link-action-2 = 開始使用
fraudulentAccountDeletion-subject-2 = 已刪除您的 { -product-mozilla-account }
fraudulentAccountDeletion-title = 已刪除您的帳號
fraudulentAccountDeletion-content-part1-v2 = 最近有人使用此電子郵件信箱註冊 { -product-mozilla-account }並付費訂閱。如我們對所有新帳號所要求的，需請您先確認此電子郵件地址。
fraudulentAccountDeletion-content-part2-v2 = 目前此帳號尚未經過確認，無法確認這是不是經過授權的訂閱行為。因此，已刪除使用此電子郵件信箱註冊的 { -product-mozilla-account }，並將取消已訂閱的項目並完全退費。
fraudulentAccountDeletion-contact = 若您有其他問題，請聯絡我們的<a data-l10n-name="mozillaSupportUrl">技術支援團隊</a>。
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = 若您有其他問題，請聯絡我們的技術支援團隊：{ $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = 已取消您的 { $productName } 產品訂閱
subscriptionAccountDeletion-title = 很遺憾看見您離開
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 您最近刪除了 { -product-mozilla-account }，因此我們也同步取消了您的 { $productName } 訂閱。最後一次付款發生於 { $invoiceDateOnly }，金額為 { $invoiceTotal }。
subscriptionAccountReminderFirst-subject = 提醒：請完成帳號註冊
subscriptionAccountReminderFirst-title = 您暫時還不能使用您的訂閱項目
subscriptionAccountReminderFirst-content-info-3 = 幾天前，您註冊了 { -product-mozilla-account }但還沒有驗證該帳號。希望您能盡快驗證該帳號，才能使用剛訂閱的項目。
subscriptionAccountReminderFirst-content-select-2 = 請選擇「設定密碼」來設定新密碼並完成帳號驗證手續。
subscriptionAccountReminderFirst-action = 設定密碼
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }：
subscriptionAccountReminderSecond-subject = 這是最後一次提醒囉：註冊帳號
subscriptionAccountReminderSecond-title-2 = 歡迎來到 { -brand-mozilla }！
subscriptionAccountReminderSecond-content-info-3 = 幾天前，您註冊了 { -product-mozilla-account }但還沒有驗證該帳號。希望您能盡快驗證該帳號，才能使用剛訂閱的項目。
subscriptionAccountReminderSecond-content-select-2 = 請選擇「設定密碼」來設定新密碼並完成帳號驗證手續。
subscriptionAccountReminderSecond-action = 設定密碼
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = 已取消您的 { $productName } 產品訂閱
subscriptionCancellation-title = 很遺憾看見您離開

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = 我們已取消您的 { $productName } 訂閱。最後一筆款項 { $invoiceTotal } 已於 { $invoiceDateOnly } 支付。
subscriptionCancellation-outstanding-content-2 = 我們已取消您的 { $productName } 訂閱。最後一筆款項 { $invoiceTotal } 將於 { $invoiceDateOnly } 支付。
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = 您可持續使用訂閱的服務至帳單週期結束（{ $serviceLastActiveDateOnly }）為止。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = 您已切換到 { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = 您已成功從 { $productNameOld } 切換到 { $productName }。
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = 從下一期開始，我們就會從每 { $productPaymentCycleOld } 收費 { $paymentAmountOld } 調整為每 { $productPaymentCycleNew } 收費 { $paymentAmountNew }。屆時我們將把剩餘期間 { $productPaymentCycleOld } 的差額 { $paymentProrated } 以餘額的方式一次儲值到您的帳號，以反應較低的收費金額。
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = 若需要安裝新軟體才能使用 { $productName }，我們會將下載方式用另一封電子郵件發送給您。
subscriptionDowngrade-content-auto-renew = 除非您主動取消訂閱，否則將在每個帳單週期開始時自動續約並收費。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = 您的 { $productName } 訂閱即將到期
subscriptionEndingReminder-title = 您的 { $productName } 訂閱即將到期
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = 您對 { $productName } 的使用權限將於 <strong>{ $serviceLastActiveDateOnly }</strong> 結束。
subscriptionEndingReminder-content-line2 = 若您想繼續使用 { $productName }，可以在 <strong>{ $serviceLastActiveDateOnly }</strong> 之前到<a data-l10n-name="subscriptionEndingReminder-account-settings">帳號設定</a>重新訂閱。若需要協助，請<a data-l10n-name="subscriptionEndingReminder-contact-support">聯絡我們的技術支援團隊</a>。
subscriptionEndingReminder-content-line1-plaintext = 您對 { $productName } 的使用權限將於 { $serviceLastActiveDateOnly } 結束。
subscriptionEndingReminder-content-line2-plaintext = 若您想繼續使用 { $productName }，可以在 { $serviceLastActiveDateOnly } 之前到帳號設定重新訂閱。若需要協助，請聯絡我們的技術支援團隊。
subscriptionEndingReminder-content-closing = 感謝您成為訂閱者！
subscriptionEndingReminder-churn-title = 想要保留使用權嗎？
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">有相關條款與限制</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = 有相關條款與限制：{ $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = 聯絡我們的技術支援團隊：{ $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = 已取消您的 { $productName } 產品訂閱
subscriptionFailedPaymentsCancellation-title = 您的訂閱已取消
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = 由於多次付款失敗，我們已取消您的 { $productName } 訂閱。若需再次使用訂閱內容，請使用新的付款方式重新訂閱。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = 已確認 { $productName } 付款
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = 感謝您訂閱 { $productName }
subscriptionFirstInvoice-content-processing = 正在處理您的款項，最多需要四個工作天才能完成。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = 您將另外收到一封有關如何開始使用 { $productName } 的電子郵件。
subscriptionFirstInvoice-content-auto-renew = 除非您主動取消訂閱，否則將在每個帳單週期開始時自動續約並收費。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = 下一期請款單將於 { $nextInvoiceDateOnly } 開立。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = 訂購 { $productName } 所使用的付款方式即將過期，或已過期
subscriptionPaymentExpired-title-2 = 您的付款方式即將過期，或已過期
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = 您用來訂購 { $productName } 的付款方式即將過期，或已過期。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } 付款失敗
subscriptionPaymentFailed-title = 很抱歉，處理付款時遇到問題
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = 處理您最近對 { $productName } 的付款時，遇到問題。
subscriptionPaymentFailed-content-outdated-1 = 可能是您的付款方式過期，或已經失效了。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = 需要更新 { $productName } 的付款資訊
subscriptionPaymentProviderCancelled-title = 很抱歉，處理付款時遇到問題
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = 處理您最近對 { $productName } 的付款時，遇到問題。
subscriptionPaymentProviderCancelled-content-reason-1 = 可能是您的付款方式過期，或已經失效了。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = 已重新開始訂閱 { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = 感謝您重新開始訂閱 { $productName }！
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = 您的帳務週期與付款內容將保持原樣，下次將於 { $nextInvoiceDateOnly } 收取 { $invoiceTotal }。在您主動取消之前，將自動持續訂閱。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } 自動續訂通知
subscriptionRenewalReminder-title = 即將續訂您的訂閱項目
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = 親愛的 { $productName } 客戶：
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = 您目前的訂閱將在 { $reminderLength } 天後自動續訂。
subscriptionRenewalReminder-content-discount-change = 由於先前的折扣活動已結束，且套用了新的折扣，您的下一期帳單將有價格變動。
subscriptionRenewalReminder-content-discount-ending = 由於先前的折扣活動已結束，新訂閱將以標準價格續約。
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = 屆時，{ -brand-mozilla } 將續訂您的每日訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotalExcludingTax } + { $invoiceTax } 稅。
subscriptionRenewalReminder-content-charge-with-tax-week = 屆時，{ -brand-mozilla } 將續訂您的每週訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotalExcludingTax } + { $invoiceTax } 稅。
subscriptionRenewalReminder-content-charge-with-tax-month = 屆時，{ -brand-mozilla } 將續訂您的每月訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotalExcludingTax } + { $invoiceTax } 稅。
subscriptionRenewalReminder-content-charge-with-tax-halfyear = 屆時，{ -brand-mozilla } 將續訂您的每半年訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotalExcludingTax } + { $invoiceTax } 稅。
subscriptionRenewalReminder-content-charge-with-tax-year = 屆時，{ -brand-mozilla } 將續訂您的每年訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotalExcludingTax } + { $invoiceTax } 稅。
subscriptionRenewalReminder-content-charge-with-tax-default = 屆時，{ -brand-mozilla } 將續訂您的訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotalExcludingTax } + { $invoiceTax } 稅。
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = 屆時，{ -brand-mozilla } 將續訂您的每日訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-charge-invoice-total-week = 屆時，{ -brand-mozilla } 將續訂您的每週訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-charge-invoice-total-month = 屆時，{ -brand-mozilla } 將續訂您的每月訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = 屆時，{ -brand-mozilla } 將續訂您的每半年訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-charge-invoice-total-year = 屆時，{ -brand-mozilla } 將續訂您的每年訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-charge-invoice-total-default = 屆時，{ -brand-mozilla } 將續訂您的訂閱方案，並對您帳號設定的付款方式收取 { $invoiceTotal }。
subscriptionRenewalReminder-content-closing = 感謝您，
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } 團隊
subscriptionReplaced-subject = 因升級方案，已更新您的訂閱內容
subscriptionReplaced-title = 已更新您的訂閱內容
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = 您原先的 { $productName } 單套訂閱已被取代為新套裝訂閱中的一部分。
subscriptionReplaced-content-credit = 您將會以帳號餘額的方式，收到先前訂閱內容未使用的時間的餘額退款。此餘額會自動於您的帳號生效，可於未來付款時抵用。
subscriptionReplaced-content-no-action = 您這邊不需要再做任何事。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = 已收到 { $productName } 付款
subscriptionSubsequentInvoice-title = 感謝您訂閱！
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = 我們已收到您最近為 { $productName } 支付的款項。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = 下一期請款單將於 { $nextInvoiceDateOnly } 開立。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = 您已升級到 { $productName }
subscriptionUpgrade-title = 感謝您升級訂購內容！
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = 您已成功升級到 { $productName }。

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = 已向您一次收取 { $invoiceAmountDue }，以反應目前帳務週期剩餘期間（{ $productPaymentCycleOld }）較高的價格。
subscriptionUpgrade-content-charge-credit = 您已收到 { $paymentProrated } 的儲值餘額。
subscriptionUpgrade-content-subscription-next-bill-change = 從下個帳單週期開始，您的訂閱價格將有改變。
subscriptionUpgrade-content-old-price-day = 原價格為每天 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-week = 原價格為每週 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-month = 原價格為每個月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-halfyear = 原價格為每六個月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-year = 原價格為每年 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-default = 原價格為每期 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-day-tax = 原價格為每天 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-week-tax = 原價格為每週 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-month-tax = 原價格為每個月 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-halfyear-tax = 原價格為每六個月 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-year-tax = 原價格為每年 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-old-price-default-tax = 原價格為每期 { $paymentAmountOld } + { $paymentTaxOld } 稅。
subscriptionUpgrade-content-new-price-day = 未來，將收取每天 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-week = 未來，將收取每週 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-month = 未來，將收取每月 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-halfyear = 未來，將收取每六個月 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-year = 未來，將收取每年 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-default = 未來，將收取每期 { $paymentAmountNew }，不含折扣。
subscriptionUpgrade-content-new-price-day-dtax = 未來，將收取每天 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-week-tax = 未來，將收取每週 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-month-tax = 未來，將收取每月 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-halfyear-tax = 未來，將收取每六個月 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-year-tax = 未來，將收取每年 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-content-new-price-default-tax = 未來，將收取每期 { $paymentAmountNew } + { $paymentTaxNew } 稅，不含折扣。
subscriptionUpgrade-existing = 若您現有的訂閱與此次升級有重疊部分，我們會用另外一封電子郵件向您說明完整處理方式；若您的新方案當中包含需要安裝軟體的產品，則也會再用另一封電子郵件向您說明如何安裝。
subscriptionUpgrade-auto-renew = 除非您主動取消訂閱，否則將在每個帳單週期開始時自動續約並收費。
subscriptionsPaymentExpired-subject-2 = 訂購產品所使用的付款方式即將過期，或已過期
subscriptionsPaymentExpired-title-2 = 您的付款方式即將過期，或已過期
subscriptionsPaymentExpired-content-2 = 您用來訂閱下列項目的付款方式即將過期，或已過期。
subscriptionsPaymentProviderCancelled-subject = 需要更新 { -brand-mozilla } 產品訂閱的付款資訊
subscriptionsPaymentProviderCancelled-title = 很抱歉，處理付款時遇到問題
subscriptionsPaymentProviderCancelled-content-detected = 處理您最近對下列訂閱項目的付款時，遇到問題。
subscriptionsPaymentProviderCancelled-content-payment-1 = 可能是您的付款方式過期，或已經失效了。
