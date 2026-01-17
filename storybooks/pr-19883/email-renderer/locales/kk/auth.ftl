## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account } тіркелгіңізге кіріп жатырсыз ба?
session-verify-send-push-body-2 = Сіз екеніңізді растау үшін осында шертіңіз
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } — сіздің { -brand-mozilla } растау кодыңыз. Оның мерзімі 5 минуттан кейін бітеді.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } растау коды: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } — сіздің { -brand-mozilla } қалпына келтіру кодыңыз. Оның мерзімі 5 минуттан кейін бітеді.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } коды: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } — сіздің { -brand-mozilla } қалпына келтіру кодыңыз. Оның мерзімі 5 минуттан кейін бітеді.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } коды: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } логотипі">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Құрылғыларды синхрондау">
body-devices-image = <img data-l10n-name="devices-image" alt="Құрылғылар">
fxa-privacy-url = { -brand-mozilla }-ның жекелік саясаты
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } жекелік ескертуі
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } қолдану шарттары
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Бұл автоматтандырылған эл. пошта хаты; осыны алғаныңыз қате деп ойласаңыз, еш әрекетті жасау керек емес.
subplat-privacy-notice = Жекелік ескертуі
subplat-privacy-plaintext = Жекелік ескертуі:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Бұл электрондық поштаны алып отырсыз, себебі { $email } адресінде { -product-mozilla-account } бар және сіз { $productName } қызметіне тіркелгенсіз.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Бұл электрондық поштаны алып отырсыз, себебі { $email } адресінде { -product-mozilla-account } бар.
subplat-explainer-multiple-2 = Бұл электрондық поштаны алып отырсыз, себебі { $email } адресінде { -product-mozilla-account } бар және сіз бірнеше өнімге жазылғансыз.
subplat-explainer-was-deleted-2 = Бұл электрондық поштаны алып отырсыз, себебі { $email } адресі { -product-mozilla-account } өніміне тіркелген.
subplat-manage-account-2 = <a data-l10n-name="subplat-account-page">Тіркелгі парағын</a> шолу арқылы өз { -product-mozilla-account } баптауларын басқарыңыз.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Тіркелгі парағын шолу арқылы өз { -product-mozilla-account } баптауларын басқарыңыз: { $accountSettingsUrl }
subplat-terms-policy = Шарттар мен бас тарту саясаты
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Жазылудан бас тарту
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Жазылуды қайта белсендіру
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Төлем ақпаратын жаңарту
subplat-privacy-policy = { -brand-mozilla } жекелік саясаты
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } жекелік ескертуі
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Қолдану Шарттары
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Құқықтық ақпарат
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Жекелік
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Егер тіркелгіңіз өшірілсе, сіз <a data-l10n-name="unsubscribeLink">жазылымнан бас тартқанға</a> дейін Mozilla Corporation және Mozilla Foundation ұйымдарынан электрондық хаттар ала беретін боласыз.
account-deletion-info-block-support = Егер сізде қандай да бір сұрақтар туындаса немесе көмек қажет болса, біздің <a data-l10n-name="supportLink">қолдау көрсету тобына</a> хабарласудан тартынбаңыз.
account-deletion-info-block-communications-plaintext = Егер тіркелгіңіз өшірілсе, сіз жазылымнан бас тартқанға дейін Mozilla Corporation және Mozilla Foundation ұйымдарынан электрондық хаттар ала беретін боласыз:
account-deletion-info-block-support-plaintext = Егер сізде қандай да бір сұрақтар туындаса немесе көмек қажет болса, біздің қолдау көрсету тобына хабарласудан тартынбаңыз:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } өнімін { -google-play } ішінен жүктеп алу">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } өнімін { -app-store } ішінен жүктеп алу">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = { $productName } қолданбасын <a data-l10n-name="anotherDeviceLink">басқа жұмыс үстелі құрылғысына</a> орнату.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = { $productName } қолданбасын <a data-l10n-name="anotherDeviceLink">басқа құрылғыға</a> орнату.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = { $productName } өнімін Google Play ішінен алу:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = { $productName } өнімін App Store ішінен алу:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = { $productName } басқа құрылғыға орнату:
automated-email-change-2 = Егер сіз бұл әрекетті жасамасаңыз, <a data-l10n-name="passwordChangeLink">пароліңізді дереу өзгертіңіз</a>.
automated-email-support = Көбірек ақпарат алу үшін, <a data-l10n-name="supportLink">{ -brand-mozilla } қолдау сайтын</a> шолыңыз.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Егер сіз бұл әрекетті жасамасаңыз, пароліңізді дереу өзгертіңіз:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Көбірек ақпарат алу үшін, { -brand-mozilla } қолдау сайтын шолыңыз:
automated-email-inactive-account = Бұл автоматтандырылған электрондық пошта. Сіз оны { -product-mozilla-account } тіркелгіңіз болғандықтан және соңғы рет кіргеніңізге 2 жыл болғандықтан алып отырсыз.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Көбірек білу үшін, <a data-l10n-name="supportLink">{ -brand-mozilla } қолдау</a> сайтын шолыңыз.
automated-email-no-action-plaintext = Бұл автоматтандырылған электрондық пошта. Егер сіз оны қателесіп алсаңыз, сізге ештеңе істеудің қажеті жоқ.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Бұл автоматтандырылған электрондық пошта; егер сіз бұл әрекетке рұқсат бермеген болсаңыз, пароліңізді өзгертіңіз:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Бұл сұраным { $uaOS }{ $uaOSVersion } жүйесіндегі { $uaBrowser } атынан келді.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Бұл сұраным { $uaOS } жүйесіндегі { $uaBrowser } атынан келді.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Бұл сұраным { $uaBrowser } атынан келді.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Бұл сұраным { $uaOS }{ $uaOSVersion } жүйесінен келді.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Бұл сұраным { $uaOS } жүйесінен келді.
automatedEmailRecoveryKey-delete-key-change-pwd = Бұл сіз болмасаңыз, <a data-l10n-name="revokeAccountRecoveryLink">жана кілтті өшіріңіз</a> және <a data-l10n-name="passwordChangeLink">өз пароліңізді өзгертіңіз</a>.
automatedEmailRecoveryKey-change-pwd-only = Бұл сіз болмасаңыз, <a data-l10n-name="passwordChangeLink">өз пароліңізді өзгертіңіз</a>.
automatedEmailRecoveryKey-more-info = Көбірек ақпарат алу үшін, <a data-l10n-name="supportLink">{ -brand-mozilla } қолдау сайтын</a> шолыңыз.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Бұл сұраным келесіден келді:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Бұл сіз болмасаңыз, жаңа кілтті өшіріңіз:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Бұл сіз болмасаңыз, өз пароліңізді өзгертіңіз:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = және өз пароліңізді өзгертіңіз:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Көбірек ақпарат алу үшін, { -brand-mozilla } қолдау сайтын шолыңыз:
automated-email-reset =
    Бұл автоматтандырылған электрондық пошта; егер сіз бұл әрекетке рұқсат бермеген болсаңыз, <a data-l10n-name="resetLink">пароліңізді қалпына келтіріңіз</a>.
    Көбірек білу үшін, <a data-l10n-name="supportLink">{ -brand-mozilla } қолдау</a> сайтын шолыңыз.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Егер сіз бұл әрекетке рұқсат бермеген болсаңыз, пароліңізді { $resetLink } адресі бойынша қалпына келтіріңіз
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Егер бұл әрекетті сіз жасамаған болсаңыз, бірден <a data-l10n-name="resetLink">парольді қалпына келтіріңіз</a> және <a data-l10n-name="twoFactorSettingsLink">екі қадамды аутентификацияны қалпына келтіріңіз</a>.
    Қосымша ақпарат алу үшін <a data-l10n-name="supportLink">{ -brand-mozilla } қолдау қызметін</a> шолыңыз.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Егер сіз бұл әрекетті жасамасаңыз, пароліңізді дереу қалпына келтіріңіз:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Сонымен қатар, екі қадамды аутентификацияны мына жерде қалпына келтіріңіз:
