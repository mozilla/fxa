



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox 帳號
-product-mozilla-account = Mozilla 帳號
-product-mozilla-accounts = Mozilla 帳號
-product-firefox-account = Firefox 帳號
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
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = 美國運通
-brand-diners = 大來卡
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = 銀聯
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = 應用程式一般錯誤
app-general-err-message = 某些東西不對勁，請稍候再試一次。
app-query-parameter-err-heading = 請求錯誤：查詢參數無效


app-footer-mozilla-logo-label = { -brand-mozilla } 圖示
app-footer-privacy-notice = 網站隱私權公告
app-footer-terms-of-service = 服務條款


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = 會用新視窗開啟


app-loading-spinner-aria-label-loading = 載入中…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m 標誌



settings-home = 帳號首頁
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = 已套用折扣碼
coupon-submit = 套用
coupon-remove = 移除
coupon-error = 您輸入的折扣碼無效或已失效。
coupon-error-generic = 處理代碼時發生錯誤，請再試一次。
coupon-error-expired = 您輸入的折扣碼已失效。
coupon-error-limit-reached = 您輸入的代碼已達使用次數上限。
coupon-error-invalid = 您輸入的代碼無效。
coupon-enter-code =
    .placeholder = 輸入折扣碼


default-input-error = 此欄位必填
input-error-is-required = { $label } 必填


brand-name-mozilla-logo = { -brand-mozilla } 標誌


new-user-sign-in-link-2 = 已經有 { -product-mozilla-account }了嗎？<a>點此登入</a>
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
new-user-invalid-email-domain = 輸錯信箱帳號了？{ $domain } 不提供郵件服務。


payment-confirmation-thanks-heading = 感謝您！
payment-confirmation-thanks-heading-account-exists = 謝謝，接下來請到信箱收信！
payment-confirmation-thanks-subheading = 我們已將確認郵件發送到 { $email }，當中包含如何開始使用 { $product_name } 的相關資訊。
payment-confirmation-thanks-subheading-account-exists = 您將會在 { $email } 收到一封信，當中包含如何設定帳號、付款方式的相關資訊。
payment-confirmation-order-heading = 訂單詳細資訊
payment-confirmation-invoice-number = 請款單號碼 #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = 付款資訊
payment-confirmation-amount = 每 { $interval } { $amount }
payment-confirmation-amount-day =
    { $intervalCount ->
        [1] 每天 { $amount }
       *[other] 每 { $intervalCount } 天 { $amount }
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [1] 每週 { $amount }
       *[other] 每 { $intervalCount } 週 { $amount }
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [1] 每個月 { $amount }
       *[other] 每 { $intervalCount } 個月 { $amount }
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [1] 每年 { $amount }
       *[other] 每 { $intervalCount } 年 { $amount }
    }
payment-confirmation-download-button = 前往下載


payment-confirm-with-legal-links-static-3 = 我授權 { -brand-mozilla } 根據<termsOfServiceLink>服務條款</termsOfServiceLink>與<privacyNoticeLink>隱私權公告</privacyNoticeLink>的內容，對我的付款方式收取此費用，直到我主動取消訂閱為止。
payment-confirm-checkbox-error = 需要勾選此欄位才能繼續前往下一步


payment-error-retry-button = 重試
payment-error-manage-subscription-button = 管理我的訂閱


iap-upgrade-already-subscribed-2 = 您已透過 { -brand-google } 或 { -brand-apple } 應用程式商店訂閱 { $productName }。
iap-upgrade-no-bundle-support = 我們目前暫時無法升級透過這些方式訂閱的方案，但此功能正在開發中。
iap-upgrade-contact-support = 您還是可以獲得此產品，請聯絡支援團隊，讓我們來協助。
iap-upgrade-get-help-button = 取得幫助


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


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } 使用 { -brand-name-stripe } 與 { -brand-paypal } 來安全地處理交易款項。
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } 隱私權保護政策</stripePrivacyLink>&nbsp;<paypalPrivacyLink>{ -brand-paypal } 隱私權保護政策</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } 使用 { -brand-paypal } 來安全地處理交易款項。
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } 隱私權保護政策</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } 使用 { -brand-name-stripe } 來安全地處理交易款項。
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } 隱私權保護政策</stripePrivacyLink>.


payment-method-header = 選擇付款方式
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = 請先授權付款訂閱


payment-processing-message = 請稍候，正在處理付款…


payment-confirmation-cc-card-ending-in = 卡號末四碼：{ $last4 }


pay-with-heading-paypal-2 = 使用 { -brand-paypal } 付款


plan-details-header = 產品詳細資訊
plan-details-list-price = 原價
plan-details-show-button = 顯示詳細資訊
plan-details-hide-button = 隱藏詳細資訊
plan-details-total-label = 總計
plan-details-tax = 稅費


product-no-such-plan = 此產品無此方案。


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + 稅金 { $taxAmount }
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


subscription-create-title = 設定訂閱
subscription-success-title = 訂閱確認
subscription-processing-title = 正在確認訂閱…
subscription-error-title = 確認訂閱時發生錯誤…
subscription-noplanchange-title = 不支援更改此訂閱方案
subscription-iapsubscribed-title = 已經訂閱
sub-guarantee = 30 天內保證退款


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = 服務條款
privacy = 隱私權公告
terms-download = 下載條款


document =
    .title = Firefox 帳號
