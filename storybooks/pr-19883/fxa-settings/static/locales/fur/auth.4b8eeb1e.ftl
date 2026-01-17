## Non-email strings

session-verify-send-push-title-2 = Jentrâ tal to { -product-mozilla-account }?
session-verify-send-push-body-2 = Fâs clic achì par confermâ la tô identitât
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } al è il to codiç di verifiche par { -brand-mozilla }. Al scjât ca di 5 minûts.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Codiç di verifiche { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } al è il to codiç di recupar par { -brand-mozilla }. Al scjât ca di 5 minûts.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Codiç { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } al è il to codiç di recupar par { -brand-mozilla }. Al scjât ca di 5 minûts.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Codiç { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronize dispositîfs">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositîfs">
fxa-privacy-url = Informative su la riservatece di { -brand-mozilla }
moz-accounts-privacy-url-2 = Informative su la riservatece dai { -product-mozilla-accounts }
moz-accounts-terms-url = Cundizions di utilizazion dal servizi dai { -product-mozilla-accounts }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Cheste e je une e-mail inviade di un servizi automatic; se tu le âs ricevude par erôr, nol covente fâ nuie.
subplat-privacy-notice = Informative su la riservatece
subplat-privacy-plaintext = Informative su la riservatece:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je associade a un { -product-mozilla-account } e tu âs fat la regjistrazion a { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je associade a un { -product-mozilla-account }.
subplat-explainer-multiple-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je associade a un { -product-mozilla-account } e tu âs fat la sotscrizion a plui prodots.
subplat-explainer-was-deleted-2 = Tu ricevis cheste e-mail parcè che la direzion { $email } e je stade doprade par regjistrâ un { -product-mozilla-account }
subplat-manage-account-2 = Gjestìs lis impostazions dal to { -product-mozilla-account } visitant la <a data-l10n-name="subplat-account-page">pagjine dal account</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gjestìs lis impostazions dal to { -product-mozilla-account } visitant la pagjine dal to account: { $accountSettingsUrl }
subplat-terms-policy = Tiermins e cundizions di cancelazion
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anule l'abonament
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Torne ative l'abonament
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Inzorne lis informazions pe fature
subplat-privacy-policy = Informative su la riservatece di { -brand-mozilla }
subplat-privacy-policy-2 = Informative su la riservatece dai { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Cundizions di utilizazion dal servizi dai { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Notis legâls
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Riservatece
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Se il to account al ven eliminât, tu continuarâs a ricevi e-mails di Mozilla Corporation e Mozilla Foundation, gjavât che no tu <a data-l10n-name="unsubscribeLink">domandis di anulâ la iscrizion</a>.
account-deletion-info-block-support = Se tu âs domandis o tu âs bisugne di assistence, no sta vê pôre di contatâ il nestri <a data-l10n-name="supportLink">grup di supuart</a>.
account-deletion-info-block-communications-plaintext = Se il to account al ven eliminât, tu continuarâs a ricevi e-mails di Mozilla Corporation e Mozilla Foundation, gjavât che no tu domandis di anulâ la iscrizion:
account-deletion-info-block-support-plaintext = Se tu âs domandis o tu âs bisugne di assistence, no sta vê pôre di contatâ il nestri grup di supuart:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Discjame { $productName } su { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Discjame { $productName } sul { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instale { $productName } su di <a data-l10n-name="anotherDeviceLink">un altri dispositîf di scritori</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instale { $productName } su di <a data-l10n-name="anotherDeviceLink">un altri dispositîf</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Oten { $productName } su Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Discjame { $productName } dal App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instale { $productName } su di un altri dispositîf:
automated-email-change-2 = Se no tu âs fat tu cheste operazion, <a data-l10n-name="passwordChangeLink">cambie la tô password</a> daurman.
automated-email-support = Par vê plui informazions, visite il <a data-l10n-name="supportLink">supuart di { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Se no tu âs fat tu cheste operazion, cambie la tô password daurman.
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Par vê plui informazions, visite il supuart di { -brand-mozilla }:
automated-email-inactive-account = Cheste e je une e-mail automatiche. Tu le âs ricevude parcè che tu âs un { -product-mozilla-account } e a son passâts 2 agns de ultime volte che tu sês jentrât.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Par vê plui informazions, visite il <a data-l10n-name="supportLink">supuart di { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Cheste e je une e-mail mandade di un servizi automatic. Se tu âs ricevût cheste e-mail par erôr, nol covente fâ nuie.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Chest messaç al è stât mandât di un servizi automatic. Se no tu âs autorizât tu cheste operazion, cambie la tô password:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Cheste richieste e rive di { $uaBrowser } su { $uaOS }  { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Cheste richieste e rive di { $uaBrowser } su { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Cheste richieste e rive di { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Cheste richieste e rive di { $uaOS }  { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Cheste richieste e rive di { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Se no tu jeris tu, <a data-l10n-name="revokeAccountRecoveryLink">elimine la gnove clâf</a> e <a data-l10n-name="passwordChangeLink">cambie la tô password</a>.
automatedEmailRecoveryKey-change-pwd-only = Se no tu jeris tu, <a data-l10n-name="passwordChangeLink">cambie la tô password</a>.
automatedEmailRecoveryKey-more-info = Par vê plui informazions, visite il <a data-l10n-name="supportLink">supuart { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Cheste richieste e rive di:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Se no tu jeris tu, elimine la gnove clâf:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Se no tu jeris tu, cambie la tô password:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e cambie la tô password:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Par vê plui informazions, visite il supuart { -brand-mozilla }:
automated-email-reset =
    Cheste e-mail e je stade inviade di un servizi automatic. Se no tu âs autorizât tu cheste azion, <a data-l10n-name="resetLink">ristabilìs la tô password</a>.
    Par vê plui informazions, visite la pagjine dal <a data-l10n-name="supportLink">supuart di { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Se cheste azion no je stade fate di te, azere e riconfigure la password daurman su { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Se no tu âs fat tu cheste operazion, alore <a data-l10n-name="resetLink">ristabilìs la tô password</a> e <a data-l10n-name="twoFactorSettingsLink">ristabilìs la autenticazion in doi passaçs</a> daurman.
    Par vê plui informazions, visite il <a data-l10n-name="supportLink">supuart { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Se no tu âs fat tu cheste operazion, alore ristabilìs la tô password daurman su:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Ristabilìs ancje la autenticazion in doi passaçs su:
brand-banner-message = Savevistu che o vin cambiât non di { -product-firefox-accounts } a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Plui informazions</a>
cancellationSurvey = Judinus a miorâ i nestris servizis partecipant a chest <a data-l10n-name="cancellationSurveyUrl">curt sondaç</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Judinus a miorâ i nestris servizis partecipant a chest curt sondaç:
change-password-plaintext = Se tu pensis che cualchidun al stedi cirint di acedi in maniere ilegjitime al to account, cambie daurman la tô password.
manage-account = Gjestìs account
manage-account-plaintext = { manage-account }:
payment-details = Detais dal paiament:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numar fature: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Adebit: { $invoiceTotal } ai { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Prossime fature: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodi di paiament:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodi di paiament: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodi di paiament: { $cardName } che e finìs cun { $lastFour }
payment-provider-card-ending-in-plaintext = Metodi di paiament: cjarte che e finìs cun { $lastFour }
payment-provider-card-ending-in = <b>Metodi di paiament:</b> cjarte che e finìs cun { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodi di paiament:</b> { $cardName } che e finìs cun { $lastFour }
subscription-charges-invoice-summary = Sintesi fature

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numar fature:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numar fature: { $invoiceNumber }
subscription-charges-invoice-date = <b>Date:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Date: { $invoiceDateOnly }
subscription-charges-prorated-price = Presit ripartît in mût proporzionâl
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Presit ripartît in mût proporzionâl: { $remainingAmountTotal }
subscription-charges-list-price = Presit di listin
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Presit di listin: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credit dal timp che no tu âs doprât
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credit dal timp che no tu âs doprât: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Totâl parziâl</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Totâl parziâl: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Scont una tantum
subscription-charges-one-time-discount-plaintext = Scont una tantum: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Scont di { $discountDuration } mês
       *[other] Scont di { $discountDuration } mês
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Scont di { $discountDuration } mês: { $invoiceDiscountAmount }
       *[other] Scont di { $discountDuration } mês: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Scont
subscription-charges-discount-plaintext = Scont: { $invoiceDiscountAmount }
subscription-charges-taxes = Tassis e comissions
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Tassis e comissions: { $invoiceTaxAmount }
subscription-charges-total = <b>Totâl</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Totâl: { $invoiceTotal }
subscription-charges-credit-applied = Credit aplicât
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credit aplicât: { $creditApplied }
subscription-charges-amount-paid = <b>Impuart paiât</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Impuart paiât: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Tu âs ricevût un credit di { $creditReceived } sul to account che al vignarà aplicât aes tôs faturis futuris.

##

subscriptionSupport = Domandis sul abonament? Il nestri <a data-l10n-name="subscriptionSupportUrl">grup di supuart</a> al è achì par judâti.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Domandis sul abonament? Il nestri grup di supuart al è achì par judâti:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Graciis pal to abonament a { $productName }. Se tu âs domandis in merit o tu âs bisugne di vê plui informazions su { $productName }, <a data-l10n-name="subscriptionSupportUrl">contatinus</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Graciis pal abonament a { $productName }. Se tu âs domandis sul abonament o tu âs bisugne di vê plui informazions su { $productName }, contatinus:
subscription-support-get-help = Oten jutori pal to abonament
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gjestìs il to abonament</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gjestìs il to abonament:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contate il supuart</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contate il supuart:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Achì</a> tu puedis verificâ che il metodi di paiament e lis informazions sul account a sedin inzornâts.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tu puedis verificâ che il metodi di paiament e lis informazions sul account a sedin inzornâts achì:
subscriptionUpdateBillingTry = O cirarìn di fâ di gnûf il paiament in chescj prossims dîs, ma al è probabil che tu vedis di judânus a risolvi il probleme <a data-l10n-name="updateBillingUrl">inzornant lis informazions di paiament</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = O cirarìn di fâ di gnûf il paiament in chescj prossims dîs, ma al è probabil che tu vedis di judânus a risolvi il probleme inzornant lis informazions di paiament:
subscriptionUpdatePayment = Par evitâ cualsisei interuzion dal servizi, <a data-l10n-name="updateBillingUrl">inzornâ lis informazions di paiament</a> a pene pussibil.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Par evitâ cualsisei interuzion dal servizi, inzorne lis informazions di paiament a pene pussibil:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Par vê plui informazions, visite il <a data-l10n-name="supportLink">supuart { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Par vê plui informazions, visite il supuart di { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } su { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } su { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (stimât)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (stimât)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (stimât)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (stimât)
view-invoice-link-action = Visualize fature
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Visualize la fature: { $invoiceLink }
cadReminderFirst-subject-1 = Pro memoria: e je ore di sincronizâ { -brand-firefox }
cadReminderFirst-action = Sincronize un altri dispositîf
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = A coventin doi par sincronizâ
cadReminderFirst-description-v2 = Puarte lis tôs schedis su ducj i tiei dispositîfs. Oten segnelibris, passwords e altris dâts dapardut là che tu dopris { -brand-firefox }.
cadReminderSecond-subject-2 = No sta pierdi nuie! Complete la configurazion par scomençâ a sincronizâ
cadReminderSecond-action = Sincronize un altri dispositîf
cadReminderSecond-title-2 = No sta dismenteâti di sincronizâ!
cadReminderSecond-description-sync = Sincronize i tiei segnelibris, lis passwords, lis schedis viertis e tant altri — dapardut là che tu dopris { -brand-firefox }.
cadReminderSecond-description-plus = In plui, i tiei dâts a son simpri cifrâts. Dome tu e i dispositîfs che tu decidis o podês doprâju.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Benvignûts in { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Benvignûts in { $productName }
downloadSubscription-content-2 = Scomence a doprâ dutis lis funzionalitâts includudis tal to abonament:
downloadSubscription-link-action-2 = Scomence
fraudulentAccountDeletion-subject-2 = Il to { -product-mozilla-account } al è stât eliminât
fraudulentAccountDeletion-title = Il to account al è stât eliminât
fraudulentAccountDeletion-content-part1-v2 = Di resint al è stât creât un { -product-mozilla-account } e al è stât regjistrât un abonament a paiament doprant cheste direzion e-mail. Come che o fasìn par ducj i gnûfs accounts, par prime robe o vin domandât di confermâ il to account convalidant cheste direzion e-mail.
fraudulentAccountDeletion-content-part2-v2 = Par cumò nus risulte che l’account nol è mai stât confermât. Viodût che chest passaç nol è stât completât, no podìn jessi sigûrs che al sedi un abonament autorizât. Duncje, l’{ -product-mozilla-account } regjistrât cun cheste direzion e-mail al è stât eliminât e l’abonament al è stât anulât cu la rifusion di ducj i adebitaments.
fraudulentAccountDeletion-contact = Par cualsisei domande contate il nestri <a data-l10n-name="mozillaSupportUrl">grup di supuart</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Par cualsisei domande contate il nestri grup di supuart: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Ultime pussibilitât par mantignî il to { -product-mozilla-account }
inactiveAccountFinalWarning-title = Il to account { -brand-mozilla } e i tiei dâts a vignaran eliminâts
inactiveAccountFinalWarning-preview = Jentre par mantignî il to account
inactiveAccountFinalWarning-account-description = Il to { -product-mozilla-account } al ven doprât par acedi a prodots gratuits pe riservatece e pe navigazion come la sincronizazion di { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Ai <strong>{ $deletionDate }</strong>, il to account e i tiei dâts personâi a vignaran eliminâts par simpri, gjavant il câs che tu jentris prime di chê date.
inactiveAccountFinalWarning-action = Jentre par mantignî il to account
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Jentre par mantignî il to account:
inactiveAccountFirstWarning-subject = No sta pierdi il to account
inactiveAccountFirstWarning-title = Desideristu mantignî i tiei dâts e il to account { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Il to { -product-mozilla-account } al ven doprât par acedi a prodots gratuits pe riservatece e pe navigazion come la sincronizazion di { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = O vin notât che no tu jentris di 2 agns.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Il to account e i tiei dâts personâi a vignaran eliminâts par simpri ai <strong>{ $deletionDate }</strong> par vie de tô inativitât.
inactiveAccountFirstWarning-action = Jentre par mantignî il to account
inactiveAccountFirstWarning-preview = Jentre par mantignî il to account
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Jentre par mantignî il to account:
inactiveAccountSecondWarning-subject = Azion domandade: eliminazion dal accaount ca di 7 dîs
inactiveAccountSecondWarning-title = Il to account { -brand-mozilla } e i tiei dâts a vignaran eliminâts ca di 7 dîs
inactiveAccountSecondWarning-account-description-v2 = Il to { -product-mozilla-account } al ven doprât par acedi a prodots gratuits pe riservatece e pe navigazion come la sincronizazion di { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Il to account e i tiei dâts personâi a vignaran eliminâts par simpri ai <strong>{ $deletionDate }</strong> par vie de tô inativitât.
inactiveAccountSecondWarning-action = Jentre par mantignî il to account
inactiveAccountSecondWarning-preview = Jentre par mantignî il to account
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Jentre par mantignî il to account:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Tu âs esaurît i codiçs di autenticazion di backup!
codes-reminder-title-one = Al reste l'ultin codiç di autenticazion di backup
codes-reminder-title-two = E je ore di creâ altris codiçs di autenticazion di backup
codes-reminder-description-part-one = I codiçs di autenticazion di backup ti permetin di ripristinâ i tiei dâts tal câs che tu dismenteis la password.
codes-reminder-description-part-two = Cree cumò gnûfs codiçs par no pierdi i tiei dâts un doman.
codes-reminder-description-two-left = A restin dome doi codiçs.
codes-reminder-description-create-codes = Cree gnûfs codiçs di autenticazion di backup par podê jentrâ tal to account, tal câs che tu restis blocât fûr.
lowRecoveryCodes-action-2 = Cree codiçs
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nol reste nissun codiç di autenticazion di backup
        [one] Al reste dome 1 codiç di autenticazion di backup
       *[other] A restin dome { $numberRemaining } codiçs di autenticazion di backup!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Gnûf acès a { $clientName }
newDeviceLogin-subjectForMozillaAccount = Gnûf acès al to { -product-mozilla-account }
newDeviceLogin-title-3 = Il to { -product-mozilla-account } al è stât doprât par jentrâ
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = No jeristu tu? <a data-l10n-name="passwordChangeLink">Cambie la tô password</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = No jeristu tu? Cambie la tô password:
newDeviceLogin-action = Gjestìs account
passwordChanged-subject = Password inzornade
passwordChanged-title = Password modificade cun sucès
passwordChanged-description-2 = La password dal { -product-mozilla-account } e je stade modificade cun sucès di chest dispositîf:
passwordChangeRequired-subject = Rilevade ativitât suspiete
passwordChangeRequired-preview = Cambie la tô password daurman
passwordChangeRequired-title-2 = Ristabilìs la tô password
passwordChangeRequired-suspicious-activity-3 = O vin blocât il to account par protezilu di ativitâts suspietis. E je stade fate la tô disconession a ducj i dispositîf e par precauzion ducj i dâts sincronizâts a son stâts eliminâts.
passwordChangeRequired-sign-in-3 = Par tornâ a jentrâ tal to account, ti baste nome ristabilî la tô password.
passwordChangeRequired-different-password-2 = <b>impuartant:</b> sielç une password complicade, divierse di chê che tu âs doprât prime.
passwordChangeRequired-different-password-plaintext-2 = impuartant: sielç une password complicade, divierse di chê che tu âs doprât prime.
passwordChangeRequired-action = Ristabilìs password
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Dopre { $code } par cambiâ la tô password
password-forgot-otp-preview = Chest codiç al scjât ca di 10 minûts
password-forgot-otp-title = Password dismenteade?
password-forgot-otp-request = O vin ricevût une richieste di modifiche de tô password pal to { -product-mozilla-account } di:
password-forgot-otp-code-2 = Se tu jeris tu, ve chi il codiç di conferme par continuâ:
password-forgot-otp-expiry-notice = Chest codiç al scjât ca di 10 minûts.
passwordReset-subject-2 = La password e je stade ristabilide
passwordReset-title-2 = La password e je stade ristabilide
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Tu âs ristabilît la password dal to { -product-mozilla-account } su:
passwordResetAccountRecovery-subject-2 = La password e je stade ristabilide
passwordResetAccountRecovery-title-3 = La password e je stade ristabilide
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Tu âs doprade la clâf di recupar dal account par ristabilî la password di { -product-mozilla-account } su:
passwordResetAccountRecovery-information = Ti vin disconetût/disconetude di ducj i tiei dispositîfs sincronizâts. O vin creât une gnove clâf di recupar dal account par sostituî chê che tu âs doprât. Tu puedis modificâle tes impostazions dal to account.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Ti vin disconetût/disconetude di ducj i tiei dispositîfs sincronizâts. O vin creât une gnove clâf di recupar dal account par sostituî chê che tu âs doprât. Tu puedis modificâle tes impostazions dal account:
passwordResetAccountRecovery-action-4 = Gjestìs account
passwordResetRecoveryPhone-subject = Doprât telefon pal recupar dal account
passwordResetRecoveryPhone-preview = Controle che tu jeris tu
passwordResetRecoveryPhone-title = Al è stât doprât il telefon pal recupar dal account par confermâ il ripristinament de password
passwordResetRecoveryPhone-device = Telefon pal recupar dal account doprât di:
passwordResetRecoveryPhone-action = Gjestìs account
passwordResetWithRecoveryKeyPrompt-subject = La password e je stade ristabilide
passwordResetWithRecoveryKeyPrompt-title = La password e je stade ristabilide
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Tu âs ristabilît la password dal to { -product-mozilla-account } su:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Cree une clâf di recupar dal account
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Cree une clâf di recupar dal account:
passwordResetWithRecoveryKeyPrompt-cta-description = Tu varâs di jentrâ di gnûf su ducj i tiei dispositîfs sincronizâts. La prossime volte ten al sigûr i tiei dâts cuntune clâf di recupar dal account. Chest ti permetarà di recuperâ i tiei dâts se tu dismenteis la password.
postAddAccountRecovery-subject-3 = Gjenerade gnove clâf di recupar dal account
postAddAccountRecovery-title2 = Tu âs creât une gnove clâf di recupar dal account
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Salve cheste clâf intun puest sigûr: ti coventarà par ripristinâ i dâts di navigazion cifrâts se tu dismenteis la password.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Al è pussibil doprâ cheste clâf nome une volte. Dopo doprade, ti crearìn in automatic une gnove. Opûr, da lis impostazions dal account, tu puedis creâ une gnove clâf in cualsisei moment.
postAddAccountRecovery-action = Gjestìs account
postAddLinkedAccount-subject-2 = Gnûf account colegât al to { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Il to account { $providerName } al è stât colegât al to { -product-mozilla-account }
postAddLinkedAccount-action = Gjestìs account
postAddRecoveryPhone-subject = Zontât telefon pal recupar dal account
postAddRecoveryPhone-preview = Account protet de autenticazion in doi passaçs
postAddRecoveryPhone-title-v2 = Tu âs zontât un telefon pal recupar dal account
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Tu âs zontât { $maskedLastFourPhoneNumber } tant che numar di telefon di recupar
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Cemût che al jude a protezi il to account
postAddRecoveryPhone-how-protect-plaintext = Cemût che al jude a protezi il to account:
postAddRecoveryPhone-enabled-device = Tu le âs ativade di:
postAddRecoveryPhone-action = Gjestìs account
postAddTwoStepAuthentication-preview = Il to account al è protet
postAddTwoStepAuthentication-subject-v3 = La autenticazion in doi passaç e je ative
postAddTwoStepAuthentication-title-2 = Tu âs ativât la autenticazion in doi passaçs
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Tu le âs domandade di:
postAddTwoStepAuthentication-action = Gjestìs account
postAddTwoStepAuthentication-code-required-v4 = Di ca indenant ogni volte che tu jentris ti vignaran domandâts i codiçs gjenerâts de aplicazion di autenticazion.
postAddTwoStepAuthentication-recovery-method-codes = Tu âs ancje zontât i codiçs di autenticazion di backup tant che metodi di recupar.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Tu âs ancje zontât { $maskedPhoneNumber } tant che telefon pal recupar dal account.
postAddTwoStepAuthentication-how-protects-link = Cemût che al jude a protezi il to account
postAddTwoStepAuthentication-how-protects-plaintext = Cemût che al jude a protezi il to account:
postAddTwoStepAuthentication-device-sign-out-message = Par protezi ducj i tiei dispositîfs conetûts, tu scugnis disconetiti di ducj i dispositîfs là che tu dopris chest account, dopo tornâ a jentrâ doprant la autenticazion in doi passaçs.
postChangeAccountRecovery-subject = Clâf di recupar dal account cambiade
postChangeAccountRecovery-title = Tu âs modificât la clâf di recupar dal account
postChangeAccountRecovery-body-part1 = Cumò tu âs une gnove clâf di recupar dal account. La clâf di prime e je stade eliminade.
postChangeAccountRecovery-body-part2 = Salve cheste gnove clâf intun puest sigûr: ti coventarà par ripristinâ i dâts di navigazion cifrâts se tu dismenteis la password.
postChangeAccountRecovery-action = Gjestìs account
postChangePrimary-subject = E-mail primarie inzornade
postChangePrimary-title = Gnove e-mail primarie
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Tu âs modificât cun sucès la tô e-mail primarie in { $email }. Di ca indenant la gnove direzion e-mail e je il to non utent par jentrâ tal to { -product-mozilla-account } e par ricevi notifichis di sigurece e di conferme.
postChangePrimary-action = Gjestìs account
postChangeRecoveryPhone-subject = Telefon di recupar dal account inzornât
postChangeRecoveryPhone-preview = Account protet de autenticazion in doi passaçs
postChangeRecoveryPhone-title = Tu âs cambiât il numar di telefon pal recupar dal account
postChangeRecoveryPhone-description = Cumò tu âs un gnûf numar di telefon pal recupar dal account. Il numar di telefon di prime al è stât eliminât.
postChangeRecoveryPhone-requested-device = Richieste fate di:
postChangeTwoStepAuthentication-preview = Il to account al è protet
postChangeTwoStepAuthentication-subject = Autenticazion in doi passaçs inzornade
postChangeTwoStepAuthentication-title = La autenticazion in doi passaçs e je stade inzornade
postChangeTwoStepAuthentication-use-new-account = Di cumò indevant tu varâs di doprâ la gnove vôs par { -product-mozilla-account } te tô aplicazion di autenticazion. La version di prime no funzionarà plui e tu puedis gjavâle.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Tu le âs domandade di:
postChangeTwoStepAuthentication-action = Gjestìs account
postChangeTwoStepAuthentication-how-protects-link = Cemût che al jude a protezi il to account
postChangeTwoStepAuthentication-how-protects-plaintext = Cemût che al jude a protezi il to account:
postChangeTwoStepAuthentication-device-sign-out-message = Par protezi ducj i tiei dispositîfs conetûts, tu scugnis disconetiti di ducj i dispositîfs là che tu dopris chest account, dopo tornâ a jentrâ doprant la tô gnove autenticazion in doi passaçs.
postConsumeRecoveryCode-title-3 = Il codiç di autenticazion di backup al è stât doprât par confermâ il ripristinament de password
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Codiç doprât di:
postConsumeRecoveryCode-action = Gjestìs account
postConsumeRecoveryCode-subject-v3 = Al è stât doprât un codiç di autenticazion di backup
postConsumeRecoveryCode-preview = Controle che tu jeris tu
postNewRecoveryCodes-subject-2 = A son stâts creâts gnûfs codiçs di autenticazion di backup
postNewRecoveryCodes-title-2 = Tu âs creât gnûfs codiçs di autenticazion di backup
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = A son stâts creâts su:
postNewRecoveryCodes-action = Gjestìs account
postRemoveAccountRecovery-subject-2 = Clâf di recupar dal account eliminade
postRemoveAccountRecovery-title-3 = Tu âs eliminât la clâf direcupar dal account
postRemoveAccountRecovery-body-part1 = La clâf di recupar dal account e je necessarie par ripristinâ i dâts di navigazion cifrâts se tu dismenteis la password.
postRemoveAccountRecovery-body-part2 = Se no tu lu âs za fat, cree une gnove clâf di recupar dal account tes impostazions par evitâ di pierdi i tiei dâts salvâts come lis passwords, i segnelibris, la cronologjie di navigazion e ancjemò altri.
postRemoveAccountRecovery-action = Gjestìs account
postRemoveRecoveryPhone-subject = Il numar di telefon pal recupar dal account al è stât gjavât
postRemoveRecoveryPhone-preview = Account protet de autenticazion in doi passaçs
postRemoveRecoveryPhone-title = Il numar di telefon pal recupar dal account al è stât gjavât
postRemoveRecoveryPhone-description-v2 = Il telefon pal recupar dal account al è stât gjavât da lis impostazions di autenticazion in doi passaçs.
postRemoveRecoveryPhone-description-extra = Tu puedis distès doprâ i codiçs di autenticazion di backup par jentrâ tal câs che tu rivedis a doprâ la aplicazion di autenticazion.
postRemoveRecoveryPhone-requested-device = Richieste fate di:
postRemoveSecondary-subject = E-mail secondarie gjavade
postRemoveSecondary-title = E-mail secondarie gjavade
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Tu âs gjavât cun sucès la direzion { $secondaryEmail } tant che e-mail secondarie pal to { -product-mozilla-account }. Lis notifichis di sigurece e lis verifichis di acès no vignaran plui mandadis a cheste direzion.
postRemoveSecondary-action = Gjestìs account
postRemoveTwoStepAuthentication-subject-line-2 = Autenticazion in doi passaçs disativade
postRemoveTwoStepAuthentication-title-2 = Tu âs disativât la autenticazion in doi passaçs
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Tu le âs disativade di:
postRemoveTwoStepAuthentication-action = Gjestìs account
postRemoveTwoStepAuthentication-not-required-2 = No ti coventaran plui codiçs di sigurece de tô aplicazion di autenticazion par jentrâ.
postSigninRecoveryCode-subject = Codiç di autenticazion di backup doprât par jentrâ
postSigninRecoveryCode-preview = Conferme la ativitât dal account
postSigninRecoveryCode-title = Il to codiç di autenticazion di backup al è stât doprât par jentrâ
postSigninRecoveryCode-description = Se no tu lu âs fat tu, tu varessis di cambiâ daurman la password par tignî al sigûr il to account.
postSigninRecoveryCode-device = Acès eseguît di:
postSigninRecoveryCode-action = Gjestìs account
postSigninRecoveryPhone-subject = Par jentrâ al è stât doprât il numar di telefon pal recupar dal account
postSigninRecoveryPhone-preview = Conferme la ativitât dal account
postSigninRecoveryPhone-title = Par jentrâ al è stât doprât il numar di telefon pal recupar dal account
postSigninRecoveryPhone-description = Se no tu lu âs fat tu, tu varessis di cambiâ daurman la password par tignî al sigûr il to account.
postSigninRecoveryPhone-device = Acès eseguît di:
postSigninRecoveryPhone-action = Gjestìs account
postVerify-sub-title-3 = O sin contents di vêti chi!
postVerify-title-2 = Vûstu visualizâ la stesse schede su doi dispositîfs?
postVerify-description-2 = Al è facil! Ti baste instalâ { -brand-firefox } suntun altri dispositîf e jentrâ par ativâ la sincronizazion. E somee magjie!
postVerify-sub-description = (Psst… Chest al significhe che tu puedis doprâ i tiei segnelibris, lis passwords e i altris dâts di { -brand-firefox } dapardut là che tu sês jentrât cu lis tôs credenziâls.)
postVerify-subject-4 = Benvignûts in { -brand-mozilla }!
postVerify-setup-2 = Conet un altri dispositîf:
postVerify-action-2 = Conet un altri dispositîf
postVerifySecondary-subject = E-mail secondarie zontade
postVerifySecondary-title = E-mail secondarie zontade
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Tu âs confermât cun sucès la direzion { $secondaryEmail } tant che e-mail secondarie pal to { -product-mozilla-account }. Di ca indenant lis notifichis di sigurece e lis verifichis di acès a vignaran mandadis a dutis dôs lis direzions di pueste.
postVerifySecondary-action = Gjestìs account
recovery-subject = Ristabilìs la tô password
recovery-title-2 = Password dismenteade?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = O vin ricevût une richieste di modifiche de tô password pal to { -product-mozilla-account } di:
recovery-new-password-button = Fâs clic sul boton chi sot par creâ une gnove password. Chest colegament al scjadarà chi di une ore.
recovery-copy-paste = Cope e tache chest URL tal to navigadôr par creâ une gnove password. Chest colegament al scjadarà chi di une ore.
recovery-action = Cree gnove password
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Il to abonament a { $productName } al è stât cancelât
subscriptionAccountDeletion-title = Tu nus mancjarâs
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Di resint tu âs eliminât il to { -product-mozilla-account }. Alore o ven anulât il to abonament a { $productName }. Il paiament finâl di { $invoiceTotal } al è stât paiât ai { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Benvignûts in { $productName }: configure la tô password.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Benvignûts in { $productName }
subscriptionAccountFinishSetup-content-processing = Il paiament al è in fase di elaborazion, la operazion e podarès domandâ fin a cuatri dîs lavoratîfs. Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
subscriptionAccountFinishSetup-content-create-3 = Dopo, tu varâs di creâ une password par { -product-mozilla-account } cussì di scomençâ a doprâ il to gnûf abonament.
subscriptionAccountFinishSetup-action-2 = Scomence
subscriptionAccountReminderFirst-subject = Pro memoria: complete la configurazion dal to account
subscriptionAccountReminderFirst-title = No tu puedis ancjemò jentrâ tal to abonament
subscriptionAccountReminderFirst-content-info-3 = Cualchi dì indaûr tu âs creât un { -product-mozilla-account } ma no tu lu âs confermât. O sperìn che tu finissis di configurâ il to account, cussì che tu podedis doprâ il to gnûf abonament.
subscriptionAccountReminderFirst-content-select-2 = Selezione “ Cree password” par configurâ une gnove password e completâ la conferme dal to account.
subscriptionAccountReminderFirst-action = Cree password
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Pro memoria finâl: configure il to account
subscriptionAccountReminderSecond-title-2 = Benvignûts in { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Cualchi dì indaûr tu âs creât un { -product-mozilla-account } ma no tu lu âs confermât. O sperìn che tu finissis di configurâ il to account, cussì che tu podedis doprâ il to gnûf abonament.
subscriptionAccountReminderSecond-content-select-2 = Selezione “ Cree password” par configurâ une gnove password e completâ la conferme dal to account.
subscriptionAccountReminderSecond-action = Cree password
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Il to abonament a { $productName } al è stât cancelât
subscriptionCancellation-title = Tu nus mancjarâs

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = O vin anulât il to abonament a { $productName }. Il paiament finâl di { $invoiceTotal } al è stât paiât ai { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = O vin anulât il to abonament a { $productName }. Il paiament finâl di { $invoiceTotal } al vignarà paiât ai { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Il servizi al continuarà fin ae fin dal periodi di faturazion, che al è ai { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Tu âs fat il passaç a { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Passaç di { $productNameOld } a { $productName } completât cun sucès.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Tacant cu la tô prossime fature, il paiament al sarà modificât di { $paymentAmountOld } par { $productPaymentCycleOld } a { $paymentAmountNew } par { $productPaymentCycleNew }. Tal stes timp ti vignarà increditade ancje une sume una tantum di { $paymentProrated } par rifleti la tarife plui basse pal rest di chest { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Tal câs che ti coventi instalâ altri software par podê doprâ { $productName }, tu ricevarâs intune altre e-mail lis istruzions par discjamâlu.
subscriptionDowngrade-content-auto-renew = Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Il to abonament a { $productName } al è stât cancelât
subscriptionFailedPaymentsCancellation-title = Il to abonament al è stât cancelât
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = O vin anulât il to abonament a { $productName } par vie dai tancj tentatîfs falîts di paiament. Par otignî di gnûf l'acès, sotscrîf un gnûf abonament cuntun metodi di paiament inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Il paiament par { $productName } al è stât confermât
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Graciis par vê sotscrit un abonament a { $productName }
subscriptionFirstInvoice-content-processing = Il paiament al è in fase di elaborazion, la operazion e podarès puartâ vie fin a cuatri dîs lavoratîfs.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Tu ricevarâs une altre e-mail cu lis informazions su cemût scomençâ a doprâ { $productName }.
subscriptionFirstInvoice-content-auto-renew = Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = La prossime fature e vignarà emetude ai { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Il metodi di paiament par { $productName } al è scjadût o al sta par scjadê
subscriptionPaymentExpired-title-2 = Il metodi di paiament al è scjadût o al sta par scjadê
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Il metodi di paiament che tu dopris par { $productName } al è scjadût o al sta par scjadê.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Paiament par { $productName } falît
subscriptionPaymentFailed-title = Nus displâs, o vin fastidis cul to paiament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = O vin vût un probleme cul to ultin paiament par { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Al è pussibil che il to metodi di paiament al sedi scjadût o che il to metodi di paiament corint nol sedi inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Inzornament des informazions di paiament necessari par { $productName }
subscriptionPaymentProviderCancelled-title = Nus displâs, o vin fastidis cul to metodi di paiament
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = O vin rilevât un probleme cul to metodi di paiament par { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Al è pussibil che il to metodi di paiament al sedi scjadût o che il to metodi di paiament corint nol sedi inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonament a { $productName } riativât
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Graciis di vê riativât il to abonament a { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Il cicli di faturazion e l'impuart a restaran invariâts. Il to prossim adebit al sarà di { $invoiceTotal } ai { $nextInvoiceDateOnly }. Il to abonament si rinovarà in automatic a ogni scjadince di faturazion, gjavant il câs che no tu decidis di anulâlu.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Avîs di rinovazion automatiche di { $productName }
subscriptionRenewalReminder-title = Il to abonament al vignarà rinovât chi di pôc
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Zentîl client di { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Il to abonament atuâl al è configurât pal rinovament automatic chi di { $reminderLength } dîs. In chê volte, { -brand-mozilla } al rinovarà il to abonament par { $planIntervalCount }{ $planInterval } e al vignarà aplicât un adebit di { $invoiceTotal } sul metodi di paiament inserît sul to account.
subscriptionRenewalReminder-content-closing = Cun rispiet,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Il grup di { $productName }
subscriptionReplaced-subject = Il to abonament al è stât inzornât tant che part dal to inzornament
subscriptionReplaced-title = Il to abonament al è stât inzornât
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Il to abonament individuâl a { $productName } al è stât sostituît e cumò al è includût tal gnûf pachet.
subscriptionReplaced-content-credit = Tu ricevarâs un credit pe part che no tu âs doprât dal to vecjo abonament. Chest credit al vignarà aplicât in automatic al to account e al vignarà doprât pai adebits futûrs.
subscriptionReplaced-content-no-action = No je domandade nissune azion de bande tô.
subscriptionsPaymentExpired-subject-2 = Il metodi di paiament pai tiei abonaments al è scjadût o al scjât ca di pôc
subscriptionsPaymentExpired-title-2 = Il metodi di paiament al è scjadût o al sta par scjadê
subscriptionsPaymentExpired-content-2 = Il metodi di paiament che tu stâs doprant par chescj abonaments al è scjadût o al sta par scjadê.
subscriptionsPaymentProviderCancelled-subject = Inzornament des informazions di paiament necessari pai abonaments di { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Nus displâs, o vin fastidis cul to metodi di paiament
subscriptionsPaymentProviderCancelled-content-detected = O vin rilevât un probleme cul metodi di paiament sielt par chescj abonaments.
subscriptionsPaymentProviderCancelled-content-payment-1 = Al è pussibil che il to metodi di paiament al sedi scjadût o che il to metodi di paiament corint nol sedi inzornât.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Il paiament par { $productName } al è stât ricevût
subscriptionSubsequentInvoice-title = Graciis pal to abonament!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = O vin ricevût il to ultin paiament par { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = La prossime fature e vignarà emetude ai { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Tu âs inzornât a { $productName }
subscriptionUpgrade-title = Graciis pal inzornament!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = L'inzornament a { $productName } al è stât fat cun sucès.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Une tarife una tantum di { $invoiceAmountDue } e je stade contizade a ti par rifleti il presit plui alt dal to abonament pal rest di chest periodi di faturazion ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Tu âs ricevût un credit di { $paymentProrated } sul cont.
subscriptionUpgrade-content-subscription-next-bill-change = Tacant de prossime fature, il presit dal to abonament al cambiarà.
subscriptionUpgrade-content-old-price-day = La tarife di prime e jere di { $paymentAmountOld } al dì.
subscriptionUpgrade-content-old-price-week = La tarife di prime e jere di { $paymentAmountOld } ae setemane.
subscriptionUpgrade-content-old-price-month = La tarife di prime e jere di { $paymentAmountOld } al mês.
subscriptionUpgrade-content-old-price-halfyear = La tarife di prime e jere di { $paymentAmountOld } par sîs mês.
subscriptionUpgrade-content-old-price-year = La tarife di prime e jere di { $paymentAmountOld } al an.
subscriptionUpgrade-content-old-price-default = La tarife di prime e jere di { $paymentAmountOld } par dade di faturazion.
subscriptionUpgrade-content-old-price-day-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis al dì.
subscriptionUpgrade-content-old-price-week-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis a setemane.
subscriptionUpgrade-content-old-price-month-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis al mês.
subscriptionUpgrade-content-old-price-halfyear-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis par sîs mês.
subscriptionUpgrade-content-old-price-year-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis al an.
subscriptionUpgrade-content-old-price-default-tax = La tarife di prime e jere di { $paymentAmountOld } + { $paymentTaxOld } di tassis par dade di faturazion.
subscriptionUpgrade-content-new-price-day = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } al dì, gjavâts i sconts.
subscriptionUpgrade-content-new-price-week = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } ae setemane, gjavâts i sconts.
subscriptionUpgrade-content-new-price-month = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } al mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-halfyear = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } par sîs mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-year = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } al an, gjavâts i sconts.
subscriptionUpgrade-content-new-price-default = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } par dade di faturazion, gjavâts i sconts.
subscriptionUpgrade-content-new-price-day-dtax = Di cumò indevant, ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis al dì, gjavâts i sconts.
subscriptionUpgrade-content-new-price-week-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis a setemane, gjavâts i sconts.
subscriptionUpgrade-content-new-price-month-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis al mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-halfyear-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis par sîs mês, gjavâts i sconts.
subscriptionUpgrade-content-new-price-year-tax = Di cumò indevant, ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis al an, gjavâts i sconts.
subscriptionUpgrade-content-new-price-default-tax = Di cumò indevant ti vignaran adebitâts { $paymentAmountNew } + { $paymentTaxNew } di tassis par dade di faturazion, gjavâts i sconts.
subscriptionUpgrade-existing = Se un dai tiei abonaments esistents si sorepon cun chest inzornament, lu tratarìn e ti inviarìn une e-mail separade cui detais. Se il to gnûf plan al inclût prodots di instalâ, ti mandarìn une e-mail separade cu lis istruzions pe instalazion.
subscriptionUpgrade-auto-renew = Il to abonament si rinovarà in automatic a ogni periodi di faturazion, gjavant il câs che no tu decidis di anulâlu.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Dopre { $unblockCode } par jentrâ
unblockCode-preview = Chest codiç al scjât ca di une ore
unblockCode-title = Sêstu tu a jentrâ?
unblockCode-prompt = Se sì, chest al è il codiç di autorizazion che ti covente:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Se sì, chest al è il codiç di autorizazion che ti covente: { $unblockCode }
unblockCode-report = In câs contrari, judinus a tignî lontans i intrûs <a data-l10n-name="reportSignInLink">fasintnus une segnalazion</a>.
unblockCode-report-plaintext = In câs contrari, judinus a tignî lontans i intrûs e segnalinus il fat.
verificationReminderFinal-subject = Ultin pro memoria par confermâ il to account
verificationReminderFinal-description-2 = Un pâr di setemanis indaûr tu âs creât un { -product-mozilla-account }, ma no tu lu âs mai confermât. Pe tô sigurece o eliminarìn l'account se nol vignarà verificât tes prossimis 24 oris.
confirm-account = Conferme account
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Visiti di confermâ il to account
verificationReminderFirst-title-3 = Benvignûts in { -brand-mozilla }!
verificationReminderFirst-description-3 = Cualchi zornade indaûr tu âs creât un { -product-mozilla-account }, ma no tu lu âs mai confermât. Conferme il to account tai prossims 15 dîs, se no in automatic al vignarà eliminât.
verificationReminderFirst-sub-description-3 = No sta fâti scjampâ il navigadôr che al met te e la tô riservatece al prin puest.
confirm-email-2 = Conferme account
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Conferme account
verificationReminderSecond-subject-2 = Visiti di confermâ il to account
verificationReminderSecond-title-3 = No sta fâti scjampâ { -brand-mozilla }!
verificationReminderSecond-description-4 = Cualchi zornade indaûr tu âs creât un { -product-mozilla-account }, ma no tu lu âs mai confermât. Conferme il to account tai prossims 10 dîs, se no in automatic al vignarà eliminât.
verificationReminderSecond-second-description-3 = Il to { -product-mozilla-account } ti permet di sincronizâ la tô esperience cun { -brand-firefox } su ducj i dispositîfs e al da acès a altris prodots { -brand-mozilla } dedicâts ae protezion de riservatece.
verificationReminderSecond-sub-description-2 = Partecipe ae nestre mission par trasformâ internet intun puest viert a ducj.
verificationReminderSecond-action-2 = Conferme account
verify-title-3 = Esplore internet cun { -brand-mozilla }
verify-description-2 = Conferme il to account e tire fûr il massim di { -brand-mozilla } su ducj i tiei dispositîfs dulà che tu jentris cu lis tôs credenziâls, scomençant di:
verify-subject = Complete la creazion dal to account
verify-action-2 = Conferme account
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Dopre { $code } par cambiâ il to account
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Chest codiç al scjât ca di { $expirationTime } minût.
       *[other] Chest codiç al scjât ca di { $expirationTime } minûts.
    }
verifyAccountChange-title = Stâstu modificant lis informazions dal to account?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Judinus a mantignî sigûr il to account aprovant cheste modifiche:
verifyAccountChange-prompt = Se sì, chest al è il to codiç di autorizazion:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Al scjât ca di { $expirationTime } minût.
       *[other] Al scjât ca di { $expirationTime } minûts.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Jeristu tu a jentrâ vie { $clientName }?
verifyLogin-description-2 = Judinus a mantignî sigûr il to account confermant che tu jeris tu a jentrâ cun:
verifyLogin-subject-2 = Conferme acès
verifyLogin-action = Conferme acès
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Dopre { $code } par jentrâ
verifyLoginCode-preview = Chest codiç al scjât ca di 5 minûts.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Jeristu tu a jentrâ vie { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Judinus a mantignî sigûr il to account aprovant che tu jeris tu a jentrâ cun:
verifyLoginCode-prompt-3 = Se sì, chest al è il to codiç di autorizazion:
verifyLoginCode-expiry-notice = Al scjât chi di 5 minûts.
verifyPrimary-title-2 = Conferme e-mail primarie
verifyPrimary-description = Une richieste di autorizazion par modificâ l'account e je stade inviade a chest dispositîf:
verifyPrimary-subject = Conferme la e-mail primarie
verifyPrimary-action-2 = Conferme la direzion e-mail
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Une volte confermade la richieste, al sarà pussibil modificâ, di chest dispositîf, lis impostazions dal account, come chê di zontâ une e-mail secondarie.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Dopre { $code } par confermâ la tô e-mail secondarie
verifySecondaryCode-preview = Chest codiç al scjât ca di 5 minûts.
verifySecondaryCode-title-2 = Conferme la e-mail secondarie
verifySecondaryCode-action-2 = Conferme la direzion e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Chest { -product-mozilla-account } al domande di doprâ { $email } come direzion e-mail secondarie:
verifySecondaryCode-prompt-2 = Dopre chest codiç di conferme:
verifySecondaryCode-expiry-notice-2 = Al scjât chi di 5 minûts. Une volte confermade, cheste direzion e-mail e ricevarà notifichis di sigurece e messaçs di conferme.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Dopre { $code } par confermâ il to account
verifyShortCode-preview-2 = Chest codiç al scjât ca di 5 minûts
verifyShortCode-title-3 = Esplore internet cun { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Conferme il to account e tire fûr il massim di { -brand-mozilla } su ducj i tiei dispositîfs dulà che tu jentris cu lis tôs credenziâls, scomençant di:
verifyShortCode-prompt-3 = Dopre chest codiç di conferme:
verifyShortCode-expiry-notice = Al scjât chi di 5 minûts.
