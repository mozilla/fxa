loyalty-discount-terms-heading = 条款和限制
loyalty-discount-terms-support = 联系技术支持
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = 联系 { $productName } 技术支持
not-found-page-title-terms = 找不到页面
not-found-page-description-terms = 您要找的页面不存在。
not-found-page-button-terms-manage-subscriptions = 管理订阅

## Page

checkout-signin-or-create = 1. 登录或创建 { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = 或
continue-signin-with-google-button = 通过 { -brand-google } 登录
continue-signin-with-apple-button = 通过 { -brand-apple } 登录
next-payment-method-header = 选择付款方式
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = 请先核准您的订阅
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = 请选择您的国家/地区，并输入邮政编码<p>以继续为 { $productName } 付款</p>
location-banner-info = 无法自动检测您的位置
location-required-disclaimer = 我们只会将此信息用于计算税款和决定货币。
location-banner-currency-change = 不支持更改货币。请选择与您当前支付货币相匹配的国家/地区继续。

## Page - Upgrade page

upgrade-page-payment-information = 付款信息
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = 您的方案将立即更改，并向您收取本期剩余部分的差额。自 { $nextInvoiceDate } 起将会向您收取全额。

## Authentication Error page

auth-error-page-title = 无法登录
checkout-error-boundary-retry-button = 重试
checkout-error-boundary-basic-error-message = 出了点问题。请重试或<contactSupportLink>联系用户支持</contactSupportLink>。
amex-logo-alt-text = { -brand-amex }徽标
diners-logo-alt-text = { -brand-diner }徽标
discover-logo-alt-text = { -brand-discover }徽标
jcb-logo-alt-text = { -brand-jcb } 徽标
mastercard-logo-alt-text = { -brand-mastercard }徽标
paypal-logo-alt-text = { -brand-paypal } 徽标
unionpay-logo-alt-text = { -brand-unionpay }徽标
visa-logo-alt-text = { -brand-visa } 徽标
# Alt text for generic payment card logo
unbranded-logo-alt-text = 未知品牌的徽标
link-logo-alt-text = { -brand-link } 徽标
apple-pay-logo-alt-text = { -brand-apple-pay } 徽标
google-pay-logo-alt-text = { -brand-google-pay } 徽标

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = 管理我的订阅
next-iap-blocked-contact-support = 您有一份移动版应用内订阅与此产品冲突，请联系支持以获取帮助。
next-payment-error-retry-button = 请重试
next-basic-error-message = 出了点问题，请稍后再试。
checkout-error-contact-support-button = 联系支持
checkout-error-not-eligible = 您未满足订阅此产品所需的条件，请联系支持以获取帮助。
checkout-error-already-subscribed = 您此前已经订阅此产品。
checkout-error-contact-support = 请联系支持以获取帮助。
cart-error-currency-not-determined = 无法确定此次交易使用的货币，请重试。
checkout-processing-general-error = 处理付款时发生意外错误，请重试。
cart-total-mismatch-error = 发票金额已更改。请重试。

## Error pages - Payment method failure messages

intent-card-error = 无法处理您的交易。请检查您的信用卡信息，然后重试。
intent-expired-card-error = 您的信用卡似乎已过期，请改用其他卡。
intent-payment-error-try-again = 嗯… 在授权您的付款时出现问题。请再试一次，或联系您的发卡机构。
intent-payment-error-get-in-touch = 嗯… 在授权您的付款时出现问题，请联系您的发卡机构。
intent-payment-error-generic = 处理付款时发生意外错误，请重试。
intent-payment-error-insufficient-funds = 您的卡余额不足，请改用其他卡。
general-paypal-error = 处理付款时发生意外错误，请重试。
paypal-active-subscription-no-billing-agreement-error = 从您的 { -brand-paypal } 账户扣款时出现问题，请为您的订阅重新启用自动付款。

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = 请稍候，我们正在处理您的付款…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = 感谢，请注意查收邮件！
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = 您将会在 { $email } 收到一封邮件，其中包含订阅说明以及付款信息。
next-payment-confirmation-order-heading = 订单详细信息
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = 发票号码 #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = 付款信息

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = 前往下载

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = 卡号末四位：{ $last4 }

## Not found page

not-found-title-subscriptions = 未找到订阅
not-found-description-subscriptions = 未找到您的订阅，请重试或联系技术支持。
not-found-button-back-to-subscriptions = 返回“订阅”

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = 未添加付款方式
subscription-management-page-banner-warning-link-no-payment-method = 添加付款方式
subscription-management-subscriptions-heading = 订阅
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = 跳转到
subscription-management-nav-payment-details = 付款详情
subscription-management-nav-active-subscriptions = 生效中订阅
subscription-management-payment-details-heading = 付款详情
subscription-management-email-label = 电子邮件
subscription-management-credit-balance-label = 余额
subscription-management-credit-balance-message = 余额将于以后付款时自动抵用
subscription-management-payment-method-label = 付款方式
subscription-management-button-add-payment-method-aria = 添加付款方式
subscription-management-button-add-payment-method = 添加
subscription-management-page-warning-message-no-payment-method = 请添加付款方式，以避免订阅中断。
subscription-management-button-manage-payment-method-aria = 管理付款方式
subscription-management-button-manage-payment-method = 管理
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = 尾号 { $last4 } 的卡片
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = 有效期 { $expirationDate }
subscription-management-active-subscriptions-heading = 生效中订阅
subscription-management-you-have-no-active-subscriptions = 暂无生效中订阅
subscription-management-new-subs-will-appear-here = 新的订阅将显示于此处。
subscription-management-your-active-subscriptions-aria = 您的生效中订阅
subscription-management-button-support = 获取帮助
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = 获取 { $productName } 的帮助信息
subscription-management-your-apple-iap-subscriptions-aria = 您的 { -brand-apple } 应用内订阅
subscription-management-apple-in-app-purchase-2 = { -brand-apple } 应用内购买
subscription-management-your-google-iap-subscriptions-aria = 您的 { -brand-google } 应用内订阅
subscription-management-google-in-app-purchase-2 = { -brand-google } 应用内购买
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = { $date } 到期
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = 管理 { $productName } 的订阅
subscription-management-button-manage-subscription-1 = 管理订阅
error-payment-method-banner-title-expired-card = 卡片已过期
error-payment-method-banner-message-add-new-card = 请添加新卡片或付款方式，以避免订阅中断。
error-payment-method-banner-label-update-payment-method = 更新付款方式
error-payment-method-expired-card = 您的卡片已过期。请添加新卡片或付款方式，以避免订阅中断。
error-payment-method-banner-title-invalid-payment-information = 付款信息无效
error-payment-method-banner-message-account-issue = 您的账户存在问题。
subscription-management-button-manage-payment-method-1 = 管理付款方式
subscription-management-error-apple-pay = 您的 { -brand-apple-pay } 账户存在问题，请解决该问题以保持订阅有效。
subscription-management-error-google-pay = 您的 { -brand-google-pay } 账户存在问题，请解决该问题以保持订阅有效。
subscription-management-error-link = 您的 { -brand-link } 账户存在问题，请解决该问题以保持订阅有效。
subscription-management-error-paypal-billing-agreement = 您的 { -brand-paypal } 账户存在问题，请解决该问题以保持订阅有效。
subscription-management-error-payment-method = 您的付款方式存在问题，请解决该问题以保持订阅有效。
manage-payment-methods-heading = 管理付款方式
paypal-payment-management-page-invalid-header = 账单信息无效
paypal-payment-management-page-invalid-description = 您的 { -brand-paypal } 账户似乎存在问题，请按下列必要步骤解决此付款问题。
# Page - Not Found
page-not-found-title = 找不到页面
page-not-found-description = 找不到您要打开的页面。我们已获悉此问题，并将修复可能出现问题的链接。
page-not-found-back-button = 返回
alert-dialog-title = 提示对话框

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = 账户主页
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = 订阅
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = 管理付款方式
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = 返回{ $page }

## CancelSubscription

subscription-cancellation-dialog-title = 有缘再会
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = 您的 { $name } 订阅已取消。您仍可使用 { $name } 到 { $date }。
subscription-cancellation-dialog-aside = 遇到问题？请访问 <LinkExternal>{ -brand-mozilla } 技术支持</LinkExternal>。
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = 取消 { $productName } 订阅

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = 在账单周期的最后一天（{ $currentPeriodEnd }）过后，您将无法继续使用 { $productName }。
subscription-content-cancel-access-message = 在 { $currentPeriodEnd } 后取消我的 { $productName } 使用权，并删除保存的信息

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = 取消订阅
    .aria-label = 取消订阅 { $productName }
cancel-subscription-button-stay-subscribed = 继续订阅
    .aria-label = 继续订阅 { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = 我授权 { -brand-mozilla } 依照<termsOfServiceLink>服务条款</termsOfServiceLink>和<privacyNoticeLink>隐私声明</privacyNoticeLink>，从我的付款方式收取此费用，直到我主动取消订阅为止。
next-payment-confirm-checkbox-error = 同意此项后才可继续

## Checkout Form

next-new-user-submit = 立即订阅
next-pay-with-heading-paypal = 通过 { -brand-paypal } 付款

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = 输入折扣码
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = 折扣码
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = 已应用折扣码
next-coupon-remove = 移除
next-coupon-submit = 应用

# Component - Header

payments-header-help =
    .title = 帮助
    .aria-label = 帮助
    .alt = 帮助
payments-header-bento =
    .title = { -brand-mozilla } 产品
    .aria-label = { -brand-mozilla } 产品
    .alt = { -brand-mozilla } 徽标
payments-header-bento-close =
    .alt = 关闭
payments-header-bento-tagline = { -brand-mozilla } 的更多保护您隐私的产品。
payments-header-bento-firefox-desktop = { -brand-firefox } 桌面浏览器
payments-header-bento-firefox-mobile = { -brand-firefox } 移动浏览器
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = { -brand-mozilla } 出品
payments-header-avatar =
    .title = { -product-mozilla-account } 菜单
payments-header-avatar-icon =
    .alt = 账户头像
payments-header-avatar-expanded-signed-in-as = 已登录
payments-header-avatar-expanded-sign-out = 退出
payments-client-loading-spinner =
    .aria-label = 正在加载…
    .alt = 正在加载…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = 设为默认付款方式
# Save button for saving a new payment method
payment-method-management-save-method = 保存付款方式
manage-stripe-payments-title = 管理付款方式

## Component - PurchaseDetails

next-plan-details-header = 产品详细信息
next-plan-details-list-price = 标价
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = { $productName } 的差价
next-plan-details-tax = 税费
next-plan-details-total-label = 总计
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = 转换自未使用天数的余额
purchase-details-subtotal-label = 小计
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = 使用余额
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = 合计应付
next-plan-details-hide-button = 隐藏详细信息
next-plan-details-show-button = 显示详细信息
next-coupon-success = 您的方案将自动按标价续订。
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = 您的方案将在 { $couponDurationDate } 之后按标价自动续订。

## Select Tax Location

select-tax-location-title = 位置
select-tax-location-edit-button = 编辑
select-tax-location-save-button = 保存
select-tax-location-continue-to-checkout-button = 继续结账
select-tax-location-country-code-label = 国家/地区
select-tax-location-country-code-placeholder = 选择国家/地区
select-tax-location-error-missing-country-code = 请选择您所在的国家/地区
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } 尚未在此地区推出。
select-tax-location-postal-code-label = 邮政编码
select-tax-location-postal-code =
    .placeholder = 请输入您的邮政编码
select-tax-location-error-missing-postal-code = 请输入您的邮政编码
select-tax-location-error-invalid-postal-code = 请输入有效的邮政编码
select-tax-location-successfully-updated = 您的位置已更新。
select-tax-location-error-location-not-updated = 无法更新您的位置。请重试。
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = 您的账户需通过 { $currencyDisplayName } 结算。请选择使用 { $currencyDisplayName } 的国家/地区。
select-tax-location-invalid-currency-change-default = 请选择与您的有效订阅所使用货币相匹配的国家/地区。
select-tax-location-new-tax-rate-info = 更新位置后，您账户的所有有效订阅将适用新的税率，自下个账单周期起生效。
signin-form-continue-button = 继续
signin-form-email-input = 请输入您的邮箱地址
signin-form-email-input-missing = 请输入您的邮箱地址
signin-form-email-input-invalid = 请输入有效的邮箱地址
next-new-user-subscribe-product-updates-mdnplus = 我愿意接收来自 { -product-mdn-plus } 和 { -brand-mozilla } 的产品新闻及更新
next-new-user-subscribe-product-updates-mozilla = 我愿意接收来自 { -brand-mozilla } 的产品新闻和更新
next-new-user-subscribe-product-updates-snp = 我愿意接收来自 { -brand-mozilla } 的安全和隐私新闻及更新
next-new-user-subscribe-product-assurance = 我们只会使用您的邮箱地址来创建账户，绝不会将其出售予第三方。

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = 希望继续使用 { $productName }？
stay-subscribed-access-will-continue = 您可继续使用 { $productName }，账单周期与付款信息将保持不变。
subscription-content-button-resubscribe = 重新订阅
    .aria-label = 重新订阅 { $productName }
resubscribe-success-dialog-title = 处理完成，感谢！

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = 下次将于 { $currentPeriodEnd } 收取 { $nextInvoiceTotal } + 税费 { $taxDue }。
stay-subscribed-next-charge-no-tax = 下次将于 { $currentPeriodEnd } 收取 { $nextInvoiceTotal }。

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = 将使用 { $promotionName } 折扣
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = 上个结算日 • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + 税费 { $taxDue }
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = 查看发票
subscription-management-link-view-invoice-aria = 查看 { $productName } 的发票
subscription-content-expires-on-expiry-date = { $date } 到期
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = 下个结算日 • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + 税费 { $taxDue }
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = 继续订阅
    .aria-label = 继续订阅 { $productName }
subscription-content-button-cancel-subscription = 取消订阅
    .aria-label = 取消订阅 { $productName }

##

dialog-close = 关闭对话框
button-back-to-subscriptions = 返回“订阅”
subscription-content-cancel-action-error = 发生意外错误，请重试。

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount }/天
plan-price-interval-weekly = { $amount }/周
plan-price-interval-monthly = { $amount }/月
plan-price-interval-halfyearly = { $amount }/6个月
plan-price-interval-yearly = { $amount }/年