brand-banner-message = { -product-firefox-accounts } деген атымызды { -product-mozilla-accounts } етіп өзгерткенімізді білесіз бе? <a data-l10n-name="learnMore">Көбірек білу</a>
cancellationSurvey = Осы <a data-l10n-name="cancellationSurveyUrl">қысқа сауалнамаға</a> қатысу арқылы қызметтерімізді жақсартуға көмектесіңіз.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Осы қысқа сауалнамаға қатысу арқылы қызметтерімізді жақсартуға көмектесіңіз:
change-password-plaintext = Егер сіздің тіркелгіңізге біреу қолың жеткізгісі келіп жүр деген күмәніңіз бар болса, пароліңізді өзгертіңіз.
manage-account = Тіркелгіні басқару
manage-account-plaintext = { manage-account }:
payment-details = Төлем мәліметтері:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Шот нөмірі: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Төлем: { $invoiceDateOnly } күні { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Келесі шот: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Төлем әдісі:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Төлем әдісі: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Төлем әдісі: { $lastFour } сандармен аяқталатын { $cardName } картасы
payment-provider-card-ending-in-plaintext = Төлем әдісі: { $lastFour } сандармен аяқталатын карта
payment-provider-card-ending-in = <b>Төлем әдісі:</b> { $lastFour } сандармен аяқталатын карта
payment-provider-card-ending-in-card-name = <b>Төлем әдісі:</b> { $lastFour } сандармен аяқталатын { $cardName }
subscription-charges-invoice-summary = Шот қорытындысы

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Шот нөмірі:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Шот нөмірі: { $invoiceNumber }
subscription-charges-invoice-date = <b>Күні:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Күні: { $invoiceDateOnly }
subscription-charges-prorated-price = Пропорционалды баға
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Пропорционалды баға: { $remainingAmountTotal }
subscription-charges-list-price = Прейскурант бойынша бағасы
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Прейскурант бойынша бағасы: { $offeringPrice }
subscription-charges-credit-from-unused-time = Пайдаланылмаған уақыттан алынған несие
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Пайдаланылмаған уақыттан алынған несие: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Аралық сома</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Аралық сома: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Бір реттік жеңілдік
subscription-charges-one-time-discount-plaintext = Бір реттік жеңілдік: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-айлық жеңілдік
       *[other] { $discountDuration }-айлық жеңілдік
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-айлық жеңілдік: -{ $invoiceDiscountAmount }
       *[other] { $discountDuration }-айлық жеңілдік: -{ $invoiceDiscountAmount }
    }
subscription-charges-discount = Жеңілдік
subscription-charges-discount-plaintext = Жеңілдік: { $invoiceDiscountAmount }
subscription-charges-taxes = Салықтар мен алымдар
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Салықтар мен алымдар: { $invoiceTaxAmount }
subscription-charges-total = <b>Жалпы</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Жалпы: { $invoiceTotal }
subscription-charges-credit-applied = Несие қолданылды
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Несие қолданылды: { $creditApplied }
subscription-charges-amount-paid = <b>Төленген сома</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Төленген сома: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Сіз болашақ шоттарыңызға қолданылатын { $creditReceived } шот несиесін алдыңыз.

##

