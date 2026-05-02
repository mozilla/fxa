## Non-email strings

session-verify-send-push-title-2 = Влизате във { -product-mozilla-account }?
session-verify-send-push-body-2 = Щракнете тук, за да потвърдите, че сте вие
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } е вашият код за потвърждаване от { -brand-mozilla }. Изтича след 5 минути.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } код за потвърждаване: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } е вашият код за потвърждаване от { -brand-mozilla }. Изтича след 5 минути.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kод за { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } е вашият код за потвърждаване от { -brand-mozilla }. Изтича след 5 минути.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kод за { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Логотип на { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Лого на { -brand-mozilla }">
subplat-automated-email = Това писмо е изпратено автоматично; ако мислите, че е грешка не предприемайте действията.
subplat-privacy-notice = Политика за личните данни
subplat-privacy-plaintext = Политика за лични данни:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Получавате това писмо, защото { $email } е регистриран във { -product-mozilla-account } и имате профил в/ъв { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Получавате това писмо, защото { $email } е регистриран във { -product-mozilla-account }.
subplat-explainer-multiple-2 = Получавате това писмо, защото { $email } е регистриран във { -product-mozilla-account } и имате абонамент за няколко продукта.
subplat-explainer-was-deleted-2 = Получавате това писмо, защото { $email } е регистриран във { -product-mozilla-account }.
subplat-manage-account-2 = Управлявайте настройките на { -product-mozilla-account }, като посетите <a data-l10n-name="subplat-account-page">профила си</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Управлявайте настройките на { -product-mozilla-account }, като посетите профила си: { $accountSettingsUrl }
subplat-terms-policy = Условия и политика за анулиране
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Прекратяване на абонамент
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Подновяване на абонамент
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Обновяване на платежна информация
subplat-privacy-policy = Политика за личните данни на { -brand-mozilla }
subplat-privacy-policy-2 = Поверителност на { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Условия за ползване на { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Правна информация
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Поверителност
subplat-privacy-website-plaintext = { subplat-privacy }:
payment-details = Подробности за плащане:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Номер на фактурата: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Таксувано: { $invoiceTotal } на { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Следваща фактура: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Междинна сума: { $invoiceSubtotal }

##

subscriptionSupport = Имате въпроси относно абонамента си? Нашият <a data-l10n-name="subscriptionSupportUrl">екип за поддръжка</a> е тук, за да ви помогне.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Имате въпроси относно абонамента си? Екипът ни за поддръжка е тук, за да ви помогне:
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Преглед на фактура: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Добре дошли при { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Добре дошли при { $productName }
downloadSubscription-link-action-2 = Въведение
fraudulentAccountDeletion-title = Профилът ви е изтрит
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Абонамент за { $productName } е спрян
subscriptionAccountDeletion-title = Съжаляваме, че си тръгвате
subscriptionAccountReminderFirst-subject = Напомняне: Завършете създаването на профила си
subscriptionAccountReminderFirst-title = Все още нямате достъп до абонамента
subscriptionAccountReminderFirst-action = Създаване на парола
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Последно напомняне: Настройте профила си
subscriptionAccountReminderSecond-action = Създаване на парола
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Абонамент за { $productName } е спрян
subscriptionCancellation-title = Съжаляваме, че си тръгвате

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Услугата ще продължи до края на текущия период на фактуриране, който е { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Превключихте към { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Абонамент за { $productName } е спрян
subscriptionFailedPaymentsCancellation-title = Абонаментът ви е спрян
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Плащане за { $productName } е потвърдено
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Благодарим ви, че се абонирахте за { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Неуспешно плащане за { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Необходимо обновяване на платежна информация за { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Абонамент за { $productName } е подновен
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Благодарим ви, че подновихте абонамента си за { $productName }
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Известие за автоматично подновяване на { $productName }
subscriptionRenewalReminder-title = Абонаментът ви скоро ще бъде подновен
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Получено плащане за { $productName }
subscriptionSubsequentInvoice-title = Благодарим ви, че сте абонирани!
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Надстроихте до { $productName }
subscriptionUpgrade-title = Благодарим ви, че надградихте!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionsPaymentProviderCancelled-subject = Необходимо обновяване на платежна информация за { -brand-mozilla }
