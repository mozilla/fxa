## Non-email strings

session-verify-send-push-body-2 = Кликните овде да потврдите да сте то ви
subplat-automated-email = Ово је аутоматска е-пошта; ако сте је грешком примили, ниједна радња није потребна.
subplat-privacy-notice = Политика приватности
subplat-privacy-plaintext = Политика приватности:
subplat-update-billing-plaintext = { subplat-update-billing }:
subplat-terms-policy = Услови и полиса отказивања
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Откажите претплату
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Поново активирајте претплату
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Ажурирајте податке о плаћању
subplat-privacy-policy = { -brand-mozilla } политика приватности
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
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

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Међузбир: { $invoiceSubtotal }

##

subscriptionSupport = Имате питања о вашој претплати? Наш <a data-l10n-name="subscriptionSupportUrl">тим за подршку</a> је ту да вам помогне.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Имате питања о претплати? Наш тим за подршку је ту да вам помогне:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Хвала што сте се претплатили на { $productName }. Ако имате питања о вашој претплати или желите више информација о { $productName }-у, <a data-l10n-name="subscriptionSupportUrl">контактирајте нас</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Хвала што сте се претплатили на { $productName }. Ако имате питања о вашој претплати или желите више информација о { $productName }-у, контактирајте нас:
subscriptionUpdateBillingEnsure = Можете да проверите да ли су ваш начин плаћања и информације о налогу ажурне <a data-l10n-name="updateBillingUrl">овде</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Можете да проверите да ли су ваш начин плаћања и информације о налогу ажурне овде:
subscriptionUpdateBillingTry = Покушаћемо поново да обрадимо вашу уплату у наредним данима, а можда ће нам затребати ваша помоћ око <a data-l10n-name="updateBillingUrl">ажурирања података о плаћању</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Покушаћемо поново да обрадимо вашу уплату у наредним данима, а можда ће нам затребати ваша помоћ око ажурирања података о плаћању:
subscriptionUpdatePayment = Да бисте избегли било какве прекиде услуге, <a data-l10n-name="updateBillingUrl">ажурирајте ваше податке о плаћању</a> што је пре могуће.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Да бисте избегли било какве прекиде услуге, ажурирајте ваше податке о плаћању што је пре могуће:
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
fraudulentAccountDeletion-title = Ваш налог је обрисан
fraudulentAccountDeletion-contact = Ако имате питања, обратите се нашем <a data-l10n-name="mozillaSupportUrl">тиму за подршку</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ако имате питања, обратите се нашем тиму за подршку: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ваша { $productName } претплата је отказана
subscriptionAccountDeletion-title = Тужни смо што одлазите
subscriptionAccountReminderFirst-subject = Подсећамо: довршите постављање вашег налога
subscriptionAccountReminderFirst-title = Још не можете да приступите вашим претплатама
subscriptionAccountReminderFirst-content-select-2 = Изаберите „Направи лозинку“ да поставите нову лозинку и завршите потврђивање налога.
subscriptionAccountReminderFirst-action = Направи лозинку
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Последњи подсетник: поставите налог
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
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } плаћање није успело
subscriptionPaymentFailed-title = Жао нам је, имамо проблема с вашом уплатом
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Имали смо проблем с вашом последњом уплатом за { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Потребно је ажурирање информација о плаћању за { $productName }
subscriptionPaymentProviderCancelled-title = Жао нам је, имамо проблема са вашим начином плаћања
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Открили смо проблем са вашим начином плаћања за { $productName }.
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
subscriptionRenewalReminder-content-closing = Срдачно,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } тим
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } уплата је примљена
subscriptionSubsequentInvoice-title = Хвала што сте се претплатили!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Примили смо вашу последњу уплату за { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Надоградили сте на { $productName }
subscriptionUpgrade-title = Хвала што сте ажурирали!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Ваша претплата ће се аутоматски обнављати сваког обрачунског периода, осим ако не одлучите да је откажете.
subscriptionsPaymentProviderCancelled-subject = Потребно је ажурирање информација о плаћању за { -brand-mozilla } претплате
subscriptionsPaymentProviderCancelled-title = Жао нам је, имамо проблема са вашим начином плаћања
subscriptionsPaymentProviderCancelled-content-detected = Открили смо проблем са вашим начином плаћања за следеће претплате.