subscriptionSupport = Жазылуыңыз туралы сұрақтарыңыз бар ма? Біздің <a data-l10n-name="subscriptionSupportUrl">қолдау тобы</a> сізге көмектесе алады.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Жазылуыңыз туралы сұрақтарыңыз бар ма? Біздің қолдау тобы сізге көмектесе алады:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = { $productName } қызметіне жазылғаныңыз үшін рақмет. Жазылуыңыз туралы сұрақтарыңыз болса немесе { $productName } туралы қосымша ақпарат қажет болса, <a data-l10n-name="subscriptionSupportUrl">бізге хабарласыңыз</a>
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = { $productName } қызметіне жазылғаныңыз үшін рақмет. Жазылуыңыз туралы сұрақтарыңыз болса немесе { $productName } туралы қосымша ақпарат қажет болса, бізге хабарласыңыз
subscription-support-get-help = Жазылымыңыз бойынша көмек алу
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Жазылымыңызды басқарыңыз</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Жазылымыңызды басқарыңыз:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Қолдау қызметіне хабарласу</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Қолдау қызметіне хабарласу
subscriptionUpdateBillingEnsure = Төлем әдісіңіз бен шот ақпаратыңыздың ескірмегеніне <a data-l10n-name="updateBillingUrl">осы жерде</a> көз жеткізе аласыз.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Төлем әдісіңіз бен шот ақпаратыңыздың ескірмегеніне осы жерде көз жеткізе аласыз:
subscriptionUpdateBillingTry = Төлеміңізді келесі бірнеше күнде қайталап көреміз, бірақ сізге <a data-l10n-name="updateBillingUrl">төлем ақпаратын жаңарту</a> арқылы оны түзетуге көмектесу қажет болуы мүмкін.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Төлеміңізді келесі бірнеше күнде қайталап көреміз, бірақ сізге төлем ақпаратын жаңарту арқылы оны түзетуге көмектесу қажет болуы мүмкін:
subscriptionUpdatePayment = Қызметіңіздің үзілуіне жол бермеу үшін, мүмкіндігінше тезірек <a data-l10n-name="updateBillingUrl">төлем ақпаратыңызды жаңартыңыз</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Қызметіңіздің үзілуіне жол бермеу үшін, мүмкіндігінше тезірек төлем ақпаратыңызды жаңартыңыз:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Көбірек ақпарат алу үшін, <a data-l10n-name="supportLink">{ -brand-mozilla } қолдау сайтын</a> шолыңыз.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Қосымша ақпарат алу үшін { -brand-mozilla } қолдау бөлімін шолыңыз: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser }, { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser }, { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (шамамен)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (шамамен)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (шамамен)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (шамамен)
view-invoice-link-action = Шотты қарау
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Шот-фактураны қарау: { $invoiceLink }
cadReminderFirst-subject-1 = Еске салғыш! { -brand-firefox } синхрондайық
cadReminderFirst-action = Басқа құрылғыны синхрондау
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Синхрондау үшін екі құрылғы қажет
cadReminderFirst-description-v2 = Барлық құрылғыларда беттеріңізді алыңыз. Бетбелгілер, парольдер және басқа деректерді { -brand-firefox } пайдаланатын барлық жерде алыңыз.
cadReminderSecond-subject-2 = Жіберіп алмаңыз! Синхрондауды баптауды аяқтайық.
cadReminderSecond-action = Басқа құрылғыны синхрондау
cadReminderSecond-title-2 = Синхрондауды ұмытпаңыз!
cadReminderSecond-description-sync = Бетбелгілер, парольдер, ашық беттер және т.б. синхрондаңыз — { -brand-firefox } пайдаланатын барлық жерде.
cadReminderSecond-description-plus = Сонымен қатар, деректеріңіз әрқашан шифрленеді. Оны тек сіз және сіз растаған құрылғылар ғана көре алады.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName } ішіне қош келдіңіз
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName } ішіне қош келдіңіз
downloadSubscription-content-2 = Жазылуыңыздағы барлық мүмкіндіктерді пайдалануды бастайық:
downloadSubscription-link-action-2 = Бастау
fraudulentAccountDeletion-subject-2 = Сіздің { -product-mozilla-account } өшірілді
fraudulentAccountDeletion-title = Сіздің тіркелгіңіз өшірілді
fraudulentAccountDeletion-content-part1-v2 = { -product-mozilla-account } жуырда жасалды және осы эл. пошта адресі арқылы жазылым ақысы алынды. Барлық жаңа тіркелгілермен сияқты, алдымен осы эл. пошта адресін растау арқылы тіркелгіңізді растауыңызды сұрадық.
fraudulentAccountDeletion-content-part2-v2 = Қазіргі уақытта біз тіркелгінің ешқашан расталмағанын көріп отырмыз. Бұл қадам аяқталмағандықтан, бұл рұқсат етілген жазылу болғанына сенімді емеспіз. Нәтижесінде, осы эл. пошта адресіне тіркелген { -product-mozilla-account } өшірілді және барлық төлемдер қайтарылып, жазылуыңыздан бас тартылды.
fraudulentAccountDeletion-contact = Сұрақтарыңыз болса, біздің <a data-l10n-name="mozillaSupportUrl">қолдау көрсету тобымызға</a> хабарласыңыз.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Сұрақтарыңыз болса, біздің қолдау көрсету тобымызға хабарласыңыз: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = { -product-mozilla-account } тіркелгіңізді сақтап қалудың соңғы мүмкіндігі
inactiveAccountFinalWarning-title = Сіздің { -brand-mozilla } тіркелгіңіз бен деректеріңіз өшірілетін болады
inactiveAccountFinalWarning-preview = Тіркелгіңізді сақтау үшін жүйеге кіріңіз
inactiveAccountFinalWarning-account-description = Сіздің { -product-mozilla-account } тіркелгіңіз { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } және { -product-mdn } сияқты тегін жекелікке және шолу өнімдеріне қол жеткізу үшін пайдаланылады.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> күні, егер сіз жүйеге кірмесеңіз, тіркелгіңіз бен жеке деректеріңіз біржола өшіріледі.
inactiveAccountFinalWarning-action = Тіркелгіңізді сақтау үшін жүйеге кіріңіз
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Тіркелгіңізді сақтау үшін жүйеге кіріңіз:
inactiveAccountFirstWarning-subject = Тіркелгіңізді жоғалтпаңыз
inactiveAccountFirstWarning-title = { -brand-mozilla } тіркелгіңіз бен деректеріңізді сақтағыңыз келе ме?
inactiveAccountFirstWarning-account-description-v2 = Сіздің { -product-mozilla-account } тіркелгіңіз { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } және { -product-mdn } сияқты тегін жекелікке және шолу өнімдеріне қол жеткізу үшін пайдаланылады.
inactiveAccountFirstWarning-inactive-status = Сіздің екі жыл бойы жүйеге кірмегеніңізді байқадық.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Сіз белсенді болмағандықтан, тіркелгіңіз бен жеке деректеріңіз <strong>{ $deletionDate }</strong> күні біржола өшіріледі.
inactiveAccountFirstWarning-action = Тіркелгіңізді сақтау үшін жүйеге кіріңіз
inactiveAccountFirstWarning-preview = Тіркелгіңізді сақтау үшін жүйеге кіріңіз
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Тіркелгіңізді сақтау үшін жүйеге кіріңіз:
inactiveAccountSecondWarning-subject = Әрекет қажет: Тіркелгі 7 күннен кейін өшіріледі
inactiveAccountSecondWarning-title = Сіздің { -brand-mozilla } тіркелгіңіз бен деректеріңіз 7 күннен кейін өшірілетін болады
inactiveAccountSecondWarning-account-description-v2 = Сіздің { -product-mozilla-account } тіркелгіңіз { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } және { -product-mdn } сияқты тегін жекелікке және шолу өнімдеріне қол жеткізу үшін пайдаланылады.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Сіз белсенді болмағандықтан, тіркелгіңіз бен жеке деректеріңіз <strong>{ $deletionDate }</strong> күні біржола өшіріледі.
inactiveAccountSecondWarning-action = Тіркелгіңізді сақтау үшін жүйеге кіріңіз
inactiveAccountSecondWarning-preview = Тіркелгіңізді сақтау үшін жүйеге кіріңіз
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Тіркелгіңізді сақтау үшін жүйеге кіріңіз:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Сізде сақтық аутентификация кодтары аяқталды!
codes-reminder-title-one = Сіз соңғы сақтық көшірме аутентификация кодындасыз
codes-reminder-title-two = Қосымша сақтық көшірме аутентификация кодтарын жасау уақыты келді
codes-reminder-description-part-one = Сақтық көшірме аутентификация кодтары парольді ұмытқан кезде ақпаратты қалпына келтіруге көмектеседі.
codes-reminder-description-part-two = Деректеріңізді кейін жоғалтпау үшін жаңа кодтарды қазір жасаңыз.
codes-reminder-description-two-left = Сізде тек екі код қалды.
codes-reminder-description-create-codes = Құлыптаулы болсаңыз, тіркелгіңізге қайта кіруге көмектесетін жаңа резервтік аутентификация кодтарын жасаңыз.
lowRecoveryCodes-action-2 = Кодтарды жасау
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Бірде-бір сақтық аутентификация коды қалмады
        [one] Тек 1 сақтық аутентификация коды қалды
       *[other] Тек { $numberRemaining } сақтық аутентификация коды қалды!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = { $clientName } ішіне жаңа кіру
