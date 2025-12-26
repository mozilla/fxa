



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox 账户
-product-mozilla-account = Mozilla 账户
-product-mozilla-accounts = Mozilla 账户
-product-firefox-account = Firefox 账户
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
-brand-amex = 美国运通
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = 万事达卡
-brand-unionpay = 银联
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = 一般性程序错误
app-general-err-message = 出了点问题，请稍后再试。
app-query-parameter-err-heading = 错误请求：查询参数无效


app-footer-mozilla-logo-label = { -brand-mozilla } 徽标
app-footer-privacy-notice = 网站隐私声明
app-footer-terms-of-service = 服务条款


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = 将新建窗口打开


app-loading-spinner-aria-label-loading = 加载中…


app-logo-alt-3 =
    .alt = { -brand-mozilla } 的“m”字徽标



settings-home = 账户首页
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = 已应用折扣码
coupon-submit = 应用
coupon-remove = 移除
coupon-error = 您输入的折扣码无效或已过期。
coupon-error-generic = 处理折扣码时出错，请重试。
coupon-error-expired = 您输入的折扣码已过期。
coupon-error-limit-reached = 您输入的折扣码已达使用次数上限。
coupon-error-invalid = 您输入的折扣码无效。
coupon-enter-code =
    .placeholder = 输入折扣码


default-input-error = 此字段必填
input-error-is-required = { $label } 必填


brand-name-mozilla-logo = { -brand-mozilla } 徽标


new-user-sign-in-link-2 = 已有 { -product-mozilla-account }？<a>立即登录</a>
new-user-enter-email =
    .label = 请输入邮箱
new-user-confirm-email =
    .label = 确认邮箱地址
new-user-subscribe-product-updates-mozilla = 我愿意接收来自 { -brand-mozilla } 的产品新闻和更新
new-user-subscribe-product-updates-snp = 我愿意接收来自 { -brand-mozilla } 的安全和隐私新闻及更新
new-user-subscribe-product-updates-hubs = 我愿意接收来自 { -product-mozilla-hubs } 和 { -brand-mozilla } 的产品新闻及更新
new-user-subscribe-product-updates-mdnplus = 我愿意接收来自 { -product-mdn-plus } 和 { -brand-mozilla } 的产品新闻及更新
new-user-subscribe-product-assurance = 我们只会使用您的邮箱地址来创建账户，绝不会将其出售予第三方。
new-user-email-validate = 电子邮件地址无效
new-user-email-validate-confirm = 两次输入的邮箱地址不同
new-user-already-has-account-sign-in = 您已有账户，<a>请登录</a>
new-user-invalid-email-domain = 输错邮箱地址了？{ $domain } 不提供邮件服务。


payment-confirmation-thanks-heading = 感谢您！
payment-confirmation-thanks-heading-account-exists = 感谢，请注意查收邮件！
payment-confirmation-thanks-subheading = 确认邮件已发送至 { $email }，其中包含如何开始使用 { $product_name } 的详细信息。
payment-confirmation-thanks-subheading-account-exists = 您将会在 { $email } 收到一封邮件，其中包括如何设置账户、付款方式等信息。
payment-confirmation-order-heading = 订单详细信息
payment-confirmation-invoice-number = 发票号码 #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = 付款信息
payment-confirmation-amount = 每 { $interval } { $amount }
payment-confirmation-amount-day =
    { $intervalCount ->
       *[other] 每 { $intervalCount } 天 { $amount }
    }
payment-confirmation-amount-week =
    { $intervalCount ->
       *[other] 每 { $intervalCount } 周 { $amount }
    }
payment-confirmation-amount-month =
    { $intervalCount ->
       *[other] 每 { $intervalCount } 个月 { $amount }
    }
payment-confirmation-amount-year =
    { $intervalCount ->
       *[other] 每 { $intervalCount } 年 { $amount }
    }
payment-confirmation-download-button = 前往下载