## Component - SubscriptionTitle

next-subscription-create-title = 设置您的订阅
next-subscription-success-title = 订阅确认
next-subscription-processing-title = 正在确认订阅…
next-subscription-error-title = 确认订阅时出现错误…
subscription-title-sub-exists = 您此前已经订阅。
subscription-title-plan-change-heading = 确认更改内容
subscription-title-not-supported = 不支持更改此订阅方案
next-sub-guarantee = 30 天退款保证

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = 服务条款
next-privacy = 隐私声明
next-terms-download = 下载条款
terms-and-privacy-stripe-label = { -brand-mozilla } 使用 { -brand-name-stripe } 进行安全支付。
terms-and-privacy-stripe-link = { -brand-name-stripe } 隐私政策
terms-and-privacy-paypal-label = { -brand-mozilla } 使用 { -brand-paypal } 进行安全支付。
terms-and-privacy-paypal-link = { -brand-paypal } 隐私政策
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } 使用 { -brand-name-stripe } 和 { -brand-paypal } 进行安全支付。

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = 目前方案
upgrade-purchase-details-new-plan-label = 新方案
upgrade-purchase-details-promo-code = 折扣码
upgrade-purchase-details-tax-label = 税费
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = 余额已存入账户
upgrade-purchase-details-credit-will-be-applied = 余额将返还至您的账户，并将于以后付款时抵用。

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName }（日付）
upgrade-purchase-details-new-plan-weekly = { $productName }（周付）
upgrade-purchase-details-new-plan-monthly = { $productName }（月付）
upgrade-purchase-details-new-plan-halfyearly = { $productName }（半年付）
upgrade-purchase-details-new-plan-yearly = { $productName }（年付）

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = 结算 | { $productTitle }
metadata-description-checkout-start = 请输入付款详细信息以完成购买。
# Checkout processing
metadata-title-checkout-processing = 正在处理 | { $productTitle }
metadata-description-checkout-processing = 正在处理您的付款，请稍候。
# Checkout error
metadata-title-checkout-error = 错误 | { $productTitle }
metadata-description-checkout-error = 处理您的订阅时发生错误。若此问题始终存在，请联系支持。
# Checkout success
metadata-title-checkout-success = 成功 | { $productTitle }
metadata-description-checkout-success = 恭喜！您已成功完成购买。
# Checkout needs_input
metadata-title-checkout-needs-input = 需要操作 | { $productTitle }
metadata-description-checkout-needs-input = 请完成必要的操作以继续付款。
# Upgrade start
metadata-title-upgrade-start = 升级 | { $productTitle }
metadata-description-upgrade-start = 请输入付款详细信息以完成升级。
# Upgrade processing
metadata-title-upgrade-processing = 正在处理 | { $productTitle }
metadata-description-upgrade-processing = 正在处理您的付款，请稍候。
# Upgrade error
metadata-title-upgrade-error = 错误 | { $productTitle }
metadata-description-upgrade-error = 处理您的升级时发生错误。若此问题始终存在，请联系支持。
# Upgrade success
metadata-title-upgrade-success = 成功 | { $productTitle }
metadata-description-upgrade-success = 恭喜！您已成功完成升级。
# Upgrade needs_input
metadata-title-upgrade-needs-input = 需要操作 | { $productTitle }
metadata-description-upgrade-needs-input = 请完成必要的操作以继续付款。
# Default
metadata-title-default = 找不到页面 | { $productTitle }
metadata-description-default = 找不到您请求的页面。

## Coupon Error Messages

next-coupon-error-cannot-redeem = 无法兑换您输入的兑换码，因为您的账户此前已订阅我们的其中一项服务。
next-coupon-error-expired = 您输入的折扣码已过期。
next-coupon-error-generic = 处理折扣码时出错，请重试。
next-coupon-error-invalid = 您输入的折扣码无效。
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = 您输入的折扣码已达使用次数上限。

## Stay Subscribed Error Messages

stay-subscribed-error-expired = 此优惠已过期。
stay-subscribed-error-discount-used = 已经使用此折扣码。
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = 此折扣仅面向当前已订阅 { $productTitle } 的用户。
stay-subscribed-error-still-active = 您的 { $productTitle } 订阅仍在有效期内。
stay-subscribed-error-general = 您的续订出现问题。