newDeviceLogin-subjectForMozillaAccount = Сіздің { -product-mozilla-account } ішіне жаңа кіру орын алды
newDeviceLogin-title-3 = Сіздің { -product-mozilla-account } жүйеге кіру үшін пайдаланылды
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Сіз емессіз бе? <a data-l10n-name="passwordChangeLink">Пароліңізді өзгертіңіз</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Сен емес пе? Пароліңізді өзгертіңіз:
newDeviceLogin-action = Тіркелгіні басқару
passwordChanged-subject = Пароль жаңартылды
passwordChanged-title = Пароль сәтті өзгертілді
passwordChanged-description-2 = Сіздің { -product-mozilla-account } тіркелгісінің паролі келесі құрылғыдан сәтті өзгертілді:
passwordChangeRequired-subject = Күдікті әрекет анықталды
passwordChangeRequired-preview = Пароліңізді дереу өзгертіңіз
passwordChangeRequired-title-2 = Пароліңізді қалпына келтіріңіз
passwordChangeRequired-suspicious-activity-3 = Күдікті әрекеттен қорғау үшін тіркелгіңізді құлыптадық. Сіз барлық құрылғыларыңыздан шығарылдыңыз және кез келген синхрондалған деректер сақтық шарасы ретінде өшірілді.
passwordChangeRequired-sign-in-3 = Тіркелгіңізге қайта кіру үшін сізге тек пароліңізді қалпына келтіру керек.
passwordChangeRequired-different-password-2 = <b>Маңызды:</b> Бұрын қолданған пароліңізден өзгеше күшті парольді таңдаңыз.
passwordChangeRequired-different-password-plaintext-2 = Маңызды: Бұрын қолданған пароліңізден өзгеше күшті парольді таңдаңыз.
passwordChangeRequired-action = Парольді тастау
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Пароліңізді өзгерту үшін { $code } пайдаланыңыз
password-forgot-otp-preview = Бұл кодтың мерзімі 10 минуттан кейін аяқталады
password-forgot-otp-title = Пароліңізді ұмыттыңыз ба?
password-forgot-otp-request = Біз сіздің { -product-mozilla-account } тіркелгіңізді паролін өзгерту туралы сұрауды алдық:
password-forgot-otp-code-2 = Бұл сіз болсаңыз, міне, жалғастыру үшін сіздің растау кодыңыз:
password-forgot-otp-expiry-notice = Бұл кодтың мерзімі 10 минутта бітеді.
passwordReset-subject-2 = Пароліңіз тасталды
passwordReset-title-2 = Пароліңіз тасталды
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = { -product-mozilla-account } паролін келесі жерде қалпына келтірдіңіз:
passwordResetAccountRecovery-subject-2 = Пароліңіз тасталды
passwordResetAccountRecovery-title-3 = Пароліңіз тасталды
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Сіз өзіңіздің { -product-mozilla-account } паролін қалпына келтіру үшін тіркелгіні қалпына келтіру кілтін келесі жерде пайдаландыңыз:
passwordResetAccountRecovery-information = Сізді барлық синхрондалған құрылғылардан жүйеден шығардық. Сіз пайдаланған кілтті ауыстыру үшін тіркелгіні қалпына келтірудің жаға кілтін жасадық. Оны тіркелгі параметрлерінде өзгертуге болады.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Сізді барлық синхрондалған құрылғылардан жүйеден шығардық. Сіз пайдаланған кілтті ауыстыру үшін тіркелгіні қалпына келтірудің жаға кілтін жасадық. Оны тіркелгі параметрлерінде өзгертуге болады:
passwordResetAccountRecovery-action-4 = Тіркелгіні басқару
passwordResetRecoveryPhone-subject = Қалпына келтіру телефоны пайдаланылды
passwordResetRecoveryPhone-preview = Бұл сіздің әрекетіңіз болғанын растау үшін тексеріңіз
passwordResetRecoveryPhone-title = Қалпына келтіру телефоны парольді қалпына келтіруді растау үшін пайдаланылды
passwordResetRecoveryPhone-device = Қалпына келтіру телефоны келесі жерден пайдаланылды:
passwordResetRecoveryPhone-action = Тіркелгіні басқару
passwordResetWithRecoveryKeyPrompt-subject = Пароліңіз тасталды
passwordResetWithRecoveryKeyPrompt-title = Пароліңіз тасталды
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = { -product-mozilla-account } паролін келесі жерде қалпына келтірдіңіз:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Тіркелгіні қалпына келтіру кілтін жасау
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Тіркелгіні қалпына келтіру кілтін жасау:
passwordResetWithRecoveryKeyPrompt-cta-description = Барлық синхрондалған құрылғыларда жүйеге қайта кіру қажет болады. Тіркелгіні қалпына келтіру кілтімен келесі жолы деректеріңізді қауіпсіз сақтаңыз. Бұл парольді ұмытып қалсаңыз, деректерді қалпына келтіруге мүмкіндік береді.
postAddAccountRecovery-subject-3 = Тіркелгіні қалпына келтірудің жаңа кілті жасалды
postAddAccountRecovery-title2 = Сіз тіркелгіні қалпына келтіру жаңа кілтін жасадыңыз
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Бұл кілтті қауіпсіз жерде сақтаңыз — парольді ұмытып қалсаңыз, ол шифрленген шолу деректерін қалпына келтіру үшін қажет болады.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Бұл кілтті тек бір рет пайдалануға болады. Сіз оны пайдаланғаннан кейін біз сізге автоматты түрде жаңасын жасаймыз. Немесе тіркелгі параметрлерінен кез келген уақытта жаңасын жасауға болады.
postAddAccountRecovery-action = Тіркелгіні басқару
postAddLinkedAccount-subject-2 = Сіздің { -product-mozilla-account } ішіне жаңа тіркелгі байланыстырылды
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Сіздің { $providerName } тіркелгіңіз { -product-mozilla-account } ішіне байланыстырылды.
postAddLinkedAccount-action = Тіркелгіні басқару
postAddRecoveryPhone-subject = Қалпына келтіру телефоны қосылды
postAddRecoveryPhone-preview = Тіркелгі екі факторлы аутентификациямен қорғалған
postAddRecoveryPhone-title-v2 = Сіз қалпына келтіру телефон нөмірін қостыңыз
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Сіз қалпына келтіру телефон нөмірі ретінде { $maskedLastFourPhoneNumber } қостыңыз
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Бұл сіздің тіркелгіңізді қалай қорғайды
postAddRecoveryPhone-how-protect-plaintext = Бұл сіздің тіркелгіңізді қалай қорғайды:
postAddRecoveryPhone-enabled-device = Сіз оны келесі жерден іске қостыңыз:
postAddRecoveryPhone-action = Тіркелгіні басқару
postAddTwoStepAuthentication-preview = Сіздің тіркелгіңіз қорғалған
postAddTwoStepAuthentication-subject-v3 = Екі қадамды аутентификация іске қосылған
postAddTwoStepAuthentication-title-2 = Сіз екі қадамды аутентификацияны іске қостыңыз
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Сіз мұны келесі жерден сұрадыңыз:
postAddTwoStepAuthentication-action = Тіркелгіні басқару
postAddTwoStepAuthentication-code-required-v4 = Аутентификация қолданбасының қауіпсіздік кодтары енді жүйеге әр рет кірген сайын керек болады.
postAddTwoStepAuthentication-recovery-method-codes = Сондай-ақ, қалпына келтіру әдісі ретінде сақтық көшірме аутентификация кодтарын қостыңыз.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Сіз сондай-ақ қалпына келтіру телефон нөміріңіз ретінде { $maskedPhoneNumber } нөмірін қостыңыз.
postAddTwoStepAuthentication-how-protects-link = Бұл сіздің тіркелгіңізді қалай қорғайды
postAddTwoStepAuthentication-how-protects-plaintext = Бұл сіздің тіркелгіңізді қалай қорғайды:
postAddTwoStepAuthentication-device-sign-out-message = Барлық қосылған құрылғыларыңызды қорғау үшін, осы тіркелгіні пайдаланып жатқан барлық жерде жүйеден шығып, екі сатылы аутентификацияны пайдаланып қайта кіруіңіз керек.
postChangeAccountRecovery-subject = Тіркелгіні қалпына келтіру кілті өзгертілді
postChangeAccountRecovery-title = Сіз тіркелгіңізді қалпына келтіру кілтін өзгерттіңіз
postChangeAccountRecovery-body-part1 = Енді сізде тіркелгіні қалпына келтірудің жаңа кілті бар. Сіздің алдыңғы кілтіңіз өшірілді.
postChangeAccountRecovery-body-part2 = Бұл жаңа кілтті қауіпсіз жерде сақтаңыз — парольді ұмытып қалсаңыз, ол шифрленген шолу деректерін қалпына келтіру үшін қажет болады.
postChangeAccountRecovery-action = Тіркелгіні басқару
postChangePrimary-subject = Біріншілік эл. пошта адресі жаңартылды
postChangePrimary-title = Жаңа біріншілік эл. поштасы
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Сіз біріншілік электрондық поштаңызды { $email } етіп өзгерттіңіз. Бұл аджрес енді { -product-mozilla-account } тіркелгіңізге кіруге, сондай-ақ қауіпсіздік хабарландыруларын және жүйеге кіру растауларын алуға арналған пайдаланушы атыңыз болып табылады.
postChangePrimary-action = Тіркелгіні басқару
postChangeRecoveryPhone-subject = Қалпына келтіру телефоны жаңартылды
postChangeRecoveryPhone-preview = Тіркелгі екі факторлы аутентификациямен қорғалған
postChangeRecoveryPhone-title = Сіз қалпына келтіру телефон нөмірін өзгерттіңіз
postChangeRecoveryPhone-description = Енді сізде жаңа қалпына келтіру телефоны бар. Алдыңғы телефон нөміріңіз өшірілді.
postChangeRecoveryPhone-requested-device = Сіз оны келесі жерден сұрадыңыз:
postChangeTwoStepAuthentication-preview = Сіздің тіркелгіңіз қорғалған
postChangeTwoStepAuthentication-subject = Екі қадамды аутентификация жаңартылды
postChangeTwoStepAuthentication-title = Екі қадамды аутентификация жаңартылған
postChangeTwoStepAuthentication-use-new-account = Енді аутентификатор қолданбаңызда жаңа { -product-mozilla-account } жазбасын пайдалануыңыз керек. Ескісі енді жұмыс істемейді және оны өшіруге болады.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Сіз мұны келесі жерден сұрадыңыз:
postChangeTwoStepAuthentication-action = Тіркелгіні басқару
postChangeTwoStepAuthentication-how-protects-link = Бұл сіздің тіркелгіңізді қалай қорғайды
postChangeTwoStepAuthentication-how-protects-plaintext = Бұл сіздің тіркелгіңізді қалай қорғайды:
postChangeTwoStepAuthentication-device-sign-out-message = Барлық қосылған құрылғыларыңызды қорғау үшін, осы тіркелгіні пайдаланып жатқан барлық жерде жүйеден шығып, жаңа екі сатылы аутентификацияны пайдаланып қайта кіруіңіз керек.
postConsumeRecoveryCode-title-3 = Парольді қалпына келтіруді растау үшін сақтық көшірме аутентификация кодыңыз пайдаланылды
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Қолданылған код:
postConsumeRecoveryCode-action = Тіркелгіні басқару
postConsumeRecoveryCode-subject-v3 = Сақтық көшірме аутентификация коды пайдаланылды
postConsumeRecoveryCode-preview = Бұл сіздің әрекетіңіз болғанын растау үшін тексеріңіз
postNewRecoveryCodes-subject-2 = Жаңа сақтық көшірме аутентификация кодтары жасалды
postNewRecoveryCodes-title-2 = Сіз жаңа сақтық көшірме аутентификация кодтарын жасадыңыз
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Олар келесі жерде жасалды:
postNewRecoveryCodes-action = Тіркелгіні басқару
postRemoveAccountRecovery-subject-2 = Тіркелгіні қалпына келтіру коды өшірілді
postRemoveAccountRecovery-title-3 = Сіз тіркелгіні қалпына келтіру кілтін өшірдіңіз
postRemoveAccountRecovery-body-part1 = Парольді ұмытып қалсаңыз, шифрленген шолу деректерін қалпына келтіру үшін тіркелгіні қалпына келтіру кілті қажет.
postRemoveAccountRecovery-body-part2 = Оны әлі жасамаған болсаңыз, сақталған парольдер, бетбелгілер, шолу тарихын және т.б. жоғалтпау үшін тіркелгі параметрлерінде тіркелгіні қалпына келтірудің жаңа кілтін жасаңыз.
postRemoveAccountRecovery-action = Тіркелгіні басқару
postRemoveRecoveryPhone-subject = Қалпына келтіру телефоны өшірілді
postRemoveRecoveryPhone-preview = Тіркелгі екі факторлы аутентификациямен қорғалған
postRemoveRecoveryPhone-title = Қалпына келтіру телефоны өшірілді
postRemoveRecoveryPhone-description-v2 = Сіздің қалпына келтіру телефоны екі қадамды аутентификация параметрлерінен өшірілді.
postRemoveRecoveryPhone-description-extra = Егер сіз аутентификация қолданбасын пайдалана алмасаңыз, кіру үшін сақтық көшірме аутентификация кодтарын пайдалана аласыз.
postRemoveRecoveryPhone-requested-device = Сіз оны келесі жерден сұрадыңыз:
postRemoveSecondary-subject = Екіншілік эл. пошта адресі өшірілді
postRemoveSecondary-title = Екіншілік эл. пошта адресі өшірілді
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Сіз { -product-mozilla-account } тіркелгіңізден { $secondaryEmail } адресін екіншілік адресі ретінде сәтті өшірдіңіз. Қауіпсіздік ескертулері және кіру хабарламалары ол адреске енді жіберілмейтін болады.
postRemoveSecondary-action = Тіркелгіні басқару
postRemoveTwoStepAuthentication-subject-line-2 = Екі қадамды аутентификация сөндірілді
postRemoveTwoStepAuthentication-title-2 = Сіз екі қадамды аутентификацияны сөндірдіңіз
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Сіз оны келесі жерден сөндірдіңіз:
postRemoveTwoStepAuthentication-action = Тіркелгіні басқару
postRemoveTwoStepAuthentication-not-required-2 = Сізге енді жүйеге кірген кезде аутентификация қолданбасынан қауіпсіздік кодтары керек емес.
postSigninRecoveryCode-subject = Кіру үшін қолданылған сақтық аутентификация коды
postSigninRecoveryCode-preview = Тіркелгі белсенділігін растау
postSigninRecoveryCode-title = Кіру үшін сақтық көшірме аутентификация кодыңыз пайдаланылды
postSigninRecoveryCode-description = Егер сіз мұны істемеген болсаңыз, тіркелгіңіздің қауіпсіздігін қамтамасыз ету үшін пароліңізді дереу өзгертуіңіз керек.
postSigninRecoveryCode-device = Сіз келесі жерден кірдіңіз:
postSigninRecoveryCode-action = Тіркелгіні басқару
postSigninRecoveryPhone-subject = Кіру үшін пайдаланылған қалпына келтіру телефоны
postSigninRecoveryPhone-preview = Тіркелгі белсенділігін растау
postSigninRecoveryPhone-title = Қалпына келтіру телефон нөміріңіз кіру үшін пайдаланылды
postSigninRecoveryPhone-description = Егер сіз мұны істемеген болсаңыз, тіркелгіңіздің қауіпсіздігін қамтамасыз ету үшін пароліңізді дереу өзгертуіңіз керек.
postSigninRecoveryPhone-device = Сіз келесі жерден кірдіңіз:
postSigninRecoveryPhone-action = Тіркелгіні басқару
postVerify-sub-title-3 = Біз сізді көруге қуаныштымыз!
postVerify-title-2 = Бір бетті екі құрылғыда көргіңіз келе ме?
postVerify-description-2 = Бұл оңай! Басқа құрылғыға { -brand-firefox } орнатып, синхрондау үшін тіркелгіңізге кіріңіз. Бұл сиқыр сияқты!
postVerify-sub-description = (Бұл сонымен қатар бетбелгілер, парольдер және басқа { -brand-firefox } деректерін жүйеге кірген кез келген жерден алуға болатынын білдіреді.)
postVerify-subject-4 = { -brand-mozilla } ішіне қош келдіңіз!
postVerify-setup-2 = Басқа құрылғыны байланыстыру:
postVerify-action-2 = Басқа құрылғыны байланыстыру
postVerifySecondary-subject = Екіншілік эл. пошта адресі қосылған
postVerifySecondary-title = Екіншілік эл. пошта адресі қосылған
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Сіз { $secondaryEmail } адресін { -product-mozilla-account } үшін екіншілік эл. пошта ретінде сәтті растадыңыз. Қауіпсіздік хабарландырулары мен кіру растаулары енді екі эл. пошта адресіне де жеткізіледі.
postVerifySecondary-action = Тіркелгіні басқару
recovery-subject = Парольді тастау
recovery-title-2 = Пароліңізді ұмыттыңыз ба?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Біз сіздің { -product-mozilla-account } тіркелгіңізді паролін өзгерту туралы сұрауды алдық:
recovery-new-password-button = Төмендегі батырманы басу арқылы жаңа парольді жасаңыз. Бұл сілтеме мерзімі келесі сағат ішінде аяқталады.
recovery-copy-paste = Төмендегі URL адресін көшіріп, браузерге кірістіру арқылы жаңа парольді жасаңыз. Бұл сілтеме мерзімі келесі сағатта аяқталады.
recovery-action = Жаңа парольді жасау
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Сіздің { $productName } жазылуыңыз тоқтатылды
subscriptionAccountDeletion-title = Кеткеніңізге өкінеміз
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Сіз жақында { -product-mozilla-account } тіркелгіңізді өшірдіңіз. Нәтижесінде { $productName } жазылуыңызды тоқтаттық. Соңғы { $invoiceTotal } төлеміңіз { $invoiceDateOnly } күні төленді.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = { $productName } ішіне қош келдіңіз: пароліңізді орнатыңыз.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName } ішіне қош келдіңіз
subscriptionAccountFinishSetup-content-processing = Төлеміңіз өңделуде және оның аяқталуына төрт жұмыс күні кетуі мүмкін. Бас тартуды таңдамасаңыз, жазылуыңыз әр есеп айырысу кезеңінде автоматты түрде жаңартылады.
subscriptionAccountFinishSetup-content-create-3 = Содан кейін жаңа жазылуды пайдалануды бастау үшін { -product-mozilla-account } паролін жасайсыз.
subscriptionAccountFinishSetup-action-2 = Бастау
subscriptionAccountReminderFirst-subject = Еске салғыш: тіркелгіңізді баптауды аяқтаңыз
subscriptionAccountReminderFirst-title = Жазылуыңызға әлі қол жеткізе алмайсыз
subscriptionAccountReminderFirst-content-info-3 = Бірнеше күн бұрын сіз { -product-mozilla-account } тіркелгісін жасадыңыз, бірақ оны ешқашан растамадыңыз. Жаңа жазылуды пайдалана алуыңыз үшін тіркелгіңізді баптауды аяқтайсыз деп үміттенеміз.
subscriptionAccountReminderFirst-content-select-2 = Жаңа парольді орнату және тіркелгіңізді растауды аяқтау үшін "Парольді жасау" опциясын таңдаңыз.
subscriptionAccountReminderFirst-action = Парольді жасау
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Соңғы ескерту: тіркелгіңізді баптаңыз
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } ішіне қош келдіңіз!
subscriptionAccountReminderSecond-content-info-3 = Бірнеше күн бұрын сіз { -product-mozilla-account } тіркелгісін жасадыңыз, бірақ оны ешқашан растамадыңыз. Жаңа жазылуды пайдалана алуыңыз үшін тіркелгіңізді баптауды аяқтайсыз деп үміттенеміз.
subscriptionAccountReminderSecond-content-select-2 = Жаңа парольді орнату және тіркелгіңізді растауды аяқтау үшін "Парольді жасау" опциясын таңдаңыз.
subscriptionAccountReminderSecond-action = Парольді жасау
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Сіздің { $productName } жазылуыңыз тоқтатылды
subscriptionCancellation-title = Кеткеніңізге өкінеміз

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Біз сіздің { $productName } жазылуыңызды тоқтаттық. { $invoiceTotal } соңғы төлеміңіз { $invoiceDateOnly } күні төленді.
subscriptionCancellation-outstanding-content-2 = Біз сіздің { $productName } жазылуыңызды тоқтаттық. { $invoiceTotal } соңғы төлеміңіз { $invoiceDateOnly } күні төленеді.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Сіздің қызмет көрсету ағымдағы төлем кезеңіңіздің соңына дейін жалғасады, яғни { $serviceLastActiveDateOnly } дейін.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Сіз { $productName } өніміне ауыстыңыз
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Сіз { $productNameOld } өнімінен { $productName } өніміне сәтті ауыстыңыз.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Келесі шотыңыздан бастап төлеміңіз әр { $productPaymentCycleOld } сайын { $paymentAmountOld } болса, әр { $productPaymentCycleNew } сайын { $paymentAmountNew } болып өзгереді. Сол кезде сізге осы { $productPaymentCycleOld } қалған бөлігі үшін азырақ төлемді сипаттау үшін { $paymentProrated } бір реттік бонус беріледі.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = { $productName } пайдалану үшін жаңа бағдарламалық қамтаманы орнату керек болса, жүктеп алу нұсқаулары бар бөлек электрондық хат аласыз.
subscriptionDowngrade-content-auto-renew = Бас тартуды таңдамасаңыз, жазылуыңыз әрбір есеп айырысу кезеңінде автоматты түрде жаңартылады.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Сіздің { $productName } жазылымыңыздың мерзімі жуырда аяқталады
subscriptionEndingReminder-title = Сіздің { $productName } жазылымыңыздың мерзімі жуырда аяқталады
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Сіздің { $productName } қызметіне қол жеткізу мүмкіндігіңіз { $serviceLastActiveDateOnly } күні аяқталады.
subscriptionEndingReminder-content-line2 = Егер { $productName } өнімін пайдалануды жалғастырғыңыз келсе, { $serviceLastActiveDateOnly } күніне дейін <a data-l10n-name="subscriptionEndingReminder-account-settings">Тіркелгі баптауларында</a> жазылымды қайта белсендіре аласыз. Егер көмек қажет болса, <a data-l10n-name="subscriptionEndingReminder-contact-support">қолдау көрсету тобына хабарласыңыз</a>.
subscriptionEndingReminder-content-line1-plaintext = Сіздің { $productName } қызметіне қол жеткізу мүмкіндігіңіз { $serviceLastActiveDateOnly } күні аяқталады.
subscriptionEndingReminder-content-line2-plaintext = Егер { $productName } өнімін пайдалануды жалғастырғыңыз келсе, { $serviceLastActiveDateOnly } күніне дейін Тіркелгі баптауларында жазылымды қайта белсендіре аласыз. Егер көмек қажет болса, Қолдау көрсету тобына хабарласыңыз.
subscriptionEndingReminder-content-closing = Құрметті жазылушы болғаныңыз үшін рақмет!
subscriptionEndingReminder-churn-title = Кіру мүмкіндігін сақтап қалғыңыз келе ме?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Шектеулі шарттар мен ережелер іске асады</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Шектеулі шарттар мен ережелер іске асады: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Қолдау көрсету тобына хабарласыңыз: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Сіздің { $productName } жазылуыңыз тоқтатылды
subscriptionFailedPaymentsCancellation-title = Сіздің жазылуыңыз тоқтатылды
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Бірнеше төлем әрекеті сәтсіз аяқталатындықтан, сіздің { $productName } жазылуыңызды тоқтаттық. Қайта қол жеткізу үшін, жаңартылған төлем әдісімен жаңа жазылуды бастаңыз.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } төлемі расталды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName } қызметіне жазылғаныңыз үшін рахмет
subscriptionFirstInvoice-content-processing = Сіздің төлеміңіз қазір өңделуде және оған төрт жұмыс күні кетуі мүмкін.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Сіз { $productName } пайдалануды қалай бастау керектігі туралы бөлек электрондық хат аласыз.
subscriptionFirstInvoice-content-auto-renew = Бас тартуды таңдамасаңыз, жазылуыңыз әрбір есеп айырысу кезеңінде автоматты түрде жаңартылады.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Келесі шотыңыз { $nextInvoiceDateOnly } күні шығарылады.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName } үшін төлем әдісінің мерзімі бітті немесе жақында аяқталады
subscriptionPaymentExpired-title-2 = Сіздің төлем әдісіңіздің мерзімі бітті немесе аяқталуға жақын
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = { $productName } үшін пайдаланып жатқан төлем әдісінің мерзімі біткен немесе мерзімі аяқталуға жақын.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } төлемі сәтсіз аяқталды
subscriptionPaymentFailed-title = Кешіріңіз, төлеміңізге қатысты мәселе орын алды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = { $productName } үшін соңғы төлеміңізге қатысты мәселе орын алды.
subscriptionPaymentFailed-content-outdated-1 = Төлем әдісіңіздің мерзімі өтіп кеткен немесе ағымдағы төлем әдісіңіз ескірген болуы мүмкін.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = { $productName } үшін төлем ақпаратын жаңарту қажет
subscriptionPaymentProviderCancelled-title = Кешіріңіз, төлем әдісіңізге қатысты мәселе орын алды
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = { $productName } үшін төлем әдісіңізге қатысты мәселе анықталды.
subscriptionPaymentProviderCancelled-content-reason-1 = Төлем әдісіңіздің мерзімі өтіп кеткен немесе ағымдағы төлем әдісіңіз ескірген болуы мүмкін.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } жазылуы қайта белсендірілді
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = { $productName } жазылуын қайта белсендіргеніңіз үшін рақмет!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Төлем цикліңіз бен төлеміңіз өзгеріссіз қалады. Келесі төлеміңіз { $nextInvoiceDateOnly } күні { $invoiceTotal } болады. Бас тартуды таңдамасаңыз, жазылуыңыз әрбір есеп айырысу кезеңінде автоматты түрде жаңартылады.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } автоматты жаңарту туралы хабарлама
subscriptionRenewalReminder-title = Сіздің жазылуыңыз жақында жаңартылады
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Құрметті { $productName } пайдаланушысы,
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ағымдағы жазылу { $reminderLength } күннен кейін автоматты түрде ұзартылатын етіп орнатылған. Сол кезде { -brand-mozilla } { $planIntervalCount } { $planInterval } жазылуын жаңартады және тіркелгіңіздегі төлем әдісімен { $invoiceTotal } ақы алынады.
subscriptionRenewalReminder-content-closing = Құрметпен,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } командасы
subscriptionReplaced-subject = Жазылымыңыз жаңартудың бөлігі ретінде жаңартылды
subscriptionReplaced-title = Жазылымыңыз жаңартылды
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Сіздің жеке { $productName } жазылымыңыз ауыстырылды және енді жаңа пакетіңізге қосылды.
subscriptionReplaced-content-credit = Алдыңғы жазылымыңыздан қалған пайдаланылмаған уақыт үшін сізге несие беріледі. Бұл несие тіркелгіңізге автоматты түрде қосылады және алдағы төлемдерге жұмсалады.
subscriptionReplaced-content-no-action = Сіздің тарапыңыздан ешқандай әрекет қажет емес.
subscriptionsPaymentExpired-subject-2 = Жазылымдарыңыздың төлем әдісінің мерзімі біткен немесе жақында аяқталады
subscriptionsPaymentExpired-title-2 = Сіздің төлем әдісіңіздің мерзімі бітті немесе аяқталуға жақын
subscriptionsPaymentExpired-content-2 = Келесі жазылымдар үшін төлем жасау үшін пайдаланып жатқан төлем әдісінің мерзімі аяқталған немесе мерзімі аяқталуға жақын.
subscriptionsPaymentProviderCancelled-subject = { -brand-mozilla } жазылулары үшін төлем ақпаратын жаңарту қажет
subscriptionsPaymentProviderCancelled-title = Кешіріңіз, төлем әдісіңізге қатысты мәселе орын алды
subscriptionsPaymentProviderCancelled-content-detected = Келесі жазылулар үшін төлем әдісіңізге қатысты мәселелер анықтадық.
subscriptionsPaymentProviderCancelled-content-payment-1 = Төлем әдісіңіздің мерзімі өтіп кеткен немесе ағымдағы төлем әдісіңіз ескірген болуы мүмкін.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } төлемі алынды
subscriptionSubsequentInvoice-title = Жазылушы болғаныңыз үшін рахмет!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = { $productName }үшін соңғы төлеміңізді алдық.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Келесі шотыңыз { $nextInvoiceDateOnly } күні шығарылады.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Сіз { $productName } нұсқасына жаңартылдыңыз
subscriptionUpgrade-title = Жаңартылғаныңыз үшін рахмет!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Сіз { $productName } нұсқасына сәтті жаңартылдыңыз

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Осы төлем кезеңінің қалған бөлігінде жазылымыңыздың жоғарылау бағасына жеткізу үшін сізден бір реттік { $invoiceAmountDue } төлем алынды ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Сіз { $paymentProrated } сомасындағы шот несиесін алдыңыз.
subscriptionUpgrade-content-subscription-next-bill-change = Келесі шотыңыздан бастап жазылымыңыздың бағасы өзгереді.
subscriptionUpgrade-content-old-price-day = Бұрынғы бағам күн сайын { $paymentAmountOld } болған.
subscriptionUpgrade-content-old-price-week = Бұрынғы бағам апта сайын { $paymentAmountOld } болған.
subscriptionUpgrade-content-old-price-month = Бұрынғы бағам ай сайын { $paymentAmountOld } болған.
subscriptionUpgrade-content-old-price-halfyear = Бұрынғы бағам әр 6 ай сайын { $paymentAmountOld } болған.
subscriptionUpgrade-content-old-price-year = Бұрынғы бағам жыл сайын { $paymentAmountOld } болған.
subscriptionUpgrade-content-old-price-default = Бұрынғы бағам әр төлем аралығы сайын { $paymentAmountOld } болған.
subscriptionUpgrade-content-old-price-day-tax = Бұрынғы бағам әр күн сайын { $paymentAmountOld } + { $paymentTaxOld } салық болған.
subscriptionUpgrade-content-old-price-week-tax = Бұрынғы бағам әр апта сайын { $paymentAmountOld } + { $paymentTaxOld } салық болған.
subscriptionUpgrade-content-old-price-month-tax = Бұрынғы бағам әр ай сайын { $paymentAmountOld } + { $paymentTaxOld } салық болған.
subscriptionUpgrade-content-old-price-halfyear-tax = Бұрынғы бағам әр 6 ай сайын { $paymentAmountOld } + { $paymentTaxOld } салық болған.
subscriptionUpgrade-content-old-price-year-tax = Бұрынғы бағам әр жыл сайын { $paymentAmountOld } + { $paymentTaxOld } салық болған.
subscriptionUpgrade-content-old-price-default-tax = Бұрынғы бағам әр төлем аралығы сайын { $paymentAmountOld } + { $paymentTaxOld } салық болған.
subscriptionUpgrade-content-new-price-day = Әрі қарай сізден, жеңілдіктерді қоспағанда, әр күн сайын { $paymentAmountNew } төлем алынады.
subscriptionUpgrade-content-new-price-week = Әрі қарай сізден, жеңілдіктерді қоспағанда, әр апта сайын { $paymentAmountNew } төлем алынады.
subscriptionUpgrade-content-new-price-month = Әрі қарай сізден, жеңілдіктерді қоспағанда, әр ай сайын { $paymentAmountNew } төлем алынады.
subscriptionUpgrade-content-new-price-halfyear = Әрі қарай сізден, жеңілдіктерді қоспағанда, әр 6 ай сайын { $paymentAmountNew } төлем алынады.
subscriptionUpgrade-content-new-price-year = Әрі қарай сізден, жеңілдіктерді қоспағанда, жылына { $paymentAmountNew } төлем алынады.
subscriptionUpgrade-content-new-price-default = Әрі қарай, жеңілдіктерді қоспағанда, әрбір төлем аралығы үшін сізден { $paymentAmountNew } төлем алынады.
subscriptionUpgrade-content-new-price-day-dtax = Әрі қарай сізден әр күн сайын, жеңілдіктерді қоспағанда, { $paymentAmountNew } төлем + { $paymentTaxNew } салық алынады.
subscriptionUpgrade-content-new-price-week-tax = Әрі қарай сізден әр апта сайын, жеңілдіктерді қоспағанда, { $paymentAmountNew } төлем + { $paymentTaxNew } салық алынады.
subscriptionUpgrade-content-new-price-month-tax = Әрі қарай сізден әр ай сайын, жеңілдіктерді қоспағанда, { $paymentAmountNew } төлем + { $paymentTaxNew } салық алынады.
subscriptionUpgrade-content-new-price-halfyear-tax = Әрі қарай сізден әрбір 6 ай сайын, жеңілдіктерді қоспағанда, { $paymentAmountNew } төлем + { $paymentTaxNew } салық алынады.
subscriptionUpgrade-content-new-price-year-tax = Әрі қарай сізден жыл сайын, жеңілдіктерді қоспағанда, { $paymentAmountNew } төлем + { $paymentTaxNew } салық алынады.
subscriptionUpgrade-content-new-price-default-tax = Әрі қарай сізден әр төлем аралығы үшін, жеңілдіктерді қоспағанда, { $paymentAmountNew } төлем + { $paymentTaxNew } салық алынады.
subscriptionUpgrade-existing = Егер сіздің қолданыстағы жазылымдарыңыздың кез келгені осы жаңартумен сәйкес келсе, біз оларды өңдеп, сізге мәліметтері бар бөлек электрондық пошта жібереміз. Егер сіздің жаңа жоспарыңызда орнатуды қажет ететін өнімдер болса, біз сізге орнату нұсқаулары бар бөлек электрондық пошта жібереміз.
subscriptionUpgrade-auto-renew = Бас тартуды таңдамасаңыз, жазылуыңыз әрбір есеп айырысу кезеңінде автоматты түрде жаңартылады.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Кіру үшін { $unblockCode } пайдаланыңыз
unblockCode-preview = Бұл кодтың мерзімі бір сағатта бітеді
unblockCode-title = Кірем деген сіз бе?
unblockCode-prompt = Иә болса, міне, сізге керек авторизация коды:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Иә болса, міне, сізге керек авторизация коды: { $unblockCode }
unblockCode-report = Жоқ болса, алаяқтылармен күресуге көмектесу үшін <a data-l10n-name="reportSignInLink">ол туралы бізге хабарлаңыз.</a>
unblockCode-report-plaintext = Жоқ болса, алаяқтылармен күресуге көмектесу үшін ол туралы бізге хабарлаңыз.
verificationReminderFinal-subject = Тіркелгіңізді растау үшін соңғы еске салғыш
verificationReminderFinal-description-2 = Бірнеше апта бұрын сіз { -product-mozilla-account } жасадыңыз, бірақ оны ешқашан растамадыңыз. Сіздің қауіпсіздігіңіз үшін, тіркелгіңіз келесі 24 сағат ішінде расталмаса, оны өшіреміз.
confirm-account = Тіркелгіні растау
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Тіркелгіңізді растауды ұмытпаңыз
verificationReminderFirst-title-3 = { -brand-mozilla } ішіне қош келдіңіз!
verificationReminderFirst-description-3 = Бірнеше күн бұрын сіз { -product-mozilla-account } жасадыңыз, бірақ оны ешқашан растамадыңыз. Тіркелгіңізді келесі 15 күнде растаңыз, болмаса ол автоматты түрде өшіріледі.
verificationReminderFirst-sub-description-3 = Сізді және сіздің жекелігіңізді бірінші орынға қоятын браузерді жіберіп алмаңыз.
confirm-email-2 = Тіркелгіні растау
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Тіркелгіні растау
verificationReminderSecond-subject-2 = Тіркелгіңізді растауды ұмытпаңыз
verificationReminderSecond-title-3 = { -brand-mozilla } жіберіп алмаңыз!
verificationReminderSecond-description-4 = Бірнеше күн бұрын сіз { -product-mozilla-account } жасадыңыз, бірақ оны ешқашан растамадыңыз. Тіркелгіңізді келесі 10 күнде растаңыз, болмаса ол автоматты түрде өшіріледі.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } { -brand-firefox } қалып-күйін құрылғылар арасында синхрондауға мүмкіндік береді және { -brand-mozilla } ұсынған, жекелігіңізді қорғайтын басқа да өнімдерге қол жеткізу мүмкіндігін береді.
verificationReminderSecond-sub-description-2 = Интернетті әркім үшін ашық жерге айналдыру миссиямыздың бір бөлігі болыңыз.
verificationReminderSecond-action-2 = Тіркелгіні растау
verify-title-3 = { -brand-mozilla } көмегімен Интернетті ашыңыз
verify-description-2 = Тіркелгіңізді растаңыз және { -brand-mozilla } мүмкіндігін барлық жүйеге кірген жерлерде пайдаланыңыз, келесіден бастап:
verify-subject = Тіркелгіні жасауды аяқтаңыз
verify-action-2 = Тіркелгіні растау
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Тіркелгіңізді өзгерту үшін { $code } пайдаланыңыз
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Бұл кодтың мерзімі { $expirationTime } минуттан кейін аяқталады.
       *[other] Бұл кодтың мерзімі { $expirationTime } минуттан кейін аяқталады.
    }