payment-confirm-with-legal-links-static-3 = 我授权 { -brand-mozilla } 依照<termsOfServiceLink>服务条款</termsOfServiceLink>和<privacyNoticeLink>隐私声明</privacyNoticeLink>，从我的付款方式收取此费用，直到我主动取消订阅为止。
payment-confirm-checkbox-error = 同意此项后才可继续


payment-error-retry-button = 请重试
payment-error-manage-subscription-button = 管理我的订阅


iap-upgrade-already-subscribed-2 = 您已通过 { -brand-google } 或 { -brand-apple } 应用商店订阅 { $productName }。
iap-upgrade-no-bundle-support = 我们暂时无法升级这类方式的订阅，不久后可能会支持。
iap-upgrade-contact-support = 您仍可获得此产品，请联系用户支持为您提供帮助。
iap-upgrade-get-help-button = 获取帮助


payment-name =
    .placeholder = 持卡人姓名
    .label = 请输入卡面上的姓名
payment-cc =
    .label = 您的银行卡
payment-cancel-btn = 取消
payment-update-btn = 更新
payment-pay-btn = 立即付款
payment-pay-with-paypal-btn-2 = 通过 { -brand-paypal } 付款
payment-validate-name-error = 请输入您的名字


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } 使用 { -brand-name-stripe } 和 { -brand-paypal } 进行安全支付。
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } 隐私政策</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } 隐私政策</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } 使用 { -brand-paypal } 进行安全支付。
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } 隐私政策</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } 使用 { -brand-name-stripe } 进行安全支付。
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } 隐私政策</stripePrivacyLink>.


payment-method-header = 选择付款方式
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = 请先核准您的订阅


payment-processing-message = 请稍候，我们正在处理您的付款…


payment-confirmation-cc-card-ending-in = 卡号末四位：{ $last4 }


pay-with-heading-paypal-2 = 通过 { -brand-paypal } 付款


plan-details-header = 产品详细信息
plan-details-list-price = 标价
plan-details-show-button = 显示详细信息
plan-details-hide-button = 隐藏详细信息
plan-details-total-label = 总计
plan-details-tax = 税费


product-no-such-plan = 此产品无此方案。


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + 税款 { $taxAmount }
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
        [one] 每周 { $priceAmount }
       *[other] 每 { $intervalCount } 周 { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每周 { $priceAmount }
           *[other] 每 { $intervalCount } 周 { $priceAmount }
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] 每月 { $priceAmount }
       *[other] 每 { $intervalCount } 个月 { $priceAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每月 { $priceAmount }
           *[other] 每 { $intervalCount } 个月 { $priceAmount }
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
        [one] 每天 { $priceAmount } + 税款 { $taxAmount }
       *[other] 每 { $intervalCount } 天 { $priceAmount } + 税款 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每天 { $priceAmount } + 税款 { $taxAmount }
           *[other] 每 { $intervalCount } 天 { $priceAmount } + 税款 { $taxAmount }
        }
price-details-tax-week =
    { $intervalCount ->
        [one] 每周 { $priceAmount } + 税款 { $taxAmount }
       *[other] 每 { $intervalCount } 周 { $priceAmount } + 税款 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每周 { $priceAmount } + 税款 { $taxAmount }
           *[other] 每 { $intervalCount } 周 { $priceAmount } + 税款 { $taxAmount }
        }
price-details-tax-month =
    { $intervalCount ->
        [one] 每月 { $priceAmount } + 税款 { $taxAmount }
       *[other] 每 { $intervalCount } 个月 { $priceAmount } + 税款 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每月 { $priceAmount } + 税款 { $taxAmount }
           *[other] 每 { $intervalCount } 个月 { $priceAmount } + 税款 { $taxAmount }
        }
price-details-tax-year =
    { $intervalCount ->
        [one] 每年 { $priceAmount } + 税款 { $taxAmount }
       *[other] 每 { $intervalCount } 年 { $priceAmount } + 税款 { $taxAmount }
    }
    .title =
        { $intervalCount ->
            [one] 每年 { $priceAmount } + 税款 { $taxAmount }
           *[other] 每 { $intervalCount } 年 { $priceAmount } + 税款 { $taxAmount }
        }


