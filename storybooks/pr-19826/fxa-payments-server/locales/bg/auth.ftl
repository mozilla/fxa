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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Логотип на { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Синхронизирани устройства">
body-devices-image = <img data-l10n-name="devices-image" alt="Устройства">
fxa-privacy-url = Политика за личните данни на { -brand-mozilla }
moz-accounts-privacy-url-2 = Поверителност на { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Условия за ползване на { -product-mozilla-accounts(capitalization: "uppercase") }
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
account-deletion-info-block-communications = Ако вашият профил бъде изтрит, пак ще получавате имейли от Mozilla Corporation и Mozilla Foundation, освен ако не <a data-l10n-name="unsubscribeLink">поискате да се отпишете.</a>
account-deletion-info-block-support = Ако имате въпроси или се нуждаете от помощ, можете да се свържете с нашия <a data-l10n-name="supportLink">екип за поддръжка</a>.
account-deletion-info-block-communications-plaintext = Ако вашият профил е изтрит, пак ще получавате имейли от Mozilla Corporation и Mozilla Foundation, освен ако не поискате да се отпишете:
account-deletion-info-block-support-plaintext = Ако имате въпроси или се нуждаете от помощ, не се колебайте да се свържете с нашия екип за поддръжка:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Изтеглете { $productName } от { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Изтеглете { $productName } от { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Инсталирайте { $productName } на <a data-l10n-name="anotherDeviceLink">друго настолно устройство</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Инсталирайте { $productName } на <a data-l10n-name="anotherDeviceLink">друго устройство</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Изтеглете { $productName } от Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Изтеглете { $productName } от App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Инсталирайте { $productName } на друго устройство:
automated-email-change-2 = Ако не сте предприели това действие, <a data-l10n-name="passwordChangeLink">променете паролата си</a> веднага.
automated-email-support = За повече информация посетете <a data-l10n-name="supportLink">поддръжката на { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ако не сте предприели това действие, веднага сменете паролата си:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = За повече информация посетете поддръжката на { -brand-mozilla }:
automated-email-inactive-account = Това е автоматично изпратено писмо. Получавате го, защото имате { -product-mozilla-account } и са изминали 2 години от последното ви вписване.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } За повече информация посетете <a data-l10n-name="supportLink">поддръжката на { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Това е автоматично електронно писмо. Ако сте го получили по погрешка, не е необходимо да правите нищо.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Това е автоматично изпратено писмо; ако вие не сте упълномощили това действие, моля, сменете паролата си:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Тази заявка дойде от { $uaBrowser } на { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Тази заявка дойде от { $uaBrowser } на { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Тази заявка идва от { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Тази заявка идва от { $uaOS } { $uaOSVersion }.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Тази заявка дойде от:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ако това не сте били вие, изтрийте новия ключ:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = За повече информация посетете поддръжката на { -brand-mozilla }:
change-password-plaintext = Ако подозирате, че някой се опитва да получи достъп до вашата сметка, моля, сменете паролата си.
manage-account = Управление на сметка
manage-account-plaintext = { manage-account }:
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
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } на { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } на { $uaOS }
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Преглед на фактура: { $invoiceLink }
cadReminderFirst-action = Синхронизиране на друго устройство
cadReminderSecond-action = Синхронизиране на друго устройство
cadReminderSecond-title-2 = Не забравяйте да синхронизирате!
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Добре дошли при { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Добре дошли при { $productName }
downloadSubscription-link-action-2 = Въведение
fraudulentAccountDeletion-title = Профилът ви е изтрит
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ново вписване от { $clientName }
newDeviceLogin-action = Управление на сметка
passwordChanged-subject = Променена парола
passwordChanged-title = Паролата е успешно променена
passwordChangeRequired-subject = Открита подозрителна дейност
passwordResetAccountRecovery-subject-2 = Паролата ви е нулирана
postAddAccountRecovery-action = Управление на профила
postAddLinkedAccount-action = Управление на профила
postAddTwoStepAuthentication-action = Управление на профила
postChangePrimary-subject = Основен електронен адрес е обновен
postChangePrimary-title = Нов основен ел. адрес
postChangePrimary-action = Управление на профила
postConsumeRecoveryCode-action = Управление на профила
postNewRecoveryCodes-action = Управление на профила
postRemoveAccountRecovery-action = Управление на профила
postRemoveSecondary-subject = Допълнителен електронен адрес е премахнат
postRemoveSecondary-title = Допълнителният ел. адрес е премахнат
postRemoveSecondary-action = Управление на профила
postRemoveTwoStepAuthentication-action = Управление на профила
postVerify-sub-title-3 = Радваме се да ви видим!
postVerifySecondary-subject = Добавен допълнителен електронен адрес
postVerifySecondary-title = Добавен допълнителен електронен адрес
postVerifySecondary-action = Управление на профила
recovery-subject = Нулиране на парола
recovery-action = Нова парола
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Абонамент за { $productName } е спрян
subscriptionAccountDeletion-title = Съжаляваме, че си тръгвате
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Добре дошли при { $productName }: Изберете парола
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Добре дошли при { $productName }
subscriptionAccountFinishSetup-action-2 = Въведение
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
subscriptionsPaymentProviderCancelled-subject = Необходимо обновяване на платежна информация за { -brand-mozilla }
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

unblockCode-title = Вие ли се вписахте?
unblockCode-prompt = Ако е така, ето кода за упълномощаване:
unblockCode-report-plaintext = Ако ли пък не – ни помогнете да отблъснем натрапниците като ни ги докладвате.
verify-subject = Завършете създаването на профила си
verifyLogin-action = Потвърждаване на вписването
verifyPrimary-description = Заявка за промяна на сметката е направена от следното устройство:
verifyPrimary-subject = Потвърждаване на основен електронен адрес