verifyAccountChange-title = Тіркелгі деректеріңізді өзгертіп жатырсыз ба?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Бұл өзгерісті растау арқылы тіркелгіңізді қорғауға көмектесіңіз:
verifyAccountChange-prompt = Иә болса, міне, сіздің авторизация кодыңыз:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Оның мерзімі { $expirationTime } минуттан кейін аяқталады.
       *[other] Оның мерзімі { $expirationTime } минуттан кейін аяқталады.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = { $clientName } ішіне кірдіңіз бе?
verifyLogin-description-2 = Жүйеге кіргеніңізді растау арқылы тіркелгіңізді қорғауға көмектесіңіз:
verifyLogin-subject-2 = Кіруді растау
verifyLogin-action = Кіруді растау
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Кіру үшін { $code } пайдаланыңыз
verifyLoginCode-preview = Бұл кодтың мерзімі 5 минуттан кейін аяқталады.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = { $serviceName } ішіне кірдіңіз бе?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Жүйеге келесі кіргеніңізді растау арқылы тіркелгіңізді қорғауға көмектесіңіз:
verifyLoginCode-prompt-3 = Иә болса, міне, сіздің авторизация кодыңыз:
verifyLoginCode-expiry-notice = Оның мерзімі 5 минутта бітеді.
verifyPrimary-title-2 = Біріншілік эл. поштаңызды растау
verifyPrimary-description = Тіркелгіде өзгерістерді жасау сұратуы келесі құрылғыдан жасалған:
verifyPrimary-subject = Біріншілік эл. поштаңызды растау
verifyPrimary-action-2 = Эл. поштаны растау
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Расталғаннан кейін, екіншілік эл. поштаны қосу сияқты тіркелгіні өзгерту бұл тіркелгіден қолжетерлік болады.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Қосымша электрондық поштаңызды растау үшін { $code } пайдаланыңыз
verifySecondaryCode-preview = Бұл кодтың мерзімі 5 минуттан кейін аяқталады.
verifySecondaryCode-title-2 = Екіншілік эл. поштаңызды растау
verifySecondaryCode-action-2 = Эл. поштаны растау
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = { $email } адресін екіншілік эл. пошта адресі ретінде қолдану сұранымы келесі { -product-mozilla-account } тіркелгісінен жасалған:
verifySecondaryCode-prompt-2 = Бұл растау кодын пайдалану:
verifySecondaryCode-expiry-notice-2 = Оның мерзімі 5 минутта бітеді. Расталғаннан кейін бұл адрес қауіпсіздік хабарландырулары мен растауларын ала бастайды.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Тіркелгіңізді растау үшін { $code } пайдаланыңыз
verifyShortCode-preview-2 = Бұл кодтың мерзімі 5 минуттан кейін аяқталады.
verifyShortCode-title-3 = { -brand-mozilla } көмегімен Интернетті ашыңыз
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Тіркелгіңізді растаңыз және { -brand-mozilla } мүмкіндігін барлық жүйеге кірген жерлерде пайдаланыңыз, келесіден бастап:
verifyShortCode-prompt-3 = Бұл растау кодын пайдалану:
verifyShortCode-expiry-notice = Оның мерзімі 5 минутта бітеді.
