## Non-email strings

session-verify-send-push-title-2 = Входите в { -product-mozilla-account(case: "nominative") }?
session-verify-send-push-body-2 = Нажмите здесь, чтобы подтвердить, что это вы
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } — ваш код подтверждения { -brand-mozilla }. Срок действия кода составляет 5 минут.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Код подтверждения { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } — ваш код восстановления { -brand-mozilla }. Срок действия кода составляет 5 минут.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Код { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } — ваш код восстановления { -brand-mozilla }. Срок действия кода составляет 5 минут.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Код { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Логотип { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Логотип { -brand-mozilla }">
subplat-automated-email = Это автоматическое сообщение; если вы получили его по ошибке, не требуется никаких действий.
subplat-privacy-notice = Уведомление о конфиденциальности
subplat-privacy-plaintext = Уведомление о конфиденциальности:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Вы получили это письмо, потому что { $email } есть в { -product-mozilla-account(case: "prepositional") } и вы подписались на { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Вы получили это письмо, потому что { $email } есть в { -product-mozilla-account(case: "prepositional") }.
subplat-explainer-multiple-2 = Вы получили это письмо, потому что { $email } есть в { -product-mozilla-account(case: "prepositional") } и вы подписались на несколько продуктов.
subplat-explainer-was-deleted-2 = Вы получили это письмо, потому что { $email } зарегистрирован в { -product-mozilla-account(case: "prepositional") }.
subplat-manage-account-2 = Управлять настройками { -product-mozilla-account(case: "genitive") } можно на <a data-l10n-name="subplat-account-page">странице аккаунта</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Управлять настройками { -product-mozilla-account(case: "genitive") } можно на странице вашего аккаунта: { $accountSettingsUrl }
subplat-terms-policy = Условия и политика отказа от подписки
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Отменить подписку
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Активировать подписку повторно
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Обновить платёжные сведения
subplat-privacy-policy = Политика конфиденциальности { -brand-mozilla }
subplat-privacy-policy-2 = Уведомление о конфиденциальности { -product-mozilla-accounts(case: "genitive") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Правила использования { -product-mozilla-accounts(case: "genitive") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Права
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Конфиденциальность
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Пожалуйста, помогите нам улучшить наши службы, приняв участие в этом <a data-l10n-name="cancellationSurveyUrl">кратком опросе</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Пожалуйста, помогите нам улучшить наши службы, приняв участие в этом кратком опросе:
payment-details = Подробности оплаты:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Номер счёта: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceDateOnly } оплачено { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Следующая оплата: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Способ оплаты:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Способ оплаты: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Способ оплаты: { $cardName }, оканчивающаяся на { $lastFour }
payment-provider-card-ending-in-plaintext = Способ оплаты: Карта, оканчивающаяся на { $lastFour }
payment-provider-card-ending-in = <b>Способ оплаты:</b> Карта, оканчивающаяся на { $lastFour }
payment-provider-card-ending-in-card-name = <b>Способ оплаты:</b> { $cardName }, оканчивающаяся на { $lastFour }
subscription-charges-invoice-summary = Сводка по счёту

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Номер счёта:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Номер счёта: { $invoiceNumber }
subscription-charges-invoice-date = <b>Дата:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Дата: { $invoiceDateOnly }
subscription-charges-prorated-price = Пропорциональная цена
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Пропорциональная цена: { $remainingAmountTotal }
subscription-charges-list-price = Цена по прейскуранту
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Цена по прейскуранту: { $offeringPrice }
subscription-charges-credit-from-unused-time = Кредит за неиспользованное время
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Кредит за неиспользованное время: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Промежуточный итог</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Промежуточный итог: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Разовая скидка
subscription-charges-one-time-discount-plaintext = Разовая скидка: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-месячная скидка
        [few] { $discountDuration }-месячная скидка
       *[many] { $discountDuration }-месячная скидка
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-месячная скидка: { $invoiceDiscountAmount }
        [few] { $discountDuration }-месячная скидка: { $invoiceDiscountAmount }
       *[many] { $discountDuration }-месячная скидка: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Скидка
subscription-charges-discount-plaintext = Скидка: { $invoiceDiscountAmount }
subscription-charges-taxes = Налоги и сборы
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Налоги и сборы: { $invoiceTaxAmount }
subscription-charges-total = <b>Всего</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Всего: { $invoiceTotal }
subscription-charges-credit-applied = Кредит применён
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Кредит применён: { $creditApplied }
subscription-charges-amount-paid = <b>Сумма платежа</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Оплаченная сумма: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Вы получили кредит аккаунта в размере { $creditReceived }, который будет учитываться для выставления счетов в будущем.

##

subscriptionSupport = У вас есть вопросы по вашей подписке? Наша <a data-l10n-name="subscriptionSupportUrl">команда поддержки</a> с радостью поможет вам.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = У вас есть вопросы по вашей подписке? Наша команда поддержки с радостью поможет вам:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Спасибо, что подписались на { $productName }. Если у вас есть какие-либо вопросы о подписке или нужны дополнительные сведения о { $productName }, вы можете <a data-l10n-name="subscriptionSupportUrl">связаться с нами</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Спасибо, что подписались на { $productName }. Если у вас есть какие-либо вопросы о подписке или нужны дополнительные сведения о { $productName }, вы можете связаться с нами:
subscription-support-get-help = Получить помощь по вашей подписке
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Управляйте своей подпиской</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Управляйте своей подпиской:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Обратиться в службу поддержки</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Связаться с поддержкой:
subscriptionUpdateBillingEnsure = Если вы хотите убедиться, что ваш способ оплаты и информация об аккаунте актуальны, вы можете сделать это <a data-l10n-name="updateBillingUrl">здесь</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Если вы хотите убедиться, что ваш способ оплаты и информация об аккаунте актуальны, вы можете сделать это здесь:
subscriptionUpdateBillingTry = Мы попытаемся произвести ваш платёж снова в течение следующих нескольких дней, но вам может потребоваться помочь нам устранить проблему, <a data-l10n-name="updateBillingUrl">обновив свои платёжные сведения</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Мы попытаемся произвести ваш платёж снова в течение следующих нескольких дней, но вам может потребоваться помочь нам устранить проблему, обновив свои платёжные сведения:
subscriptionUpdatePayment = Чтобы избежать прерывания работы служб, пожалуйста, как можно скорее <a data-l10n-name="updateBillingUrl">обновите ваши платёжные сведения</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Чтобы избежать прерывания работы служб, пожалуйста, как можно скорее обновите ваши платёжные сведения:
view-invoice-link-action = Просмотреть счёт
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Просмотреть счёт-фактуру: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Добро пожаловать в { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Добро пожаловать в { $productName }
downloadSubscription-content-2 = Давайте приступим к использованию всех возможностей, включённых в вашу подписку:
downloadSubscription-link-action-2 = Приступим
fraudulentAccountDeletion-subject-2 = Ваш { -product-mozilla-account(case: "accusative") } был удалён
fraudulentAccountDeletion-title = Ваш аккаунт был удалён
fraudulentAccountDeletion-content-part1-v2 = Недавно был создан аккаунт { -product-mozilla-account(case: "nominative") } и с этого адреса электронной почты была оплачена подписка. Как и в случае со всеми новыми аккаунтами, мы просим вас подтвердить аккаунт, изначально подтвердив этот адрес электронной почты.
fraudulentAccountDeletion-content-part2-v2 = В настоящее время мы видим, что аккаунт не подтверждён. Так как этот шаг не был выполнен, мы не уверены, что это была авторизованная подписка. В результате { -product-mozilla-account(case: "nominative") }, зарегистрированный на этот адрес электронной почты, был удалён, а подписка отменена с возмещением всех расходов.
fraudulentAccountDeletion-contact = Если у вас есть вопросы, обратитесь к нашей <a data-l10n-name="mozillaSupportUrl">команде поддержки</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Если у вас есть вопросы, обратитесь к нашей команде поддержки: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ваша подписка на { $productName } была отменена
subscriptionAccountDeletion-title = Жаль, что вы уходите
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Вы недавно удалили свой { -product-mozilla-account(case: "nominative") }. Связи с этим мы отменили вашу подписку на { $productName }. Ваш последний платёж в размере { $invoiceTotal } был оплачен { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Напоминание: завершите настройку вашего аккаунта
subscriptionAccountReminderFirst-title = Вы пока не можете получить доступ к своей подписке
subscriptionAccountReminderFirst-content-info-3 = Несколько дней назад вы создали { -product-mozilla-account(case: "nominative") } но так и не подтвердили его. Мы надеемся, что вы закончите настройку аккаунта и сможете пользоваться новой подпиской.
subscriptionAccountReminderFirst-content-select-2 = Выберите «Создать пароль», чтобы установить новый пароль и завершить подтверждение аккаунта.
subscriptionAccountReminderFirst-action = Создать пароль
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Последнее напоминание: Настройте ваш аккаунт
subscriptionAccountReminderSecond-title-2 = Добро пожаловать в { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Несколько дней назад вы создали { -product-mozilla-account(case: "nominative") } но так и не подтвердили его. Мы надеемся, что вы закончите настройку аккаунта и сможете пользоваться новой подпиской.
subscriptionAccountReminderSecond-content-select-2 = Выберите «Создать пароль», чтобы установить новый пароль и завершить подтверждение аккаунта.
subscriptionAccountReminderSecond-action = Создать пароль
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Ваша подписка на { $productName } была отменена
subscriptionCancellation-title = Жаль, что вы уходите

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Мы отменили вашу подписку на { $productName }. Ваш последний платёж в размере { $invoiceTotal } был произведён { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Мы отменили вашу подписку на { $productName }. Ваш последний платёж в размере { $invoiceTotal } будет произведён { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Ваше обслуживание будет продолжаться до конца текущего расчётного периода, то есть { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Вы перешли на { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Вы успешно перешли с { $productNameOld } на { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Начиная со следующего периода оплаты, ваш платёж составит { $paymentAmountNew } в { $productPaymentCycleNew } вместо { $paymentAmountOld } в { $productPaymentCycleOld }. В этот раз вы также получите одноразовый бонус в размере { $paymentProrated } для отражения более низкой стоимости за этот { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Если вам будет необходимо установить новое программное обеспечение для использования { $productName }, вы получите отдельное письмо с инструкциями по скачиванию.
subscriptionDowngrade-content-auto-renew = Ваша подписка будет автоматически продлеваться каждый платёжный период, пока вы не решите её отменить.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Срок действия вашей подписки на { $productName } скоро заканчивается
subscriptionEndingReminder-title = Срок действия вашей подписки на { $productName } скоро заканчивается
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Ваш доступ к { $productName } закончится <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Если вы хотите продолжить использовать { $productName }, вы можете повторно активировать свою подписку в <a data-l10n-name="subscriptionEndingReminder-account-settings">параметрах аккаунта</a> до <strong>{ $serviceLastActiveDateOnly }</strong>. Если вам нужна помощь, <a data-l10n-name="subscriptionEndingReminder-contact-support">свяжитесь с нашей службой поддержки</a>.
subscriptionEndingReminder-content-line1-plaintext = Ваш доступ к { $productName } закончится { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Если вы хотите продолжить использовать { $productName }, вы можете повторно активировать свою подписку в настройках аккаунта до { $serviceLastActiveDateOnly }. Если вам нужна помощь, свяжитесь с нашей службой поддержки.
subscriptionEndingReminder-content-closing = Спасибо за то, что являетесь ценным подписчиком!
subscriptionEndingReminder-churn-title = Хотите сохранить доступ?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Применяются ограниченные условия и ограничения</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Действуют ограниченные условия и ограничения: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Свяжитесь с нашей службой поддержки: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Ваша подписка на { $productName } была отменена
subscriptionFailedPaymentsCancellation-title = Ваша подписка была отменена
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Мы отменили вашу подписку на { $productName } из-за нескольких неудачных попыток взимания оплаты. Чтобы снова получить доступ, создайте новую подписку с обновлённым способом оплаты.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Оплата за { $productName } прошла
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Спасибо за подписку на { $productName }
subscriptionFirstInvoice-content-processing = Ваш платёж в настоящее время обрабатывается и это может занять до четырёх рабочих дней.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Вы получите отдельное электронное письмо о том, как начать использовать { $productName }.
subscriptionFirstInvoice-content-auto-renew = Ваша подписка будет автоматически продлеваться каждый платёжный период, пока вы не решите её отменить.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Ваш следующий счёт будет выставлен { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Срок действия способа оплаты за { $productName } истёк или в скором времени истечёт
subscriptionPaymentExpired-title-2 = Срок действия вашего способа оплаты истёк или скоро истечёт
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Срок действия способа оплаты, который вы используете для { $productName }, истёк или скоро истечёт.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Платёж за { $productName } не прошёл
subscriptionPaymentFailed-title = Извините, у нас возникли проблемы с вашим платежом
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = У нас возникли проблемы с вашим последним платежом за { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Возможно, срок действия вашего способа оплаты истёк или ваш текущий способ оплаты больше не работает.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Необходимо обновить платёжную информацию для { $productName }
subscriptionPaymentProviderCancelled-title = Извините, у нас возникли проблемы с вашим способом оплаты
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Мы обнаружили проблему с вашим способом оплаты за { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Возможно, срок действия вашего способа оплаты истёк или ваш текущий способ оплаты больше не работает.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Подписка на { $productName } активирована повторно
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Благодарим вас за повторную активацию подписки на { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ваш платёжный цикл и сумма платежа останутся прежними. Ваш следующий платёж будет произведён { $nextInvoiceDateOnly } на сумму { $invoiceTotal }. Ваша подписка будет автоматически продлеваться каждый расчётный период, если вы не отмените её.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Уведомление об автоматическом продлении { $productName }
subscriptionRenewalReminder-title = Ваша подписка скоро будет продлена
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Уважаемый покупатель { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Ваша текущая подписка настроена на автоматическое продление через { $reminderLength } дней.
subscriptionRenewalReminder-content-discount-change = Ваш следующий счёт отражает изменение цены, так как предыдущая скидка закончилась и была применена новая.
subscriptionRenewalReminder-content-discount-ending = Так как предыдущая скидка закончилась, ваша подписка будет продлена по стандартной цене.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = В это время { -brand-mozilla } продлит вашу ежедневную подписку и со способа оплаты на вашем аккаунте будет списана оплата в размере { $invoiceTotalExcludingTax } + { $invoiceTax } налог.
subscriptionRenewalReminder-content-charge-with-tax-week = В это время { -brand-mozilla } продлит вашу еженедельную подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotalExcludingTax } + { $invoiceTax } налог.
subscriptionRenewalReminder-content-charge-with-tax-month = В это время { -brand-mozilla } продлит вашу ежемесячную подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotalExcludingTax } + { $invoiceTax } налог.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = В это время { -brand-mozilla } продлит вашу полугодовую подписку и со способа оплаты на вашем аккаунте будет списана оплата в размере { $invoiceTotalExcludingTax } + { $invoiceTax } налог.
subscriptionRenewalReminder-content-charge-with-tax-year = В это время { -brand-mozilla } продлит вашу годовую подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotalExcludingTax } + { $invoiceTax } налог.
subscriptionRenewalReminder-content-charge-with-tax-default = В это время { -brand-mozilla } продлит вашу подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotalExcludingTax } + { $invoiceTax } налог.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = В это время { -brand-mozilla } продлит вашу ежедневную подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotal }.
subscriptionRenewalReminder-content-charge-invoice-total-week = В это время { -brand-mozilla } продлит вашу еженедельную подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotal }.
subscriptionRenewalReminder-content-charge-invoice-total-month = В это время { -brand-mozilla } продлит вашу ежемесячную подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotal }.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = В это время { -brand-mozilla } продлит вашу полугодовую подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotal }.
subscriptionRenewalReminder-content-charge-invoice-total-year = В это время { -brand-mozilla } продлит вашу годовую подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotal }.
subscriptionRenewalReminder-content-charge-invoice-total-default = В это время { -brand-mozilla } продлит вашу подписку и со способа оплаты на вашем аккаунте будет списана оплата { $invoiceTotal }.
subscriptionRenewalReminder-content-closing = С уважением,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Команда { $productName }
subscriptionReplaced-subject = Ваша подписка была обновлена в рамках повышения тарифа
subscriptionReplaced-title = Ваша подписка обновлена
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Ваша индивидуальная подписка на { $productName } была заменена и теперь включена в ваш новый пакет.
subscriptionReplaced-content-credit = Вы получите компенсацию за неиспользованное время вашей предыдущей подписки. Эта сумма будет автоматически зачислена на ваш счёт для оплаты будущих платежей.
subscriptionReplaced-content-no-action = С вашей стороны не требуется никаких действий.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Платёж за { $productName } получен
subscriptionSubsequentInvoice-title = Спасибо за то, что являетесь подписчиком!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Мы получили ваш последний платёж за { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Ваш следующий счёт будет выставлен { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Вы успешно обновились до { $productName }
subscriptionUpgrade-title = Спасибо за обновление!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Вы успешно перешли на { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = С вас была взята разовая плата в размере { $invoiceAmountDue }, чтобы компенсировать более высокую цену вашей подписки за оставшуюся часть этого платёжного периода ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Вы получили кредит аккаунта в размере { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Начиная со следующего платежа, цена вашей подписки изменится.
subscriptionUpgrade-content-old-price-day = Предыдущая ставка была { $paymentAmountOld } в день.
subscriptionUpgrade-content-old-price-week = Предыдущая ставка была { $paymentAmountOld } в неделю.
subscriptionUpgrade-content-old-price-month = Предыдущая ставка была { $paymentAmountOld } в месяц.
subscriptionUpgrade-content-old-price-halfyear = Предыдущая ставка была { $paymentAmountOld } в шесть месяцев.
subscriptionUpgrade-content-old-price-year = Предыдущая ставка была { $paymentAmountOld } в год.
subscriptionUpgrade-content-old-price-default = Предыдущая ставка была { $paymentAmountOld } за платёжный интервал.
subscriptionUpgrade-content-old-price-day-tax = Предыдущая ставка была { $paymentAmountOld } + { $paymentTaxOld } налог в день.
subscriptionUpgrade-content-old-price-week-tax = Предыдущая ставка была { $paymentAmountOld } + { $paymentTaxOld } налог в неделю.
subscriptionUpgrade-content-old-price-month-tax = Предыдущая ставка была { $paymentAmountOld } + { $paymentTaxOld } налог в месяц.
subscriptionUpgrade-content-old-price-halfyear-tax = Предыдущая ставка была { $paymentAmountOld } + { $paymentTaxOld } налог за шесть месяцев.
subscriptionUpgrade-content-old-price-year-tax = Предыдущая ставка была { $paymentAmountOld } + { $paymentTaxOld } налог в год.
subscriptionUpgrade-content-old-price-default-tax = Предыдущая ставка была { $paymentAmountOld } + { $paymentTaxOld } налог за платёжный интервал.
subscriptionUpgrade-content-new-price-day = В будущем, с вас будет сниматься { $paymentAmountNew } в день, не включая скидки.
subscriptionUpgrade-content-new-price-week = В будущем, с вас будет сниматься { $paymentAmountNew } в неделю, не включая скидки.
subscriptionUpgrade-content-new-price-month = В будущем, с вас будет сниматься { $paymentAmountNew } в месяц, не включая скидки.
subscriptionUpgrade-content-new-price-halfyear = В будущем, с вас будет сниматься { $paymentAmountNew } в шесть месяцев, не включая скидки.
subscriptionUpgrade-content-new-price-year = В будущем, с вас будет сниматься { $paymentAmountNew } в год, не включая скидки.
subscriptionUpgrade-content-new-price-default = В будущем, с вас будет сниматься { $paymentAmountNew } за каждый платёжный интервал, не включая скидки.
subscriptionUpgrade-content-new-price-day-dtax = В будущем, с вас будет сниматься { $paymentAmountNew } + { $paymentTaxNew } налог в день, не включая скидки.
subscriptionUpgrade-content-new-price-week-tax = В будущем, с вас будет сниматься { $paymentAmountNew } + { $paymentTaxNew } налог в неделю, не включая скидки.
subscriptionUpgrade-content-new-price-month-tax = В будущем, с вас будет сниматься { $paymentAmountNew } + { $paymentTaxNew } налог в месяц, не включая скидки.
subscriptionUpgrade-content-new-price-halfyear-tax = В будущем, с вас будет сниматься { $paymentAmountNew } + { $paymentTaxNew } налог каждые шесть месяцев, не включая скидки.
subscriptionUpgrade-content-new-price-year-tax = В будущем, с вас будет сниматься { $paymentAmountNew } + { $paymentTaxNew } налог в день, не включая скидки.
subscriptionUpgrade-content-new-price-default-tax = В будущем, с вас будет сниматься { $paymentAmountNew } + { $paymentTaxNew } налог за каждый платёжный интервал, не включая скидки.
subscriptionUpgrade-existing = Если какая-либо из ваших существующих подписок не будет подпадать под действие этого обновления, мы разберёмся с этим и отправим вам отдельное электронное письмо с подробной информацией. Если в ваш новый тарифный план включены продукты, требующие установки, мы отправим вам отдельное электронное письмо с инструкциями по настройке.
subscriptionUpgrade-auto-renew = Ваша подписка будет автоматически продлеваться каждый платёжный период, пока вы не решите её отменить.
subscriptionsPaymentExpired-subject-2 = Срок действия способа оплаты ваших подписок истёк или в скором времени истечёт
subscriptionsPaymentExpired-title-2 = Срок действия вашего способа оплаты истёк или скоро истечёт
subscriptionsPaymentExpired-content-2 = Срок действия способа оплаты, который вы используете для совершения платежей за следующие подписки, истёк или скоро истечёт.
subscriptionsPaymentProviderCancelled-subject = Необходимо обновить платёжную информацию для подписок { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Извините, у нас возникли проблемы с вашим способом оплаты
subscriptionsPaymentProviderCancelled-content-detected = Мы обнаружили проблему с вашим способом оплаты для следующих подписок.
subscriptionsPaymentProviderCancelled-content-payment-1 = Возможно, срок действия вашего способа оплаты истёк или ваш текущий способ оплаты больше не работает.
