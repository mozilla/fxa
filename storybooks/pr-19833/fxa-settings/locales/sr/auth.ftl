## Non-email strings

session-verify-send-push-body-2 = Кликните овде да потврдите да сте то ви

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla } полиса приватности
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
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Download { $productName } on { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Download { $productName } on the { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Инсталирајте { $productName } на <a data-l10n-name="anotherDeviceLink">другом десктоп уређају</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Инсталирајте { $productName } на <a data-l10n-name="anotherDeviceLink">другом уређају</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Преузмите { $productName } на Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Преузмите { $productName } на App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Инсталирајте { $productName } на другом уређају:
automated-email-change-2 = Ако ово нисте ви урадили, одмах <a data-l10n-name="passwordChangeLink">промените лозинку</a>.
automated-email-support = За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ако ово нисте ви урадили, одмах промените лозинку:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = За више информација, посетите { -brand-mozilla } подршку.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
automated-email-no-action-plaintext = Ово је аутоматизована е-порука. Ако сте грешком је примили, не морате ништа да учините.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ово је аутоматизована е-порука; ако нисте затражили ову акцију, онда промените лозинку:
automated-email-reset =
    Ово је аутоматизована е-порука. Ако нисте затражили ову акцију, онда <a data-l10n-name="resetLink">ресетујте лозинку</a>.
    За више информација, посетите <a data-l10n-name="supportLink">{ -brand-mozilla } подршку</a>.
cancellationSurvey = Помозите нам да побољшамо наше услуге одговарањем на овај <a data-l10n-name="cancellationSurveyUrl">кратак упитник</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Помозите нам да побољшамо наше услуге одговарањем на овај кратак упитник:
change-password-plaintext = Ако сумњате да неко покушава да приступи вашем налогу, промените лозинку.
manage-account = Управљајте налогом
manage-account-plaintext = { manage-account }:
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
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } за { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } за { $uaOS }
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Прикажи рачун: { $invoiceLink }
cadReminderFirst-subject-1 = Подсећамо да синхронизујете { -brand-firefox }
cadReminderFirst-action = Синхронизуј други уређај
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = За синхронизацију је потребно двоје
cadReminderSecond-subject-2 = Хајде да завршимо подешавање ваше синхронизације
cadReminderSecond-action = Синхронизуј други уређај
cadReminderSecond-title-2 = Не заборавите да синхронизујете!
cadReminderSecond-description-sync = Синхронизујте ваше обележиваче, лозинке, отворене картице и друго — свугде где користите { -brand-firefox }.
cadReminderSecond-description-plus = Уз то, ваши подаци ће бити шифровани и видљиви само вама и уређајима које одобрите.
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
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Немате више резервних приступних кодова!
codes-reminder-title-one = Остао вам је само један резервни приступни код
codes-reminder-title-two = Време је да направите још резервних приступних кодова
codes-reminder-description-part-one = Резервни приступни кодови вам помажу да повратите ваше податке ако заборавите лозинку.
codes-reminder-description-part-two = Направите нове кодова сада да не изгубите ваше податке после.
codes-reminder-description-two-left = Имате још само два кода.
codes-reminder-description-create-codes = Направите нове резервне приступне кодове који ће вам помоћи да се вратите на ваш налог у случају да изгубите приступ.
lowRecoveryCodes-action-2 = Направи кодове
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Немате више резервних приступних кодова
        [one] Остао вам је само 1 резервни приступни код
        [few] Имате само { $numberRemaining } резервна приступна кода
       *[other] Имате само { $numberRemaining } резервних приступних кодова
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Нова пријава на { $clientName }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Нисте били ви? <a data-l10n-name="passwordChangeLink">Мењајте лозинку</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Нисте били ви? Мењајте лозинку:
newDeviceLogin-action = Управљајте налогом
passwordChanged-subject = Лозинка је ажурирана
passwordChanged-title = Лозинка је успешно промењена
passwordChangeRequired-subject = Откривена је сумњива радња
passwordResetAccountRecovery-subject-2 = Ваша лозинка је ресетована
postAddAccountRecovery-title2 = Направили сте нови кључ за опоравак налога
postAddAccountRecovery-action = Управљајте налогом
postAddLinkedAccount-action = Управљај налогом
postAddTwoStepAuthentication-title-2 = Укључили сте аутентификацију у два корака
postAddTwoStepAuthentication-action = Управљајте налогом
postChangePrimary-subject = Примарна адреса е-поште је ажурирана
postChangePrimary-title = Нова примарна адреса е-поште
postChangePrimary-action = Управљајте налогом
postConsumeRecoveryCode-action = Управљајте налогом
postNewRecoveryCodes-subject-2 = Нови резервни приступни кодови су направљени
postNewRecoveryCodes-title-2 = Направили сте нове резервне приступне кодове
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Направљени су на:
postNewRecoveryCodes-action = Управљајте налогом
postRemoveAccountRecovery-subject-2 = Кључ за опоравак налога је обрисан
postRemoveAccountRecovery-action = Управљајте налогом
postRemoveSecondary-subject = Уклоњена је секундарна адреса е-поште
postRemoveSecondary-title = Уклоњена је секундарна адреса е-поште
postRemoveSecondary-action = Управљајте налогом
postRemoveTwoStepAuthentication-subject-line-2 = Аутентификација у два корака је искључена
postRemoveTwoStepAuthentication-title-2 = Искључили сте аутентификацију у два корака
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Онемогућили сте је са:
postRemoveTwoStepAuthentication-action = Управљајте налогом
postRemoveTwoStepAuthentication-not-required-2 = Када се пријавите, од вас се више неће тражити да унесете код из апликације за аутентификацију.
postVerify-sub-title-3 = Драго нам је што вас видимо!
postVerify-title-2 = Желите да видите исте картице на два уређаја?
postVerify-description-2 = Једноставно је! Само инсталирајте { -brand-firefox } на други уређај и пријавите се да бисте синхронизовали. Чиста магија!
postVerify-sub-description = (Псст… ово такође значи да се можете пријавити било где да видите ваше обележиваче, лозинке и друге { -brand-firefox } податке.)
postVerify-setup-2 = Повежите други уређај:
postVerify-action-2 = Повежи други уређај
postVerifySecondary-subject = Секундарна адреса додата
postVerifySecondary-title = Секундарна адреса додата
postVerifySecondary-action = Управљајте налогом
recovery-subject = Ресетујте лозинку
recovery-title-2 = Заборавили сте лозинку?
recovery-new-password-button = Направите нову лозинку кликом на дугме испод. Ова веза истиче за један сат.
recovery-copy-paste = Направите нову лозинку тако што ћете копирати и налепити URL испод у ваш прегледач. Ова веза истиче за један сат.
recovery-action = Направи нову лозинку
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ваша { $productName } претплата је отказана
subscriptionAccountDeletion-title = Тужни смо што одлазите
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Добродошли у { $productName }: Поставите вашу лозинку.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Добродошли у { $productName }
subscriptionAccountFinishSetup-content-processing = Ваша уплата се обрађује и може потрајати до 4 радна дана да се заврши. Претплата ће се аутоматски обновити на крају сваког обрачунског циклуса осим ако је ви не откажете.
subscriptionAccountFinishSetup-action-2 = Започните
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
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ваша тренутна претплата постављена је на аутоматско обнављање за { $reminderLength } дана. У то ће време { -brand-mozilla } аутоматски да обнови вашу { $planIntervalCount } { $planInterval } претплату и наплатити { $invoiceTotal } на начин плаћања на вашем налогу.
subscriptionRenewalReminder-content-closing = Срдачно,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } тим
subscriptionsPaymentProviderCancelled-subject = Потребно је ажурирање информација о плаћању за { -brand-mozilla } претплате
subscriptionsPaymentProviderCancelled-title = Жао нам је, имамо проблема са вашим начином плаћања
subscriptionsPaymentProviderCancelled-content-detected = Открили смо проблем са вашим начином плаћања за следеће претплате.
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
unblockCode-title = Да ли сте се ово ви пријавили?
unblockCode-prompt = Ако јесте, ево ауторизационог кода који вам је потребан:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ако да, ево кода за ауторизацију који вам је потребан: { $unblockCode }
unblockCode-report = Ако не, помозите нам да одбијемо уљезе и <a data-l10n-name="reportSignInLink">пријавите нам то</a>.
unblockCode-report-plaintext = Ако не, помозите нам да одбијемо уљезе и пријавите нам то.
verificationReminderFinal-subject = Последњи подсетник да потврдите налог
confirm-account = Потврдите налог
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Не заборавите да потврдите налог
verificationReminderFirst-sub-description-3 = Не пропустите прегледач који вас и вашу приватност ставља на прво место.
confirm-email-2 = Потврдите налог
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Потврдите налог
verificationReminderSecond-subject-2 = Не заборавите да потврдите налог
verificationReminderSecond-sub-description-2 = Будите део наше мисије да интернет учинимо местом отвореним за све.
verificationReminderSecond-action-2 = Потврдите налог
verify-subject = Завршите прављење вашег налога
verify-action-2 = Потврдите налог
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Да ли сте се пријавили у { $clientName }?
verifyLogin-description-2 = Помозите нам да заштитимо ваш налог тако што ћете потврдити пријаву на:
verifyLogin-subject-2 = Потврдите пријаву
verifyLogin-action = Потврдите пријаву
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Да ли сте се пријавили у { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Помозите нам да заштитимо ваш налог тако што ћете потврдити пријаву на:
verifyLoginCode-prompt-3 = Ако да, ево вашег кода за ауторизацију:
verifyLoginCode-expiry-notice = Истиче за 5 минута.
verifyPrimary-title-2 = Потврдите примарну адресу е-поште
verifyPrimary-description = Захтев за измене налога је послат са следећег уређаја:
verifyPrimary-subject = Потврдите примарну адресу е-поште
verifyPrimary-action-2 = Потврдите адресу е-поште
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Једном када потврдите, измене налога као што је додавање секундарне адресе, ће бити могуће и са овог уређаја.
verifySecondaryCode-title-2 = Потврдите секундарну адресу е-поште
verifySecondaryCode-action-2 = Потврдите адресу е-поште
verifySecondaryCode-prompt-2 = Искористите овај код за потврду:
verifySecondaryCode-expiry-notice-2 = Истиче за 5 минута. Једном када верификујете, адреса ће добијати безбедносна обавештења и потврде о пријавама.
verifyShortCode-prompt-3 = Искористите овај код за потврду:
verifyShortCode-expiry-notice = Истиче за 5 минута.