close-aria =
    .aria-label = 關閉對話框
settings-subscriptions-title = 訂閱
coupon-promo-code = 折扣碼


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
iap-already-subscribed = 您已透過 { $mobileAppStore } 訂閱。
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


coupon-success = 您的訂閱方案將以牌告原價自動續約。
coupon-success-repeating = 您的方案將在 { $couponDurationDate } 之後依牌告原價自動續訂。


new-user-step-1-2 = 1. 註冊 { -product-mozilla-account }
new-user-card-title = 輸入您的卡片資訊
new-user-submit = 立刻訂閱


sub-update-payment-title = 付款資訊


pay-with-heading-card-only = 刷卡付款
product-invoice-preview-error-title = 載入請款單預覽頁面時發生問題
product-invoice-preview-error-text = 無法載入請款單預覽頁面


subscription-iaperrorupgrade-title = 我們暫時無法為您升級


brand-name-google-play-2 = { -google-play } 商店
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = 確認變更內容
sub-change-failed = 方案變更失敗
sub-update-acknowledgment = 您的方案內容會立刻變更，且會向您收取本帳務週期剩餘天數的差額。自 { $startingDate } 起將會向您收取全額。
sub-change-submit = 確認變更
sub-update-current-plan-label = 目前方案
sub-update-new-plan-label = 新方案
sub-update-total-label = 新方案金額
sub-update-prorated-upgrade = 按比例破月升級


sub-update-new-plan-daily = { $productName }（每日收費）
sub-update-new-plan-weekly = { $productName }（每週收費）
sub-update-new-plan-monthly = { $productName }（每月收費）
sub-update-new-plan-yearly = { $productName }（每年收費）
sub-update-prorated-upgrade-credit = 下方的負值將轉為您帳號中的儲值餘額，並在後續付款時折抵。


sub-item-cancel-sub = 取消訂閱
sub-item-stay-sub = 保持訂閱


sub-item-cancel-msg = 在帳務週期最後一天（{ $period }）之後，將無法再使用 { $name }。
sub-item-cancel-confirm = 在 { $period }之後取消我對 { $name } 的使用權限與儲存的所有資訊
sub-promo-coupon-applied = 已套用「{ $promotion_name }」折扣碼：<priceDetails></priceDetails>
subscription-management-account-credit-balance = 這筆訂閱付款將把部分金額轉為您的儲值餘額：<priceDetails></priceDetails>


sub-route-idx-reactivating = 重新訂閱失敗
sub-route-idx-cancel-failed = 訂閱取消失敗
sub-route-idx-contact = 聯絡支援團隊
sub-route-idx-cancel-msg-title = 很遺憾看到您離開
sub-route-idx-cancel-msg = 已取消您對 { $name } 的訂閱。<br />仍可繼續使用 { $name } 到 { $date }為止。
sub-route-idx-cancel-aside-2 = 有問題嗎？請到 <a>{ -brand-mozilla } Support</a>。


sub-customer-error =
    .title = 載入客戶資料時發生問題
sub-invoice-error =
    .title = 載入請款單時發生問題
sub-billing-update-success = 成功更新帳務資訊！
sub-invoice-previews-error-title = 載入請款單預覽頁面時發生問題
sub-invoice-previews-error-text = 無法載入請款單預覽頁面


pay-update-change-btn = 變更
pay-update-manage-btn = 管理


sub-next-bill = 下次收費時間：{ $date }
sub-next-bill-due-date = 下次收費時間 { $date }
sub-expires-on = 於 { $date } 到期




pay-update-card-exp = 到期於 { $expirationDate }
sub-route-idx-updating = 正在更新帳務資訊…
sub-route-payment-modal-heading = 帳務資訊無效
sub-route-payment-modal-message-2 = 您的 { -brand-paypal } 帳號似乎發生問題，請採取下列步驟處理付款問題。
sub-route-missing-billing-agreement-payment-alert = 您的帳號發生問題，付款資訊無效。<div>點此管理</div>
sub-route-funding-source-payment-alert = 您的帳號發生問題，付款資訊無效。當您成功更新資訊後，可能要過一點時間此警示才會消失。<div>點此管理</div>


sub-item-no-such-plan = 此訂閱內容無此方案。
invoice-not-found = 找不到後續請款單
sub-item-no-such-subsequent-invoice = 找不到此訂閱後續的請款單
sub-invoice-preview-error-title = 找不到請款單預覽頁面
sub-invoice-preview-error-text = 找不到此訂閱的請款單預覽頁面


reactivate-confirm-dialog-header = 想要繼續使用 { $name } 嗎？
reactivate-confirm-copy = 您可繼續使用 { $name }，帳務週期與付款內容將保持不變。下次將於 { $endDate }，對卡號結尾為 { $last } 的卡片收取 { $amount }。
reactivate-confirm-without-payment-method-copy = 您可繼續使用 { $name }，帳務週期與付款內容將保持不變。下次將於 { $endDate } 收取 { $amount }。
reactivate-confirm-button = 重新訂閱


reactivate-panel-copy = 在 <strong>{ $date }</strong>之後，將無法再使用 { $name }。
reactivate-success-copy = 處理完成，感謝您！
reactivate-success-button = 關閉


sub-iap-item-google-purchase-2 = { -brand-google }：應用程式內購買
sub-iap-item-apple-purchase-2 = { -brand-apple }：應用程式內購買
sub-iap-item-manage-button = 管理
