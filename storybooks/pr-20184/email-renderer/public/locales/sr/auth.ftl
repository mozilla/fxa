## Non-email strings

session-verify-send-push-title-2 = Пријављујете се на ваш { -product-mozilla-account }?
session-verify-send-push-body-2 = Кликните овде да потврдите да сте то ви
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } је ваш { -brand-mozilla } код за потврду. Истиче за 5 минута.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } код за потврду: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } је ваш { -brand-mozilla } код за опоравак. Истиче за 5 минута.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } код: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } је ваш { -brand-mozilla } код за опоравак. Истиче за 5 минута.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } код: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } логотип">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } логотип">
subplat-automated-email = Ово је аутоматска е-пошта; ако сте је грешком примили, ниједна радња није потребна.
subplat-privacy-notice = Политика приватности
subplat-privacy-plaintext = Политика приватности:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Примате ову е-пошту јер { $email } има { -product-mozilla-account } и пријавили сте се за { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Примате ову е-пошту јер { $email } има { -product-mozilla-account }.
subplat-explainer-multiple-2 = Примате ову е-пошту јер { $email } има { -product-mozilla-account } и претплаћени сте на више производа.
subplat-explainer-was-deleted-2 = Примате ову е-пошту јер је { $email } био регистрован за { -product-mozilla-account }.
subplat-manage-account-2 = Управљајте поставкама вашег { -product-mozilla-account } налога посећивањем ваше <a data-l10n-name="subplat-account-page">странице налога</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Управљајте поставкама вашег { -product-mozilla-account } налога посећивањем ваше странице налога: { $accountSettingsUrl }
subplat-terms-policy = Услови и полиса отказивања
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Откажите претплату
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Поново активирајте претплату
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Ажурирајте податке о плаћању
subplat-privacy-policy = { -brand-mozilla } политика приватности
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } обавештење о приватности
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } услови коришћења
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Правне информације
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Приватност
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Помозите нам да побољшамо наше услуге одговарањем на овај <a data-l10n-name="cancellationSurveyUrl">кратак упитник</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Помозите нам да побољшамо наше услуге одговарањем на овај кратак упитник:
payment-details = Подаци о плаћању:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Број рачуна: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Наплаћено: { $invoiceTotal }, { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Следећи рачун: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Начин плаћања:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Начин плаћања: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Начин плаћања: { $cardName } који се завршава на { $lastFour }
payment-provider-card-ending-in-plaintext = Начин плаћања: картица која се завршава на { $lastFour }
payment-provider-card-ending-in = <b>Начин плаћања:</b> картица која се завршава на { $lastFour }
payment-provider-card-ending-in-card-name = <b>Начин плаћања:</b> { $cardName } који се завршава на { $lastFour }
subscription-charges-invoice-summary = Преглед рачуна

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Број рачуна:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Број рачуна: { $invoiceNumber }
subscription-charges-invoice-date = <b>Датум:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Датум: { $invoiceDateOnly }
subscription-charges-prorated-price = Сразмерна цена
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Сразмерна цена: { $remainingAmountTotal }
subscription-charges-list-price = Редовна цена
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Редовна цена: { $offeringPrice }
subscription-charges-credit-from-unused-time = Кредит од неискоришћеног времена
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Кредит од неискоришћеног времена: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Међузбир</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Међузбир: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Једнократни попуст
subscription-charges-one-time-discount-plaintext = Једнократни попуст: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Попуст од { $discountDuration } месец
        [few] Попуст од { $discountDuration } месеца
       *[other] Попуст од { $discountDuration } месеци
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-месечни попуст: { $invoiceDiscountAmount }
        [few] { $discountDuration }-месечни попуст: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-месечни попуст: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Попуст
subscription-charges-discount-plaintext = Попуст: { $invoiceDiscountAmount }
subscription-charges-taxes = Порези и накнаде
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Порези и накнаде: { $invoiceTaxAmount }
subscription-charges-total = <b>Укупно</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Укупно: { $invoiceTotal }
subscription-charges-credit-applied = Кредит је примењен
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Кредит је примењен: { $creditApplied }
subscription-charges-amount-paid = <b>Плаћени износ</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Плаћени износ: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Примили сте кредит на налогу у износу од { $creditReceived }, који ће бити примењен на ваше будуће рачуне.

##

subscriptionSupport = Имате питања о вашој претплати? Наш <a data-l10n-name="subscriptionSupportUrl">тим за подршку</a> је ту да вам помогне.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Имате питања о претплати? Наш тим за подршку је ту да вам помогне:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Хвала што сте се претплатили на { $productName }. Ако имате питања о вашој претплати или желите више информација о { $productName }-у, <a data-l10n-name="subscriptionSupportUrl">контактирајте нас</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Хвала што сте се претплатили на { $productName }. Ако имате питања о вашој претплати или желите више информација о { $productName }-у, контактирајте нас:
subscription-support-get-help = Потражите помоћ у вези са својом претплатом
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Управљајте својом претплатом</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Управљајте вашом претплатом:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Контактирајте подршку</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Контактирајте подршку:
subscriptionUpdateBillingEnsure = Можете да проверите да ли су ваш начин плаћања и информације о налогу ажурне <a data-l10n-name="updateBillingUrl">овде</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Можете да проверите да ли су ваш начин плаћања и информације о налогу ажурне овде:
subscriptionUpdateBillingTry = Покушаћемо поново да обрадимо вашу уплату у наредним данима, а можда ће нам затребати ваша помоћ око <a data-l10n-name="updateBillingUrl">ажурирања података о плаћању</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Покушаћемо поново да обрадимо вашу уплату у наредним данима, а можда ће нам затребати ваша помоћ око ажурирања података о плаћању:
subscriptionUpdatePayment = Да бисте избегли било какве прекиде услуге, <a data-l10n-name="updateBillingUrl">ажурирајте ваше податке о плаћању</a> што је пре могуће.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Да бисте избегли било какве прекиде услуге, ажурирајте ваше податке о плаћању што је пре могуће:
view-invoice-link-action = Погледај рачун
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Прикажи рачун: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Добродошли у { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Добродошли у { $productName }
downloadSubscription-content-2 = Хајде да почнемо да користимо све функције укључене у вашу претплату:
downloadSubscription-link-action-2 = Започните
fraudulentAccountDeletion-subject-2 = Ваш { -product-mozilla-account } је обрисан
fraudulentAccountDeletion-title = Ваш налог је обрисан
fraudulentAccountDeletion-content-part1-v2 = Недавно је направљен { -product-mozilla-account } и наплаћена је претплата користећи ову адресу е-поште. Као и код свих нових налога, тражили смо да потврдите свој налог тако што ћете прво потврдити ову адресу е-поште.
fraudulentAccountDeletion-content-part2-v2 = Тренутно видимо да налог никада није потврђен. Пошто овај корак није завршен, нисмо сигурни да ли је ово била овлашћена претплата. Као резултат тога, { -product-mozilla-account } регистрован на ову адресу е-поште је обрисан, а ваша претплата је отказана уз рефундирање свих трошкова.
fraudulentAccountDeletion-contact = Ако имате питања, обратите се нашем <a data-l10n-name="mozillaSupportUrl">тиму за подршку</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ако имате питања, обратите се нашем тиму за подршку: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ваша { $productName } претплата је отказана
subscriptionAccountDeletion-title = Тужни смо што одлазите
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Недавно сте обрисали ваш { -product-mozilla-account }. Као резултат тога, отказали смо вашу претплату за { $productName }. Ваша последња уплата од { $invoiceTotal } је плаћена дана { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Подсећамо: довршите постављање вашег налога
subscriptionAccountReminderFirst-title = Још не можете да приступите вашим претплатама
subscriptionAccountReminderFirst-content-info-3 = Пре неколико дана сте направили { -product-mozilla-account }, али га никада нисте потврдили. Надамо се да ћете завршити подешавање вашег налога, како бисте могли да користите вашу нову претплату.
subscriptionAccountReminderFirst-content-select-2 = Изаберите „Направи лозинку“ да поставите нову лозинку и завршите потврђивање налога.
subscriptionAccountReminderFirst-action = Направи лозинку
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Последњи подсетник: поставите налог
subscriptionAccountReminderSecond-title-2 = Добродошли у { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Пре неколико дана сте направили { -product-mozilla-account }, али га нисте потврдили. Надамо се да ћете довршити подешавање свог налога како бисте могли да користите своју нову претплату.
subscriptionAccountReminderSecond-content-select-2 = Изаберите „Направи лозинку“ да поставите нову лозинку и завршите потврђивање налога.
subscriptionAccountReminderSecond-action = Направи лозинку
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Ваша { $productName } претплата је отказана
subscriptionCancellation-title = Тужни смо што одлазите

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Отказали смо вашу претплату на { $productName }. Последња уплата у износу од { $invoiceTotal } је извршена { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Отказали смо вашу претплату на { $productName }. Коначна уплата у износу од { $invoiceTotal } биће извршена { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Услуга ће да настави до краја вашег тренутног обрачунског циклуса, односно до { $serviceLastActiveDateOnly }.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-freeTrial-subject = Ваш пробни период за { $productName } је отказан
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $trialEndDateOnly (String) - The date when the free trial ends, e.g. 01/20/2016
subscriptionCancellation-freeTrial-content = Ваш бесплатни пробни период за { $productName } је отказан. Ваш приступ ће се завршити { $trialEndDateOnly }. Неће вам бити наплаћено.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Пребацили сте се на { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Успешно сте се пребацили са { $productNameOld } на { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Од следећег плаћања, накнаде ће се променити из { $paymentAmountOld } по { $productPaymentCycleOld } у { $paymentAmountNew } по { $productPaymentCycleNew }. Тада ћете добити и једнократни кредит у износу од { $paymentProrated } који ће одразити ниже накнаде за остатак овог { $productPaymentCycleOld } периода.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ако је за коришћење { $productName } потребно инсталирати нови софтвер, добићете засебну е-пошту са упутством за преузимање.
subscriptionDowngrade-content-auto-renew = Ваша претплата ће се аутоматски обнављати сваког обрачунског периода, осим ако не одлучите да је откажете.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Ваша { $productName } претплата ће ускоро истећи
subscriptionEndingReminder-title = Ваша { $productName } претплата ће ускоро истећи
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Ваш приступ услузи { $productName } ће се завршити <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2-v2 = Ако желите да наставите да користите { $productName }, можете остати претплаћени у <a data-l10n-name="subscriptionEndingReminder-subscription-management">Управљању претплатама</a> пре <strong>{ $serviceLastActiveDateOnly }</strong>. Ако вам је потребна помоћ, <a data-l10n-name="subscriptionEndingReminder-contact-support">контактирајте наш тим за подршку</a>.
subscriptionEndingReminder-content-line1-plaintext = Ваш приступ услузи { $productName } ће се завршити { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext-v2 = Ако желите да наставите са коришћењем производа { $productName }, можете остати претплаћени у Управљању претплатом пре { $serviceLastActiveDateOnly }. Ако вам је потребна помоћ, контактирајте наш тим за подршку.
subscriptionEndingReminder-content-closing = Хвала што сте вредан претплатник!
subscriptionEndingReminder-churn-title = Желите ли да задржите приступ?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Важе ограничено трајање и ограничења</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Важе ограничено трајање и ограничења: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Контактирајте наш тим за подршку: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Ваша { $productName } претплата је отказана
subscriptionFailedPaymentsCancellation-title = Ваша претплата је отказана
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Због вишеструких неуспешних плаћања, отказали смо вашу претплату на { $productName }. Да бисте добили приступ, поново се претплатите новим начином плаћања.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } плаћање је одобрено
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Хвала што сте се претплатили на { $productName }
subscriptionFirstInvoice-content-processing = Ваша уплата се тренутно обрађује и може потрајати до четири радна дана.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = У засебној е-поруци добићете упутства како да користите { $productName }.
subscriptionFirstInvoice-content-auto-renew = Ваша претплата ће се аутоматски обнављати сваког обрачунског периода, осим ако не одлучите да је откажете.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Ваш следећи рачун ће бити издат { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Начин плаћања за { $productName } је истекао или истиче ускоро
subscriptionPaymentExpired-title-2 = Ваш начин плаћања је истекао или ће ускоро истећи
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Начин плаћања који користите за { $productName } је истекао или ће ускоро истећи.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } плаћање није успело
subscriptionPaymentFailed-title = Жао нам је, имамо проблема с вашом уплатом
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Имали смо проблем с вашом последњом уплатом за { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Могуће је да је ваш начин плаћања истекао или је застарео.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Потребно је ажурирање информација о плаћању за { $productName }
subscriptionPaymentProviderCancelled-title = Жао нам је, имамо проблема са вашим начином плаћања
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Открили смо проблем са вашим начином плаћања за { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Могуће је да је ваш начин плаћања истекао или је застарео.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } претплата је поново активирана
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Хвала што сте поново активирали вашу { $productName } претплату!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ваш циклус наплате и плаћања остаће исти. Следећи рачун ће износити { $invoiceTotal }, { $nextInvoiceDateOnly }. Ваша претплата ће се аутоматски обнављати сваки циклус наплате уколико га претходно не откажете.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Обавештење у аутоматском обнављању { $productName }-а
subscriptionRenewalReminder-title = Ваша претплата ће бити ускоро обновљена
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Цењена { $productName } муштеријо,
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro =
    { $reminderLength ->
        [one] Ваша тренутна претплата ће се аутоматски обновити за { $reminderLength } дан
        [few] Ваша тренутна претплата ће се аутоматски обновити за { $reminderLength } дана
       *[other] Ваша тренутна претплата ће се аутоматски обновити за { $reminderLength } дана
    }
subscriptionRenewalReminder-content-discount-change = Ваш следећи рачун одражава промену у цени, пошто је претходни попуст истекао и примењен је нови попуст.
subscriptionRenewalReminder-content-discount-ending = Пошто је претходни попуст истекао, ваша претплата ће бити обновљена по стандардној цени.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = У то време, { -brand-mozilla } ће обновити вашу дневну претплату и наплата од { $invoiceTotalExcludingTax } + { $invoiceTax } пореза ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-with-tax-week = У то време, { -brand-mozilla } ће обновити вашу недељну претплату и наплата од { $invoiceTotalExcludingTax } + { $invoiceTax } пореза ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-with-tax-month = У то време, { -brand-mozilla } ће обновити вашу месечну претплату и наплата од { $invoiceTotalExcludingTax } + { $invoiceTax } пореза ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = У то време, { -brand-mozilla } ће обновити вашу шестомесечну претплату и наплата од { $invoiceTotalExcludingTax } + { $invoiceTax } пореза ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-with-tax-year = У то време, { -brand-mozilla } ће обновити вашу годишњу претплату и наплата од { $invoiceTotalExcludingTax } + { $invoiceTax } пореза ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-with-tax-default = У то време, { -brand-mozilla } ће обновити вашу претплату и наплата од { $invoiceTotalExcludingTax } + { $invoiceTax } пореза ће бити примењена на начин плаћања на вашем налогу.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = У то време, { -brand-mozilla } ће обновити вашу дневну претплату и наплата од { $invoiceTotal } ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-invoice-total-week = У то време, { -brand-mozilla } ће обновити вашу недељну претплату и наплата од { $invoiceTotal } ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-invoice-total-month = У то време, { -brand-mozilla } ће обновити вашу месечну претплату и наплата од { $invoiceTotal } ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = У то време, { -brand-mozilla } ће обновити вашу шестомесечну претплату и наплата од { $invoiceTotal } ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-invoice-total-year = У то време, { -brand-mozilla } ће обновити вашу годишњу претплату и наплата од { $invoiceTotal } ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-charge-invoice-total-default = У то време, { -brand-mozilla } ће обновити вашу претплату и наплата од { $invoiceTotal } ће бити примењена на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-closing = Срдачно,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } тим
subscriptionReplaced-subject = Ваша претплата је ажурирана као део ваше надоградње
subscriptionReplaced-title = Ваша претплата је ажурирана
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Ваша појединачна { $productName } претплата је замењена и сада је укључена у ваш нови комплет.
subscriptionReplaced-content-credit = Примићете заслугу за сво неискоришћено време из ваше претходне претплате. Ова заслуга ће бити аутоматски примењена на ваш налог и коришћена за будуће трошкове.
subscriptionReplaced-content-no-action = Ниједна радња није потребна са ваше стране.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } уплата је примљена
subscriptionSubsequentInvoice-title = Хвала што сте се претплатили!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Примили смо вашу последњу уплату за { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Ваш следећи рачун ће бити издат { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Надоградили сте на { $productName }
subscriptionUpgrade-title = Хвала што сте ажурирали!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Успешно сте извршили надоградњу на { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Наплаћена вам је једнократна накнада од { $invoiceAmountDue } како би се одразила виша цена ваше претплате за остатак овог обрачунског периода ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Примили сте заслугу на налогу у износу од { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Почевши од следећег рачуна, цена ваше претплате ће се променити.
subscriptionUpgrade-content-old-price-day = Претходна цена је била { $paymentAmountOld } дневно.
subscriptionUpgrade-content-old-price-week = Претходна цена је била { $paymentAmountOld } седмично.
subscriptionUpgrade-content-old-price-month = Претходна цена је била { $paymentAmountOld } месечно.
subscriptionUpgrade-content-old-price-halfyear = Претходна цена је била { $paymentAmountOld } на сваких шест месеци.
subscriptionUpgrade-content-old-price-year = Претходна цена је била { $paymentAmountOld } годишње.
subscriptionUpgrade-content-old-price-default = Претходна цена је била { $paymentAmountOld } по обрачунском периоду.
subscriptionUpgrade-content-old-price-day-tax = Претходна цена је била { $paymentAmountOld } + { $paymentTaxOld } пореза дневно.
subscriptionUpgrade-content-old-price-week-tax = Претходна цена је била { $paymentAmountOld } + { $paymentTaxOld } пореза седмично.
subscriptionUpgrade-content-old-price-month-tax = Претходна цена је била { $paymentAmountOld } + { $paymentTaxOld } пореза месечно.
subscriptionUpgrade-content-old-price-halfyear-tax = Претходна цена је била { $paymentAmountOld } + { $paymentTaxOld } пореза на сваких шест месеци.
subscriptionUpgrade-content-old-price-year-tax = Претходна цена је била { $paymentAmountOld } + { $paymentTaxOld } пореза годишње.
subscriptionUpgrade-content-old-price-default-tax = Претходна цена је била { $paymentAmountOld } + { $paymentTaxOld } пореза по обрачунском периоду.
subscriptionUpgrade-content-new-price-day = Убудуће ће вам бити наплаћивано { $paymentAmountNew } дневно, искључујући попусте.
subscriptionUpgrade-content-new-price-week = Убудуће ће вам бити наплаћивано { $paymentAmountNew } седмично, искључујући попусте.
subscriptionUpgrade-content-new-price-month = Убудуће ће вам бити наплаћивано { $paymentAmountNew } месечно, искључујући попусте.
subscriptionUpgrade-content-new-price-halfyear = Убудуће ће вам бити наплаћивано { $paymentAmountNew } на сваких шест месеци, искључујући попусте.
subscriptionUpgrade-content-new-price-year = Убудуће ће вам бити наплаћивано { $paymentAmountNew } годишње, искључујући попусте.
subscriptionUpgrade-content-new-price-default = Убудуће ће вам бити наплаћивано { $paymentAmountNew } по обрачунском периоду, искључујући попусте.
subscriptionUpgrade-content-new-price-day-dtax = Убудуће ће вам бити наплаћивано { $paymentAmountNew } + { $paymentTaxNew } пореза дневно, искључујући попусте.
subscriptionUpgrade-content-new-price-week-tax = Убудуће ће вам бити наплаћивано { $paymentAmountNew } + { $paymentTaxNew } пореза седмично, искључујући попусте.
subscriptionUpgrade-content-new-price-month-tax = Убудуће ће вам бити наплаћивано { $paymentAmountNew } + { $paymentTaxNew } пореза месечно, искључујући попусте.
subscriptionUpgrade-content-new-price-halfyear-tax = Убудуће ће вам бити наплаћивано { $paymentAmountNew } + { $paymentTaxNew } пореза на сваких шест месеци, искључујући попусте.
subscriptionUpgrade-content-new-price-year-tax = Убудуће ће вам бити наплаћивано { $paymentAmountNew } + { $paymentTaxNew } пореза годишње, искључујући попусте.
subscriptionUpgrade-content-new-price-default-tax = Убудуће ће вам бити наплаћивано { $paymentAmountNew } + { $paymentTaxNew } пореза по обрачунском периоду, искључујући попусте.
subscriptionUpgrade-existing = Ако се било која од ваших постојећих претплата преклапа са овом надоградњом, ми ћемо их обрадити и послати вам посебну е-поруку са детаљима. Ако ваш нови план укључује производе који захтевају инсталацију, послаћемо вам посебну е-поруку са упутствима за подешавање.
subscriptionUpgrade-auto-renew = Ваша претплата ће се аутоматски обнављати сваког обрачунског периода, осим ако не одлучите да је откажете.
subscriptionsPaymentExpired-subject-2 = Начин плаћања за ваше претплате је истекао или истиче ускоро
subscriptionsPaymentExpired-title-2 = Ваш начин плаћања је истекао или ће ускоро истећи
subscriptionsPaymentExpired-content-2 = Начин плаћања који користите за следеће претплате је истекао или ће ускоро истећи.
subscriptionsPaymentProviderCancelled-subject = Потребно је ажурирање информација о плаћању за { -brand-mozilla } претплате
subscriptionsPaymentProviderCancelled-title = Жао нам је, имамо проблема са вашим начином плаћања
subscriptionsPaymentProviderCancelled-content-detected = Открили смо проблем са вашим начином плаћања за следеће претплате.
subscriptionsPaymentProviderCancelled-content-payment-1 = Могуће је да је ваш начин плаћања истекао или да су подаци о њему застарели.
