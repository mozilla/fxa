## Non-email strings

session-verify-send-push-title-2 = 正在登录您的 { -product-mozilla-account }？
session-verify-send-push-body-2 = 点击此处以验证本人操作
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { -brand-mozilla } 验证码：{ $code }，5 分钟内有效。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } 验证码：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { -brand-mozilla } 恢复验证码：{ $code }，5分钟内有效。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } 验证码：{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { -brand-mozilla } 恢复验证码：{ $code }，5分钟内有效。
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } 验证码：{ $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } 徽标">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } 徽标">
subplat-automated-email = 这是一封自动发送的邮件。若您意外收到此邮件，无需进行任何操作。
subplat-privacy-notice = 隐私声明
subplat-privacy-plaintext = 隐私声明：
subplat-update-billing-plaintext = { subplat-update-billing }：
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = 您收到此邮件是因为 { $email } 注册了 { -product-mozilla-account }且订阅了 { $productName }。
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = 您收到这封邮件是因为 { $email } 注册了 { -product-mozilla-account }。
subplat-explainer-multiple-2 = 您收到此邮件是因为 { $email } 注册了 { -product-mozilla-account }且订阅了多个产品。
subplat-explainer-was-deleted-2 = 您收到这封邮件是因为 { $email } 注册了 { -product-mozilla-account }。
subplat-manage-account-2 = 请访问<a data-l10n-name="subplat-account-page">账户页面</a>管理 { -product-mozilla-account }的设置。
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = 请访问您的账户页面管理 { -product-mozilla-account }的设置：{ $accountSettingsUrl }
subplat-terms-policy = 条款及取消政策
subplat-terms-policy-plaintext = { subplat-terms-policy }：
subplat-cancel = 取消订阅
subplat-cancel-plaintext = { subplat-cancel }：
subplat-reactivate = 重新激活订阅
subplat-reactivate-plaintext = { subplat-reactivate }：
subplat-update-billing = 更新结算信息
subplat-privacy-policy = { -brand-mozilla } 隐私政策
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") }隐私声明
subplat-privacy-policy-plaintext = { subplat-privacy-policy }：
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }：
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } 服务条款
subplat-moz-terms-plaintext = { subplat-moz-terms }
subplat-legal = 法律
subplat-legal-plaintext = { subplat-legal }：
subplat-privacy = 隐私
subplat-privacy-website-plaintext = { subplat-privacy }：
cancellationSurvey = 请填写这份<a data-l10n-name="cancellationSurveyUrl">简短问卷</a> ，帮助我们改善服务质量。
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = 请填写这份简短问卷，帮助我们改善服务质量：
payment-details = 付款详情：
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = 发票号码：{ $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = 已于 { $invoiceDateOnly } 收取 { $invoiceTotal }
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

payment-provider-card-name-ending-in-plaintext = 付款方式：尾号为 { $lastFour } 的 { $cardName }
payment-provider-card-ending-in-plaintext = 付款方式：尾号为 { $lastFour } 的卡片
payment-provider-card-ending-in = <b>付款方式：</b>尾号为 { $lastFour } 的卡片
payment-provider-card-ending-in-card-name = <b>付款方式：</b>尾号为 { $lastFour } 的 { $cardName } 卡
subscription-charges-invoice-summary = 发票摘要

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>发票号码：</b>{ $invoiceNumber }
subscription-charges-invoice-number-plaintext = 发票号码：{ $invoiceNumber }
subscription-charges-invoice-date = <b>日期：</b>{ $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = 日期：{ $invoiceDateOnly }
subscription-charges-prorated-price = 差价
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = 差价：{ $remainingAmountTotal }
subscription-charges-list-price = 原价
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = 原价：{ $offeringPrice }
subscription-charges-credit-from-unused-time = 转换自未使用天数的余额
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = 转换自未使用天数的余额：{ $unusedAmountTotal }
subscription-charges-subtotal = <b>小计</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = 小计：{ $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = 一次性折扣
subscription-charges-one-time-discount-plaintext = 一次性折扣：{ $invoiceDiscountAmount }
subscription-charges-repeating-discount = { $discountDuration } 个月折扣
subscription-charges-repeating-discount-plaintext = { $discountDuration } 个月折扣：{ $invoiceDiscountAmount }
subscription-charges-discount = 折扣
subscription-charges-discount-plaintext = 折扣：{ $invoiceDiscountAmount }
subscription-charges-taxes = 税费
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = 税费：{ $invoiceTaxAmount }
subscription-charges-total = <b>总计</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = 总计：{ $invoiceTotal }
subscription-charges-credit-applied = 使用余额
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = 使用余额：{ $creditApplied }
subscription-charges-amount-paid = <b>实付金额</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = 实付金额：{ $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = 您已收到 { $creditReceived } 账户余额，将于以后付款时抵用。

##

subscriptionSupport = 遇到订阅相关的问题？我们的<a data-l10n-name="subscriptionSupportUrl">用户支持团队</a>在此为您答疑。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = 遇到订阅相关的问题？我们的支持团队在此为您答疑：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = 感谢您订阅 { $productName }。如果您对您的订阅有任何疑问，或需要了解有关 { $productName } 的更多信息，请<a data-l10n-name="subscriptionSupportUrl">联系我们</a>。
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = 感谢您订阅 { $productName }。如果您对您的订阅有任何疑问，或需要了解有关{ $productName } 的更多信息，请联系我们：
subscription-support-get-help = 获取订阅方面的帮助
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">管理订阅</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = 管理订阅：
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">联系支持</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = 联系支持：
subscriptionUpdateBillingEnsure = 您可以在<a data-l10n-name="updateBillingUrl">此处</a>确认您的付款方式和账户信息是否为最新。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = 您可以在此处确认您的付款方式和账户信息是否为最新：
subscriptionUpdateBillingTry = 我们将在几天内重试您的付款操作，但您也有可能需要通过<a data-l10n-name="updateBillingUrl">更新您的付款信息</a>来帮助我们解决该问题。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = 我们将在几天内重试付款操作，但您可能需要更新付款信息来帮助我们解决该问题：
subscriptionUpdatePayment = 为避免服务中断，请您及时<a data-l10n-name="updateBillingUrl">更新付款信息</a>。
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = 为避免服务中断，请您及时更新付款信息：
view-invoice-link-action = 查看发票
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = 查看发票：{ $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = 欢迎使用 { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = 欢迎使用 { $productName }
downloadSubscription-content-2 = 准备开始使用包含在您的订阅内的所有功能吧：
downloadSubscription-link-action-2 = 开始使用
fraudulentAccountDeletion-subject-2 = 已删除您的 { -product-mozilla-account }
fraudulentAccountDeletion-title = 已删除您的账户
fraudulentAccountDeletion-content-part1-v2 = 最近有人使用此邮箱地址创建 { -product-mozilla-account }并支付订阅。根据我们对所有新账户的要求，需要您先验证此邮箱地址来确认账户。
fraudulentAccountDeletion-content-part2-v2 = 目前，该账户尚未完成验证，无法确定是否为授权的订阅行为。因此，我们已删除使用此邮箱地址注册的 { -product-mozilla-account }，并取消订阅，所有费用均已退还。
fraudulentAccountDeletion-contact = 如有疑问，请联系我们的<a data-l10n-name="mozillaSupportUrl">用户支持团队</a>。
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = 如有疑问，请联系我们的用户支持团队：{ $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = 您的 { $productName } 订阅已取消
subscriptionAccountDeletion-title = 不敢说后会有期，但愿有缘再见
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = 您最近删除了 { -product-mozilla-account }，因此我们也同步取消了您的 { $productName } 订阅。最后一笔款项金额为 { $invoiceTotal }，已于 { $invoiceDateOnly } 支付。
subscriptionAccountReminderFirst-subject = 提醒：请完成账户设置
subscriptionAccountReminderFirst-title = 您暂时还不能访问订阅的项目
subscriptionAccountReminderFirst-content-info-3 = 您几天前创建的 { -product-mozilla-account }还未完成确认。请尽快完成账户设置，以便使用新订阅的内容。
subscriptionAccountReminderFirst-content-select-2 = 选择“创建密码”设置新密码并完成账户验证。
subscriptionAccountReminderFirst-action = 创建密码
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action } :
subscriptionAccountReminderSecond-subject = 最后一次提醒：请设置您的账户
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } 欢迎您！
subscriptionAccountReminderSecond-content-info-3 = 您几天前创建的 { -product-mozilla-account }还未完成确认。请尽快完成账户设置，以便使用新订阅的内容。
subscriptionAccountReminderSecond-content-select-2 = 选择“创建密码”设置新密码并完成账户验证。
subscriptionAccountReminderSecond-action = 创建密码
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }：
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = 您的 { $productName } 订阅已取消
subscriptionCancellation-title = 不敢说后会有期，但愿有缘再见

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = 我们已取消您的 { $productName } 订阅。最后一笔款项 { $invoiceTotal } 已于 { $invoiceDateOnly } 支付。
subscriptionCancellation-outstanding-content-2 = 我们已取消您的 { $productName } 订阅。最后一笔款项 { $invoiceTotal } 将于 { $invoiceDateOnly } 支付。
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = 您可持续使用订阅的服务至账单周期结束（{ $serviceLastActiveDateOnly }）为止。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = 您已切换至 { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = 您已成功从 { $productNameOld } 切换至 { $productName }。
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = 从下一期账单开始，我们就会从每 { $productPaymentCycleOld } 收费 { $paymentAmountOld } 调整为每 { $productPaymentCycleNew } 收费 { $paymentAmountNew } 。届时，我们会向您一次性添加 { $paymentProrated } 余额，以退还本 { $productPaymentCycleOld } 剩余天数的差额。
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = 若需要安装新软件才能使用 { $productName }，我们会将下载方式用另一封电子邮件发送予您。
subscriptionDowngrade-content-auto-renew = 除非您主动取消订阅，否则将在每个周期周期开始时自动更新订阅并收费。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = 您的 { $productName } 订阅即将到期
subscriptionEndingReminder-title = 您的 { $productName } 订阅即将到期
subscriptionEndingReminder-content-line2 = 若要继续使用 { $productName }，请在 <strong>{ $serviceLastActiveDateOnly }</strong>前，到<a data-l10n-name="subscriptionEndingReminder-account-settings">账户设置</a>中续期订阅。如需协助，请<a data-l10n-name="subscriptionEndingReminder-contact-support">联系支持团队</a>。
subscriptionEndingReminder-content-line2-plaintext = 若要继续使用 { $productName }，请在 { $serviceLastActiveDateOnly } 前，到“账户设置”中续期订阅。如需协助，请联系支持团队。
subscriptionEndingReminder-churn-title = 希望继续使用？
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = 下列限制条款和限制条件适用：{ $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = 联系支持团队：{ $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = 您的 { $productName } 订阅已取消
subscriptionFailedPaymentsCancellation-title = 已取消您的订阅
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = 由于多次付款失败，我们已取消您的 { $productName } 订阅。若需再次访问订阅内容，请使用新的付款方式重新订阅。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = 已确认 { $productName } 付款
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = 感谢您订阅 { $productName }！
subscriptionFirstInvoice-content-processing = 正在处理您的款项，最多需要四个工作天才能完成。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = 您将收到另一封电子邮件，介绍如何开始使用 { $productName }。
subscriptionFirstInvoice-content-auto-renew = 除非您主动取消订阅，否则将在每个周期开始时自动更新订阅并收费。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = 下次将于 { $nextInvoiceDateOnly } 开具发票。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName } 的付款方式已过期或即将到期
subscriptionPaymentExpired-title-2 = 您的付款方式已过期或即将到期
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = 您用于 { $productName } 的付款方式已过期或即将到期。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } 付款失败
subscriptionPaymentFailed-title = 抱歉，处理付款时遇到问题
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = 处理您最近对 { $productName } 付款时，遇到问题。
subscriptionPaymentFailed-content-outdated-1 = 可能是您的付款方式已过期，或是当前的付款方式已失效。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = 需要更新 { $productName } 的付款信息
subscriptionPaymentProviderCancelled-title = 抱歉，处理付款时遇到问题
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = 处理您最近为 { $productName } 的付款时遇到问题。
subscriptionPaymentProviderCancelled-content-reason-1 = 可能是您的付款方式已过期，或是当前的付款方式已失效。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = 已重新开始订阅 { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = 感谢您重新开始订阅 { $productName }！
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = 您的账单周期与付款信息将保持不变，下次将于 { $nextInvoiceDateOnly } 收取 { $invoiceTotal }。在您主动取消之前，将一直自动续订。
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } 自动续订通知
subscriptionRenewalReminder-title = 您的订阅即将续订
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = 尊敬的 { $productName } 用户，
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = 您当前的订阅将在 { $reminderLength } 天后自动续订。
subscriptionRenewalReminder-content-discount-change = 您的下一期账单将体现因原折扣结束、新折扣生效引起的价格调整。
subscriptionRenewalReminder-content-discount-ending = 由于原有折扣已结束，您的订阅将以标准价格续订。
subscriptionRenewalReminder-content-closing = 此致，
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } 团队
subscriptionReplaced-subject = 您的订阅已随方案升级而更新。
subscriptionReplaced-title = 您的订阅已更新
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = 已替换您单独的 { $productName } 订阅，其现已包含在您新的捆绑包中。
subscriptionReplaced-content-credit = 上个订阅中未使用的天数将以余额形式返还至您的账户。余额将自动添加到您的帐户，并抵扣将来的费用。
subscriptionReplaced-content-no-action = 您无需执行任何操作。
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = 已收到 { $productName } 付款
subscriptionSubsequentInvoice-title = 感谢您成为订阅者！
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = 我们已收到您最近为 { $productName } 支付的款项。
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = 下次将于 { $nextInvoiceDateOnly } 开具发票。
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = 您已升级至 { $productName }
subscriptionUpgrade-title = 感谢您的升级订阅！
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = 您已成功升级至 { $productName }。

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = 我们已向您一次性收取 { $invoiceAmountDue }，以补足您的订阅在本账单周期（{ $productPaymentCycleOld }）内剩余天数的差额。
subscriptionUpgrade-content-charge-credit = 您已收到合计 { $paymentProrated } 的账户余额。
subscriptionUpgrade-content-subscription-next-bill-change = 自下期账单起，您的订阅价格将发生变化。
subscriptionUpgrade-content-old-price-day = 此前的费用是每天 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-week = 此前的费用是每周 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-month = 此前的费用是每月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-halfyear = 此前的费用是每六个月 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-year = 此前的费用是每年 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-default = 此前的费用是每账单周期 { $paymentAmountOld }。
subscriptionUpgrade-content-old-price-day-tax = 此前的费用是每天 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-week-tax = 此前的费用是每周 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-month-tax = 此前的费用是每月 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-halfyear-tax = 此前的费用是每六个月 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-year-tax = 此前的费用是每年 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-old-price-default-tax = 此前的费用是每账单周期 { $paymentAmountOld } + 税款 { $paymentTaxOld }。
subscriptionUpgrade-content-new-price-day = 此后，您将需要日付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-week = 此后，您将需要周付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-month = 此后，您将需要月付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-halfyear = 此后，您将需要每六个月支付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-year = 此后，您将需要年付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-default = 此后，您将需要每账单周期支付 { $paymentAmountNew }（未含折扣）。
subscriptionUpgrade-content-new-price-day-dtax = 此后，您将需要日付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-week-tax = 此后，您将需要周付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-month-tax = 此后，您将需要月付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-halfyear-tax = 此后，您将需要每六个月支付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-year-tax = 此后，您将需要年付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-content-new-price-default-tax = 此后，您将需要每账单周期支付 { $paymentAmountNew } + 税款 { $paymentTaxNew }（未含折扣）。
subscriptionUpgrade-existing = 若此次的升级内容与您现有的订阅重合，我们将进行处理，并向您单独发送一封邮件说明详细信息。若您的新方案包含需要安装的产品，我们将向您单独发送一封邮件说明安装方法。
subscriptionUpgrade-auto-renew = 除非您主动取消订阅，否则将在每个周期周期开始时自动更新订阅并收费。
subscriptionsPaymentExpired-subject-2 = 您用于订阅的付款方式已过期或即将到期
subscriptionsPaymentExpired-title-2 = 您的付款方式已过期或即将到期
subscriptionsPaymentExpired-content-2 = 您用于支付以下订阅的付款方式已过期或即将到期。
subscriptionsPaymentProviderCancelled-subject = 需要更新 { -brand-mozilla } 产品订阅的付款信息
subscriptionsPaymentProviderCancelled-title = 抱歉，处理付款时遇到问题
subscriptionsPaymentProviderCancelled-content-detected = 处理您最近为下列订阅项目的付款时遇到问题。
subscriptionsPaymentProviderCancelled-content-payment-1 = 可能是您的付款方式已过期，或是当前的付款方式已失效。