subscription-create-title = 设置您的订阅
subscription-success-title = 订阅确认
subscription-processing-title = 正在确认订阅…
subscription-error-title = 确认订阅时出现错误…
subscription-noplanchange-title = 不支持更改此订阅方案
subscription-iapsubscribed-title = 已经订阅
sub-guarantee = 30 天退款保证


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = 服务条款
privacy = 隐私声明
terms-download = 下载条款


document =
    .title = Firefox 账户
close-aria =
    .aria-label = 关闭对话框
settings-subscriptions-title = 订阅
coupon-promo-code = 折扣码


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
        [one] 每周 { $amount }
       *[other] 每 { $intervalCount } 周 { $amount }
    }
    .title =
        { $intervalCount ->
            [one] 每周 { $amount }
           *[other] 每 { $intervalCount } 周 { $amount }
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] 每月 { $amount }
       *[other] 每 { $intervalCount } 个月 { $amount }
    }
    .title =
        { $intervalCount ->
            [one] 每月 { $amount }
           *[other] 每 { $intervalCount } 个月 { $amount }
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


general-error-heading = 一般性程序错误
basic-error-message = 出了点问题，请稍后再试。
payment-error-1 = 呃，您的付款授权有问题。请再试一次或与您的发卡机构联系。
payment-error-2 = 呃，您的付款授权有问题。请与您的发卡机构联系。
payment-error-3b = 处理付款时发生意外错误，请重试。
expired-card-error = 您的信用卡已过期，请改用其他卡。
insufficient-funds-error = 您的卡余额不足，请改用其他卡。
withdrawal-count-limit-exceeded-error = 此交易会超过您的卡可用额度，请改用其他卡。
charge-exceeds-source-limit = 此交易会超过您的卡可用额度。请改用其他卡，或在 24 小时后再试一次。
instant-payouts-unsupported = 您的借记卡似乎未允许即时付款。请改用其他借记卡或信用卡。
duplicate-transaction = 呃，看起来刚刚发生了相同的交易。请检查您的付款记录。
coupon-expired = 折扣码似乎已过期。
card-error = 无法处理您的交易。请检查您的信用卡信息，然后重试。
country-currency-mismatch = 您的付款方式所在的国家/地区，无此订阅可用的货币。
currency-currency-mismatch = 抱歉，您不能切换货币。
location-unsupported = 根据服务条款，我们尚未支持您所在的地区。
no-subscription-change = 抱歉，无法更改您的订阅方案。
iap-already-subscribed = 您已通过 { $mobileAppStore } 订阅。
fxa-account-signup-error-2 = 系统出错，导致 { $productName } 订阅失败。尚未扣费，请继续尝试。
fxa-post-passwordless-sub-error = 订阅已确认，但确认页面加载失败。请查收邮件，继续设置账户。
newsletter-signup-error = 您并未订阅接收产品更新邮件，可到账户设置页面中重试。
product-plan-error =
    .title = 方案内容加载出错
product-profile-error =
    .title = 个人资料加载出错
product-customer-error =
    .title = 客户资料加载出错
product-plan-not-found = 找不到方案内容
product-location-unsupported-error = 不支持该地区


coupon-success = 您的方案将自动按标价续订。
coupon-success-repeating = 您的方案将在 { $couponDurationDate } 之后按标价自动续订。


new-user-step-1-2 = 1. 创建 { -product-mozilla-account }
new-user-card-title = 输入您的卡片信息
new-user-submit = 立即订阅


sub-update-payment-title = 付款信息


pay-with-heading-card-only = 刷卡支付
product-invoice-preview-error-title = 加载发票预览时出现问题
product-invoice-preview-error-text = 无法加载发票预览


subscription-iaperrorupgrade-title = 我们暂时无法为您升级


brand-name-google-play-2 = { -google-play } 商店
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = 确认您的更改
sub-change-failed = 方案更改失败
sub-update-acknowledgment = 您的方案将立即更改，并向您收取本期剩余部分的差额。自 { $startingDate } 起将会向您收取全额。
sub-change-submit = 确认更改
sub-update-current-plan-label = 目前方案
sub-update-new-plan-label = 新方案
sub-update-total-label = 新方案金额
sub-update-prorated-upgrade = 按比例补差价升级


sub-update-new-plan-daily = { $productName }（日付）
sub-update-new-plan-weekly = { $productName }（周付）
sub-update-new-plan-monthly = { $productName }（月付）
sub-update-new-plan-yearly = { $productName }（年付）
sub-update-prorated-upgrade-credit = 此处显示的溢余款项将以余额形式返还至您的账户，并将于以后付款时抵用。


sub-item-cancel-sub = 取消订阅
sub-item-stay-sub = 保持订阅


sub-item-cancel-msg = 在账单最后一天（{ $period }）之后，将无法继续使用 { $name }。
sub-item-cancel-confirm = 在 { $period } 之后取消我对 { $name } 的访问权限与保存的所有信息
sub-promo-coupon-applied = 已应用 { $promotion_name } 折扣码：<priceDetails></priceDetails>
subscription-management-account-credit-balance = 此次订阅付款产生了账户余额：<priceDetails></priceDetails>


sub-route-idx-reactivating = 重新激活订阅失败
sub-route-idx-cancel-failed = 订阅取消失败
sub-route-idx-contact = 联系用户支持
sub-route-idx-cancel-msg-title = 很抱歉看到您离开
sub-route-idx-cancel-msg =
    您的 { $name } 订阅已被取消。
          <br />
          在 { $date } 之前，您仍然可以访问 { $name }。
sub-route-idx-cancel-aside-2 = 遇到问题？请访问 <a>{ -brand-mozilla } 技术支持</a>。


sub-customer-error =
    .title = 加载客户资料时出现问题
sub-invoice-error =
    .title = 加载发票时出现问题
sub-billing-update-success = 已成功更新账单信息
sub-invoice-previews-error-title = 加载发票预览时出现问题
sub-invoice-previews-error-text = 无法加载发票预览。


pay-update-change-btn = 更改
pay-update-manage-btn = 管理


sub-next-bill = 下个结算日在 { $date }
sub-next-bill-due-date = 下个结算日为 { $date }
sub-expires-on = 到期于 { $date }




pay-update-card-exp = 有效期 { $expirationDate }
sub-route-idx-updating = 正在更新账单信息…
sub-route-payment-modal-heading = 账单信息无效
sub-route-payment-modal-message-2 = 您的 { -brand-paypal } 账户似乎存在问题，请按下列必要步骤解决此付款问题。
sub-route-missing-billing-agreement-payment-alert = 您的账户出现问题，付款信息无效。<div>点此管理</div>
sub-route-funding-source-payment-alert = 您的账户出现问题，付款信息无效。此提醒将在成功更新信息一段时间后清除。<div>点此管理</div>


sub-item-no-such-plan = 该订阅无此类方案。
invoice-not-found = 找不到后续发票
sub-item-no-such-subsequent-invoice = 找不到此订阅的后续发票。
sub-invoice-preview-error-title = 找不到发票预览
sub-invoice-preview-error-text = 找不到此订阅的发票预览


reactivate-confirm-dialog-header = 是否要继续使用 { $name }？
reactivate-confirm-copy = 您可继续使用 { $name }，账单周期与付款信息将保持不变。下次将于 { $endDate }，对尾号为 { $last } 的卡收取 { $amount }。
reactivate-confirm-without-payment-method-copy = 您可继续使用 { $name }，账单周期与付款信息将保持不变。下次将于 { $endDate } 收取 { $amount }。
reactivate-confirm-button = 重新订阅


reactivate-panel-copy = 您将在<strong> { $date } </strong>失去对 { $name } 的访问权限。
reactivate-success-copy = 处理完成，感谢！
reactivate-success-button = 关闭


sub-iap-item-google-purchase-2 = { -brand-google }：应用内购买
sub-iap-item-apple-purchase-2 = { -brand-apple }：应用内购买
sub-iap-item-manage-button = 管理
