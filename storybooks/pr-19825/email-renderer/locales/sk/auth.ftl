## Non-email strings

session-verify-send-push-title-2 = Prihlasujete sa do { -product-mozilla-account(case: "gen", capitalization: "lower") }?
session-verify-send-push-body-2 = Kliknutím sem potvrďte, že ste to vy
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je váš overovací kód od { -brand-mozilla(case: "gen") }. Vyprší o 5 minút.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Overovací kód { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je váš kód na obnovenie od { -brand-mozilla(case: "gen") }. Vyprší o 5 minút.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kód { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je váš kód na obnovenie od { -brand-mozilla(case: "gen") }. Vyprší o 5 minút.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kód { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchronizovať zariadenia">
body-devices-image = <img data-l10n-name="devices-image" alt="Zariadenia">
fxa-privacy-url = Zásady ochrany osobných údajov { -brand-mozilla(case: "gen") }
moz-accounts-privacy-url-2 = Vyhlásenie o ochrane osobných údajov pre { -product-mozilla-accounts(case: "acc", capitalization: "uppercase") }
moz-accounts-terms-url = Podmienky používania služby { -product-mozilla-accounts(case: "acc", capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla(case: "gen") }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla(case: "gen") }">
subplat-automated-email = Toto je automaticky generovaná správa. Ak ste si ju nevyžiadali, môžete ju ignorovať.
subplat-privacy-notice = Vyhlásenie o ochrane osobných údajov
subplat-privacy-plaintext = Vyhlásenie o ochrane osobných údajov:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tento e‑mail ste dostali, pretože na adrese { $email } je registrovaný { -product-mozilla-account(capitalization: "lower") } a zároveň ste si zaregistrovali predplatné produktu { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tento e‑mail ste dostali, pretože na adrese { $email } je registrovaný { -product-mozilla-account(capitalization: "lower") }.
subplat-explainer-multiple-2 = Tento e‑mail ste dostali, pretože na adrese { $email } je registrovaný { -product-mozilla-account(capitalization: "lower") } a zároveň ste si zaregistrovali predplatné niekoľkých produktov.
subplat-explainer-was-deleted-2 = Tento e‑mail ste dostali, pretože na adrese { $email } je registrovaný { -product-mozilla-account(capitalization: "lower") }.
subplat-manage-account-2 = Spravujte svoje nastavenia { -product-mozilla-account(case: "gen", capitalization: "lower") } na <a data-l10n-name="subplat-account-page">stránke účtu</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Spravujte nastavenia { -product-mozilla-account(case: "gen", capitalization: "lower") } na stránke svojho účtu: { $accountSettingsUrl }
subplat-terms-policy = Podmienky používania a zrušenia
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Zrušiť predplatné
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Opätovne aktivovať predplatné
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Aktualizovať informácie o spôsobe platby
subplat-privacy-policy = Zásady ochrany osobných údajov { -brand-mozilla(case: "gen") }
subplat-privacy-policy-2 = Vyhlásenie o ochrane osobných údajov pre { -product-mozilla-accounts(case: "acc", capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Podmienky používania služby { -product-mozilla-accounts(case: "acc", capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Právne informácie
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Súkromie
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Ak je váš účet odstránený, budete naďalej dostávať e‑maily od spoločností Mozilla Corporation a Mozilla Foundation, pokiaľ <a data-l10n-name="unsubscribeLink">nepožiadate o zrušenie ich odberu</a>.
account-deletion-info-block-support = Ak máte nejaké otázky alebo potrebujete pomoc, neváhajte kontaktovať náš <a data-l10n-name="supportLink">tím podpory</a>.
account-deletion-info-block-communications-plaintext = Ak je váš účet odstránený, budete naďalej dostávať e‑maily od spoločností Mozilla Corporation a Mozilla Foundation, pokiaľ nepožiadate o zrušenie ich odberu:
account-deletion-info-block-support-plaintext = Ak máte akékoľvek otázky alebo potrebujete pomoc, neváhajte kontaktovať náš tím podpory:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Stiahnuť { $productName } z { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Stiahnuť { $productName } z { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Nainštalujte si { $productName } na <a data-l10n-name="anotherDeviceLink">ďalší stolný počítač</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Nainštalujte si { $productName } na <a data-l10n-name="anotherDeviceLink">ďalšie zariadenie</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Získajte { $productName } v službe Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Stiahnite si { $productName } z App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Nainštalujte { $productName } na iné zariadenie:
automated-email-change-2 = Ak ste túto akciu neurobili, ihneď si <a data-l10n-name="passwordChangeLink">zmeňte heslo</a>.
automated-email-support = Ďalšie informácie nájdete na stránkach <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ak ste túto akciu neurobili, okamžite si zmeňte heslo:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Ďalšie informácie nájdete na stránkach Podpory { -brand-mozilla(case: "gen") }.
automated-email-inactive-account = Toto je automatický e‑mail. Dostávate ho, pretože máte { -product-mozilla-account(capitalization: "lower") } a od vášho posledného prihlásenia uplynuli 2 roky.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Ďalšie informácie nájdete na stránkach <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
automated-email-no-action-plaintext = Toto je automaticky generovaná správa. Ak ste ju dostali omylom, nemusíte robiť nič.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Toto je automaticky generovaná správa. Ak ste túto akciu nevykonali, zmeňte si svoje heslo:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Táto žiadosť prišla z prehliadača { $uaBrowser } na { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Táto žiadosť prišla z prehliadača { $uaBrowser } na { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Táto žiadosť prišla z prehliadača { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Táto žiadosť prišla zo systému { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Táto žiadosť prišla zo systému { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ak ste to neboli vy, <a data-l10n-name="revokeAccountRecoveryLink">odstráňte nový kľúč</a> a <a data-l10n-name="passwordChangeLink">zmeňte si heslo</a>.
automatedEmailRecoveryKey-change-pwd-only = Ak ste to neboli vy, <a data-l10n-name="passwordChangeLink">zmeňte si heslo</a>.
automatedEmailRecoveryKey-more-info = Ďalšie informácie nájdete na stránkach <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Táto žiadosť prišla z:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ak ste to neboli vy, odstráňte nový kľúč:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ak ste to neboli vy, zmeňte si heslo:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = a zmeňte si heslo:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Ďalšie informácie nájdete na stránkach Podpory { -brand-mozilla(case: "gen") }.
automated-email-reset =
    Toto je automaticky generovaná správa. Ak ste túto akciu nevykonali, <a data-l10n-name="resetLink">zmeňte si svoje heslo</a>.
    Ďalšie informácie nájdete na stránkach <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ak ste túto akciu nepovolili, urýchlene si zmeňte svoje heslo na stránke { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Ak ste túto akciu nevykonali, ihneď si <a data-l10n-name="resetLink">zmeňte heslo</a> a <a data-l10n-name="twoFactorSettingsLink">dvojstupňové overenie</a>.
    Ďalšie informácie nájdete na stránkach <a data-l10n-name="supportLink"> Podpory { -brand-mozilla(case: "gen") }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ak ste túto akciu nevykonali, ihneď si zmeňte heslo na adrese:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Taktiež obnovte dvojstupňové overenie na adrese:
brand-banner-message = Vedeli ste, že sme zmenili názov z { -product-firefox-accounts(case: "gen") } na { -product-mozilla-accounts(case: "acc") }? <a data-l10n-name="learnMore">Ďalšie informácie</a>
cancellationSurvey = Vyplňte, prosím, tento <a data-l10n-name="cancellationSurveyUrl">krátky prieskum</a> a pomôžte nám zlepšiť naše služby.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Vyplňte, prosím, tento krátky formulár a pomôžte nám zlepšiť naše služby:
change-password-plaintext = Ak máte podozrenie, že sa niekto pokúša neoprávnene získať prístup k vášmu účtu, zmeňte si svoje heslo.
manage-account = Spravovať účet
manage-account-plaintext = { manage-account }:
payment-details = Platobné údaje:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Číslo faktúry: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Účtované: { $invoiceTotal } dňa { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Ďalšia faktúra: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Spôsob platby:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Spôsob platby: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Spôsob platby: { $cardName } končiaca na { $lastFour }
payment-provider-card-ending-in-plaintext = Spôsob platby: Karta končiaca na { $lastFour }
payment-provider-card-ending-in = <b>Spôsob platby:</b> Karta končiaca na { $lastFour }
payment-provider-card-ending-in-card-name = <b>Spôsob platby:</b> { $cardName } končiaca na { $lastFour }
subscription-charges-invoice-summary = Súhrn faktúry

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Číslo faktúry:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Číslo faktúry: { $invoiceNumber }
subscription-charges-invoice-date = <b>Dátum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Dátum: { $invoiceDateOnly }
subscription-charges-prorated-price = Pomerná cena
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Pomerná cena: { $remainingAmountTotal }
subscription-charges-list-price = Katalógová cena
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Katalógová cena: { $offeringPrice }
subscription-charges-credit-from-unused-time = Kredit z nevyužitého času
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kredit z nevyužitého času: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Medzisúčet</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Medzisúčet: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Jednorazová zľava
subscription-charges-one-time-discount-plaintext = Jednorazová zľava: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-mesačná zľava
        [few] { $discountDuration }-mesačná zľava
        [many] { $discountDuration }-mesačná zľava
       *[other] { $discountDuration }-mesačná zľava
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-mesačná zľava: { $invoiceDiscountAmount }
        [few] { $discountDuration }-mesačná zľava: { $invoiceDiscountAmount }
        [many] { $discountDuration }-mesačná zľava: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-mesačná zľava: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Zľava
subscription-charges-discount-plaintext = Zľava: { $invoiceDiscountAmount }
subscription-charges-taxes = Dane a poplatky
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Dane a poplatky: { $invoiceTaxAmount }
subscription-charges-total = <b>Celkom</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Celkom: { $invoiceTotal }
subscription-charges-credit-applied = Použitý kredit
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Použitý kredit: { $creditApplied }
subscription-charges-amount-paid = <b>Zaplatená suma</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Zaplatená suma: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Na váš účet bol pripísaný kredit vo výške { $creditReceived }, ktorý bude použitý na vaše budúce faktúry.

##

subscriptionSupport = Máte otázky týkajúce sa vášho predplatného? Náš <a data-l10n-name="subscriptionSupportUrl">tím podpory</a> je tu, aby vám pomohol.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Máte otázky týkajúce sa vášho predplatného? Náš tím podpory je tu, aby vám pomohol:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Ďakujeme, že ste si predplatili { $productName }. Ak máte akékoľvek otázky týkajúce sa predplatného alebo potrebujete ďalšie informácie o produkte { $productName }, <a data-l10n-name="subscriptionSupportUrl">kontaktujte nás</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Ďakujeme, že ste si predplatili { $productName }. Ak máte akékoľvek otázky týkajúce sa predplatného alebo potrebujete ďalšie informácie o produkte { $productName }, kontaktujte nás:
subscription-support-get-help = Získajte pomoc s predplatným
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Spravovať predplatné</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Spravujte svoje predplatné:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontaktovať podporu</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontaktujte podporu:
subscriptionUpdateBillingEnsure = Ak sa chcete uistiť, že váš spôsob platby a informácie o účte sú aktuálne, môžete tak urobiť <a data-l10n-name="updateBillingUrl">tu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ak sa chcete uistiť, že váš spôsob platby a informácie o účte sú aktuálne, môžete tak urobiť tu:
subscriptionUpdateBillingTry = Vašu platbu skúsime znova v priebehu niekoľkých dní, no možno nám budete musieť pomôcť <a data-l10n-name="updateBillingUrl">aktualizáciou svojich platobných údajov</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vašu platbu skúsime znova v priebehu niekoľkých dní, no možno nám budete musieť pomôcť aktualizáciou svojich platobných údajov:
subscriptionUpdatePayment = Ak chcete zabrániť prerušeniu vašej služby, čo najskôr <a data-l10n-name="updateBillingUrl">aktualizujte svoje platobné údaje</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Ak chcete zabrániť prerušeniu vašej služby, čo najskôr aktualizujte svoje platobné údaje:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Ďalšie informácie nájdete na stránkach <a data-l10n-name="supportLink">Podpory { -brand-mozilla(case: "gen") }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Ďalšie informácie nájdete na stránkach Podpory { -brand-mozilla(case: "gen") } { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } na { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } na { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (odhad)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (odhad)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (odhad)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (odhad)
view-invoice-link-action = Zobraziť faktúru
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Zobraziť faktúru: { $invoiceLink }
cadReminderFirst-subject-1 = Pripomienka! Poďme synchronizovať { -brand-firefox }
cadReminderFirst-action = Synchronizovať ďalšie zariadenie
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Na synchronizáciu sú potrební dvaja
cadReminderFirst-description-v2 = Vezmite svoje karty do všetkých svojich zariadení. Získajte svoje záložky, heslá a ďalšie údaje všade, kde používate prehliadač { -brand-firefox }.
cadReminderSecond-subject-2 = Nič nepremeškajte! Poďme dokončiť nastavenie synchronizácie
cadReminderSecond-action = Synchronizovať ďalšie zariadenie
cadReminderSecond-title-2 = Nezabudnite na synchronizáciu!
cadReminderSecond-description-sync = Synchronizujte svoje záložky, heslá, otvorené karty a ďalšie — všade, kde používate prehliadač { -brand-firefox }.
cadReminderSecond-description-plus = Navyše, vaše dáta sú vždy šifrované. Vidíte ich iba vy a zariadenia, ktoré schválite.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Víta vás { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Víta vás { $productName }
downloadSubscription-content-2 = Poďme sa pozrieť ako používať všetky funkcie zahrnuté vo vašom predplatnom:
downloadSubscription-link-action-2 = Začíname
fraudulentAccountDeletion-subject-2 = Váš { -product-mozilla-account(capitalization: "lower") } bol odstránený
fraudulentAccountDeletion-title = Váš účet bol odstránený
fraudulentAccountDeletion-content-part1-v2 = Nedávno bol vytvorený { -product-mozilla-account(capitalization: "lower") } a pomocou tejto e‑mailovej adresy bolo účtované predplatné. Rovnako ako pri všetkých nových účtoch sme vás požiadali, aby ste potvrdili svoj účet overením tejto e‑mailovej adresy.
fraudulentAccountDeletion-content-part2-v2 = V súčasnosti vidíme, že účet nebol nikdy potvrdený. Keďže tento krok nebol dokončený, nie sme si istí, či išlo o autorizované predplatné. V dôsledku toho bol { -product-mozilla-account(capitalization: "lower") } zaregistrovaný na túto e‑mailovú adresu odstránený a vaše predplatné bolo zrušené a všetky poplatky boli vrátené.
fraudulentAccountDeletion-contact = Ak máte nejaké otázky, kontaktujte náš <a data-l10n-name="mozillaSupportUrl">tím podpory</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ak máte nejaké otázky, kontaktujte náš tím podpory: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Posledná šanca ponechať si svoj { -product-mozilla-account(capitalization: "lower") }
inactiveAccountFinalWarning-title = Váš účet { -brand-mozilla } a údaje budú vymazané
inactiveAccountFinalWarning-preview = Ak si chcete ponechať svoj účet, prihláste sa
inactiveAccountFinalWarning-account-description = Váš { -product-mozilla-account(capitalization: "lower") } sa používa na prístup k bezplatným produktom na ochranu súkromia a prehliadanie webu, ako sú synchronizácia v prehliadači { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Pokiaľ sa neprihlásite, dňa <strong>{ $deletionDate }</strong> bude váš účet a vaše osobné údaje natrvalo odstránené.
inactiveAccountFinalWarning-action = Ak si chcete ponechať svoj účet, prihláste sa
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Ak si chcete ponechať svoj účet, prihláste sa:
inactiveAccountFirstWarning-subject = Nestraťte svoj účet
inactiveAccountFirstWarning-title = Chcete si ponechať svoj účet { -brand-mozilla } a údaje?
inactiveAccountFirstWarning-account-description-v2 = Váš { -product-mozilla-account(capitalization: "lower") } sa používa na prístup k bezplatným produktom na ochranu súkromia a prehliadanie webu, ako sú synchronizácia v prehliadači { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Všimli sme si, že ste sa neprihlásili 2 roky.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Váš účet a vaše osobné údaje budú natrvalo odstránené dňa <strong>{ $deletionDate }</strong>, pretože ste neboli aktívni.
inactiveAccountFirstWarning-action = Ak si chcete ponechať svoj účet, prihláste sa
inactiveAccountFirstWarning-preview = Ak si chcete ponechať svoj účet, prihláste sa
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Ak si chcete ponechať svoj účet, prihláste sa:
inactiveAccountSecondWarning-subject = Vyžaduje sa akcia: účet sa odstráni o 7 dní
inactiveAccountSecondWarning-title = Váš účet { -brand-mozilla } a údaje budú vymazané o 7 dní
inactiveAccountSecondWarning-account-description-v2 = Váš { -product-mozilla-account } sa používa na prístup k bezplatným produktom na ochranu súkromia a prehliadanie webu, ako sú synchronizácia v prehliadači { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } a { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Pretože ste neboli aktívni, váš účet a vaše osobné údaje budú natrvalo odstránené dňa <strong>{ $deletionDate }</strong>.
inactiveAccountSecondWarning-action = Ak si chcete ponechať svoj účet, prihláste sa
inactiveAccountSecondWarning-preview = Ak si chcete ponechať svoj účet, prihláste sa
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Ak si chcete ponechať svoj účet, prihláste sa:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Minuli sa vám záložné overovacie kódy!
codes-reminder-title-one = Používate posledný záložný overovací kód
codes-reminder-title-two = Je čas vytvoriť ďalšie záložné overovacie kódy
codes-reminder-description-part-one = Záložné overovacie kódy vám pomôžu obnoviť vaše informácie, keď zabudnete heslo.
codes-reminder-description-part-two = Vytvorte si nové kódy hneď, aby ste neskôr nestratili svoje údaje.
codes-reminder-description-two-left = Zostávajú vám už len dva kódy.
codes-reminder-description-create-codes = Vytvorte si nové záložné overovacie kódy, ktoré vám pomôžu dostať sa späť do účtu, ak sa z neho vymknete.
lowRecoveryCodes-action-2 = Vytvoriť kódy
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nezostávajú žiadne záložné overovacie kódy
        [one] Zostáva iba { $numberRemaining } záložný overovací kód
        [few] Zostávajú iba { $numberRemaining } záložné overovacie kódy
       *[other] Zostáva iba { $numberRemaining } záložných overovacích kódov
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nové prihlásenie - { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nové prihlásenie do vášho { -product-mozilla-account(case: "gen", capitalization: "lower") }
newDeviceLogin-title-3 = Na prihlásenie bol použitý váš { -product-mozilla-account(capitalization: "lower") }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Neboli ste to vy? <a data-l10n-name="passwordChangeLink">Zmeňte si heslo</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Neboli ste to vy? Zmeňte si heslo:
newDeviceLogin-action = Spravovať účet
passwordChanged-subject = Heslo bolo aktualizované
passwordChanged-title = Heslo bolo úspešne zmenené
passwordChanged-description-2 = Heslo k vášmu { -product-mozilla-account(case: "dat", capitalization: "lower") } bolo úspešne zmenené z nasledovného zariadenia:
passwordChangeRequired-subject = Bola zistená podozrivá aktivita
passwordChangeRequired-preview = Okamžite si zmeňte heslo
passwordChangeRequired-title-2 = Zmeňte si heslo
passwordChangeRequired-suspicious-activity-3 = Váš účet sme zablokovali, aby sme ho ochránili pred podozrivou aktivitou. Boli ste odhlásený zo všetkých zariadení a všetky synchronizované údaje boli preventívne vymazané.
passwordChangeRequired-sign-in-3 = Ak sa chcete znova prihlásiť do svojho účtu, stačí si zmeniť heslo.
passwordChangeRequired-different-password-2 = <b>Dôležité:</b> zvoľte si silné heslo, ktoré sa líši od hesla, ktoré ste používali v minulosti.
passwordChangeRequired-different-password-plaintext-2 = Dôležité: zvoľte si silné heslo, ktoré sa líši od hesla, ktoré ste používali v minulosti.
passwordChangeRequired-action = Zmeniť heslo
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Na zmenu hesla použite kód { $code }
password-forgot-otp-preview = Platnosť tohto kódu vyprší o 10 minút
password-forgot-otp-title = Zabudli ste heslo?
password-forgot-otp-request = Dostali sme žiadosť o zmenu hesla k vášmu { -product-mozilla-account(capitalization: "lower", case: "dat") } z:
password-forgot-otp-code-2 = Ak ste to boli vy, tu je váš potvrdzovací kód, aby ste mohli pokračovať:
password-forgot-otp-expiry-notice = Platnosť tohto kódu vyprší o 10 minút.
passwordReset-subject-2 = Vaše heslo bolo zmenené
passwordReset-title-2 = Vaše heslo bolo zmenené
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Heslo k { -product-mozilla-account(case: "dat", capitalization: "lower") } ste zmenili na zariadení:
passwordResetAccountRecovery-subject-2 = Vaše heslo bolo zmenené
passwordResetAccountRecovery-title-3 = Vaše heslo bolo zmenené
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Použili ste kľúč na obnovenie účtu na zmenu hesla { -product-mozilla-account(case: "dat", capitalization: "lower") } na zariadení:
passwordResetAccountRecovery-information = Odhlásili sme vás zo všetkých vašich synchronizovaných zariadení. Vytvorili sme nový kľúč na obnovenie účtu, ktorý nahradí ten, ktorý ste používali. Môžete ho zmeniť v nastaveniach účtu.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Odhlásili sme vás zo všetkých vašich synchronizovaných zariadení. Vytvorili sme nový kľúč na obnovenie účtu, ktorý nahradí ten, ktorý ste používali. Môžete ho zmeniť v nastaveniach účtu:
passwordResetAccountRecovery-action-4 = Spravovať účet
passwordResetRecoveryPhone-subject = Bolo použité obnovenie pomocou telefónu
passwordResetRecoveryPhone-preview = Skontrolujte, či ste to boli vy
passwordResetRecoveryPhone-title = Obnovenie pomocou telefónu bolo použité na potvrdenie zmeny hesla
passwordResetRecoveryPhone-device = Obnovenie pomocou telefónu bolo použité na zariadení:
passwordResetRecoveryPhone-action = Spravovať účet
passwordResetWithRecoveryKeyPrompt-subject = Vaše heslo bolo zmenené
passwordResetWithRecoveryKeyPrompt-title = Vaše heslo bolo zmenené
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Heslo k { -product-mozilla-account(case: "dat", capitalization: "lower") } ste zmenili na zariadení:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Vytvoriť kľúč na obnovenie účtu
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Vytvoriť kľúč na obnovenie účtu:
passwordResetWithRecoveryKeyPrompt-cta-description = Na všetkých synchronizovaných zariadeniach sa budete musieť znova prihlásiť. Uchovajte svoje údaje nabudúce v bezpečí pomocou kľúča na obnovenie účtu. To vám umožní obnoviť vaše údaje, ak zabudnete heslo.
postAddAccountRecovery-subject-3 = Bol vytvorený nový kľúč na obnovenie účtu
postAddAccountRecovery-title2 = Vytvorili ste nový kľúč na obnovenie účtu
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Uložte si tento kľúč na bezpečné miesto – budete ho potrebovať na obnovenie zašifrovaných údajov prehliadania, ak zabudnete heslo.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Tento kľúč je možné použiť iba raz. Keď ho použijete, automaticky vám vytvoríme nový. Alebo si môžete kedykoľvek vytvoriť nový v nastaveniach účtu.
postAddAccountRecovery-action = Spravovať účet
postAddLinkedAccount-subject-2 = Nový účet prepojený s vaším { -product-mozilla-account(case: "ins", capitalization: "lower") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Váš účet { $providerName } bol prepojený s vaším { -product-mozilla-account(case: "ins", capitalization: "lower") }
postAddLinkedAccount-action = Spravovať účet
postAddRecoveryPhone-subject = Obnovenie pomocou telefónu bolo pridané
postAddRecoveryPhone-preview = Účet chránený dvojstupňovou autentifikáciou
postAddRecoveryPhone-title-v2 = Pridali ste telefónne číslo na obnovenie účtu
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Ako telefónne číslo na obnovenie účtu ste pridali { $maskedLastFourPhoneNumber }
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Ako to chráni váš účet
postAddRecoveryPhone-how-protect-plaintext = Ako to chráni váš účet:
postAddRecoveryPhone-enabled-device = Povolili ste to z:
postAddRecoveryPhone-action = Spravovať účet
postAddTwoStepAuthentication-preview = Váš účet je chránený
postAddTwoStepAuthentication-subject-v3 = Dvojstupňové overenie je zapnuté
postAddTwoStepAuthentication-title-2 = Zapli ste dvojstupňové overenie
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Požiadali ste o to z:
postAddTwoStepAuthentication-action = Spravovať účet
postAddTwoStepAuthentication-code-required-v4 = Pri každom prihlásení sa teraz vyžadujú bezpečnostné kódy z vašej overovacej aplikácie.
postAddTwoStepAuthentication-recovery-method-codes = Ako metódu obnovenia ste tiež pridali záložné overovacie kódy.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Taktiež ste pridali { $maskedPhoneNumber } ako svoje telefónne číslo na obnovenie účtu.
postAddTwoStepAuthentication-how-protects-link = Ako to chráni váš účet
postAddTwoStepAuthentication-how-protects-plaintext = Ako to chráni váš účet:
postAddTwoStepAuthentication-device-sign-out-message = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou dvojstupňového overenia.
postChangeAccountRecovery-subject = Kľúč na obnovenie účtu bol zmenený
postChangeAccountRecovery-title = Zmenili ste kľúč na obnovenie účtu
postChangeAccountRecovery-body-part1 = Teraz máte nový kľúč na obnovenie účtu. Váš predchádzajúci kľúč bol odstránený.
postChangeAccountRecovery-body-part2 = Uložte si tento nový kľúč na bezpečné miesto – budete ho potrebovať na obnovenie zašifrovaných údajov prehliadania, ak zabudnete heslo.
postChangeAccountRecovery-action = Spravovať účet
postChangePrimary-subject = Hlavná e‑mailová adresa bola aktualizovaná
postChangePrimary-title = Nová hlavná e‑mailová adresa
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Úspešne ste zmenili svoju hlavnú e‑mailovú adresu na { $email }. Táto adresa bude odteraz slúžiť ako vaše prihlasovacie meno k { -product-mozilla-account(case: "dat", capitalization: "lower") } a na zasielanie bezpečnostných upozornení a potvrdení.
postChangePrimary-action = Spravovať účet
postChangeRecoveryPhone-subject = Obnovenie pomocou telefónu bolo aktualizované
postChangeRecoveryPhone-preview = Účet chránený dvojstupňovou autentifikáciou
postChangeRecoveryPhone-title = Zmenili ste si telefón na obnovenie účtu
postChangeRecoveryPhone-description = Teraz máte nové telefónne číslo na obnovenie účtu. Vaše predchádzajúce telefónne číslo bolo odstránené.
postChangeRecoveryPhone-requested-device = Požiadali ste o to z:
postChangeTwoStepAuthentication-preview = Váš účet je chránený
postChangeTwoStepAuthentication-subject = Dvojstupňové overenie aktualizované
postChangeTwoStepAuthentication-title = Dvojstupňové overenie bolo aktualizované
postChangeTwoStepAuthentication-use-new-account = Teraz musíte vo svojej overovacej aplikácii použiť nový záznam pre { -product-mozilla-account(case: "acc") }. Starší záznam už nebude fungovať a môžete ho odstrániť.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Požiadali ste o to z:
postChangeTwoStepAuthentication-action = Spravovať účet
postChangeTwoStepAuthentication-how-protects-link = Ako to chráni váš účet
postChangeTwoStepAuthentication-how-protects-plaintext = Ako to chráni váš účet:
postChangeTwoStepAuthentication-device-sign-out-message = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou nového dvojstupňového overenia.
postConsumeRecoveryCode-title-3 = Váš záložný overovací kód bol použitý na potvrdenie zmeny hesla
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kód bol použítý na zariadení:
postConsumeRecoveryCode-action = Spravovať účet
postConsumeRecoveryCode-subject-v3 = Bol použitý záložný overovací kód
postConsumeRecoveryCode-preview = Skontrolujte, či ste to boli vy
postNewRecoveryCodes-subject-2 = Boli vytvorené nové záložné overovacie kódy
postNewRecoveryCodes-title-2 = Vytvorili ste nové záložné overovacie kódy
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Boli vytvorené na zariadení:
postNewRecoveryCodes-action = Spravovať účet
postRemoveAccountRecovery-subject-2 = Kľúč na obnovenie účtu bol odstránený
postRemoveAccountRecovery-title-3 = Odstránili ste kľúč na obnovenie účtu
postRemoveAccountRecovery-body-part1 = Ak zabudnete heslo, na obnovenie zašifrovaných údajov prehliadania sa vyžaduje kľúč na obnovenie účtu.
postRemoveAccountRecovery-body-part2 = Ak ste tak ešte neurobili, vytvorte si v nastaveniach účtu nový kľúč na obnovenie účtu, aby ste predišli strate uložených hesiel, záložiek, histórie prehliadania atď.
postRemoveAccountRecovery-action = Spravovať účet
postRemoveRecoveryPhone-subject = Obnovenie pomocou telefónu bolo zrušené
postRemoveRecoveryPhone-preview = Účet chránený dvojstupňovou autentifikáciou
postRemoveRecoveryPhone-title = Obnovenie pomocou telefónu bolo zrušené
postRemoveRecoveryPhone-description-v2 = Telefón na obnovenie účtu bol odstránený z nastavení dvojstupňového overenia.
postRemoveRecoveryPhone-description-extra = Ak nemôžete použiť overovaciu aplikáciu, na prihlásenie môžete použiť svoje záložné overovacie kódy.
postRemoveRecoveryPhone-requested-device = Požiadali ste o to z:
postRemoveSecondary-subject = Alternatívna e‑mailová adresa bola odstránená
postRemoveSecondary-title = Alternatívna e‑mailová adresa bola odstránená
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Úspešne ste odstránili { $secondaryEmail } ako alternatívnu e‑mailovú adresu z vášho { -product-mozilla-account(case: "gen", capitalization: "lower") }. Bezpečnostné upozornenia a potvrdenia prihlásenia už nebudú odosielané na túto adresu.
postRemoveSecondary-action = Spravovať účet
postRemoveTwoStepAuthentication-subject-line-2 = Dvojstupňové overenie je vypnuté
postRemoveTwoStepAuthentication-title-2 = Vypli ste dvojstupňové overenie
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Zakázali ste ju z:
postRemoveTwoStepAuthentication-action = Spravovať účet
postRemoveTwoStepAuthentication-not-required-2 = Pri prihlasovaní už nepotrebujete bezpečnostné kódy z overovacej aplikácie.
postSigninRecoveryCode-subject = Na prihlásenie bol použitý záložný overovací kód
postSigninRecoveryCode-preview = Potvrďte aktivitu účtu
postSigninRecoveryCode-title = Na prihlásenie bol použitý váš záložný overovací kód
postSigninRecoveryCode-description = Ak ste tak neurobili, mali by ste si okamžite zmeniť heslo, aby bol váš účet v bezpečí.
postSigninRecoveryCode-device = Prihlásili ste sa z:
postSigninRecoveryCode-action = Spravovať účet
postSigninRecoveryPhone-subject = Na prihlásenie bol použitý telefón na obnovenie účtu
postSigninRecoveryPhone-preview = Potvrďte aktivitu účtu
postSigninRecoveryPhone-title = Na prihlásenie bol použitý váš telefón na obnovenie účtu
postSigninRecoveryPhone-description = Ak ste tak neurobili, mali by ste si okamžite zmeniť heslo, aby bol váš účet v bezpečí.
postSigninRecoveryPhone-device = Prihlásili ste sa z:
postSigninRecoveryPhone-action = Spravovať účet
postVerify-sub-title-3 = Sme radi, že vás vidíme!
postVerify-title-2 = Chcete vidieť rovnakú kartu na dvoch zariadeniach?
postVerify-description-2 = Je to jednoduché! Stačí si nainštalovať { -brand-firefox } na iné zariadenie a prihlásiť sa k synchronizácii. Je to ako kúzlo!
postVerify-sub-description = (Psst… Znamená to tiež, že svoje záložky, heslá a ďalšie údaje z { -brand-firefox(case: "gen") } môžete získať všade, kde ste prihlásení.)
postVerify-subject-4 = Víta vás { -brand-mozilla }!
postVerify-setup-2 = Pripojiť ďalšie zariadenie:
postVerify-action-2 = Pripojiť ďalšie zariadenie
postVerifySecondary-subject = Alternatívna e‑mailová adresa bola pridaná
postVerifySecondary-title = Alternatívna e‑mailová adresa bola pridaná
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Úspešne ste potvrdili adresu { $secondaryEmail } ako alternatívnu e‑mailovú adresu pre váš { -product-mozilla-account(case: "acc", capitalization: "lower") }. Bezpečnostné upozornenia a potvrdenia prihlásenia budú odteraz odosielané na obe adresy.
postVerifySecondary-action = Spravovať účet
recovery-subject = Zmena hesla
recovery-title-2 = Zabudli ste heslo?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Dostali sme žiadosť o zmenu hesla k vášmu { -product-mozilla-account(capitalization: "lower", case: "dat") } z:
recovery-new-password-button = Vytvorte si nové heslo kliknutím na tlačidlo nižšie. Platnosť tohto odkazu vyprší v priebehu nasledujúcej hodiny.
recovery-copy-paste = Vytvorte si nové heslo tak, že skopírujete a prilepíte adresu URL uvedenú nižšie do svojho prehliadača. Platnosť tohto odkazu vyprší v priebehu nasledujúcej hodiny.
recovery-action = Vytvoriť nové heslo
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Vaše predplatné produktu { $productName } bolo zrušené
subscriptionAccountDeletion-title = Mrzí nás, že odchádzate
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Nedávno ste odstránili svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }. V dôsledku toho sme zrušili vaše predplatné produktu { $productName }. Vaša posledná platba vo výške { $invoiceTotal } bola zaplatená dňa { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Víta vás { $productName }: nastavte si heslo.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Víta vás { $productName }
subscriptionAccountFinishSetup-content-processing = Vaša platba sa spracováva a jej dokončenie môže trvať až štyri pracovné dni. Vaše predplatné sa automaticky obnoví každé fakturačné obdobie, pokiaľ sa nerozhodnete ho zrušiť.
subscriptionAccountFinishSetup-content-create-3 = Potom si vytvoríte heslo pre { -product-mozilla-account(case: "acc", capitalization: "lower") }, aby ste mohli začať používať svoje nové predplatné.
subscriptionAccountFinishSetup-action-2 = Začíname
subscriptionAccountReminderFirst-subject = Pripomienka: dokončite nastavenie účtu
subscriptionAccountReminderFirst-title = Zatiaľ nemáte prístup k svojmu predplatnému
subscriptionAccountReminderFirst-content-info-3 = Pred niekoľkými dňami ste si vytvorili { -product-mozilla-account(case: "acc", capitalization: "lower") }, no doteraz ste ho nepotvrdili. Dúfame, že dokončíte nastavenie svojho účtu, aby ste mohli používať svoje nové predplatné.
subscriptionAccountReminderFirst-content-select-2 = Ak chcete nastaviť nové heslo a dokončiť potvrdenie účtu, kliknite na tlačidlo “Vytvoriť heslo”.
subscriptionAccountReminderFirst-action = Vytvoriť heslo
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Posledná pripomienka: nastavte si účet
subscriptionAccountReminderSecond-title-2 = Víta vás { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Pred niekoľkými dňami ste si vytvorili { -product-mozilla-account(case: "acc", capitalization: "lower") }, no doteraz ste ho nepotvrdili. Dúfame, že dokončíte nastavenie svojho účtu, aby ste mohli používať svoje nové predplatné.
subscriptionAccountReminderSecond-content-select-2 = Ak chcete nastaviť nové heslo a dokončiť potvrdenie účtu, kliknite na tlačidlo “Vytvoriť heslo”.
subscriptionAccountReminderSecond-action = Vytvoriť heslo
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Vaše predplatné produktu { $productName } bolo zrušené
subscriptionCancellation-title = Mrzí nás, že odchádzate

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Zrušili sme vaše predplatné produktu { $productName }. Vaša posledná platba vo výške { $invoiceTotal } bola zaplatená dňa { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Zrušili sme vaše predplatné produktu { $productName }. Vaša posledná platba vo výške { $invoiceTotal } bude zaplatená dňa { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Služba bude dostupná až do konca vášho aktuálneho fakturačného obdobia, čo je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Úspešne ste prešli na produkt { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Úspešne ste prešli z { $productNameOld } na { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Počnúc ďalšou faktúrou sa váš poplatok zmení z { $paymentAmountOld } za { $productPaymentCycleOld } na { $paymentAmountNew } za { $productPaymentCycleNew }. V tom čase vám bude účtovaný aj jednorazový poplatok { $paymentProrated }, ktorý odráža vyšší poplatok za tento { $productPaymentCycleOld } (pomerná časť).
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ak je k dispozícii nový softvér potrebný na to, aby ste mohli používať { $productName }, dostanete samostatný e‑mail s pokynmi na stiahnutie.
subscriptionDowngrade-content-auto-renew = Vaše predplatné sa bude automaticky obnovovať každé fakturačné obdobie až dokým ho nezrušíte.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Vaše predplatné produktu { $productName } bolo zrušené
subscriptionFailedPaymentsCancellation-title = Vaše predplatné bolo zrušené
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Zrušili sme vaše predplatné produktu { $productName }, pretože zlyhali viaceré pokusy o platbu. Ak chcete znova získať prístup, začnite nové predplatné s aktualizovaným spôsobom platby.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Platba za { $productName } bola potvrdená
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Ďakujeme, že ste si predplatili { $productName }
subscriptionFirstInvoice-content-processing = Vaša platba sa momentálne spracováva a jej dokončenie môže trvať až štyri pracovné dni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Dostanete samostatný e‑mail o tom, ako začať používať { $productName }.
subscriptionFirstInvoice-content-auto-renew = Vaše predplatné sa bude automaticky obnovovať každé fakturačné obdobie až dokým ho nezrušíte.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Vaša ďalšia faktúra bude vystavená dňa { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Platnosť spôsobu platby pre { $productName } vypršala alebo čoskoro vyprší
subscriptionPaymentExpired-title-2 = Platnosť vášho spôsobu platby vypršala alebo čoskoro vyprší
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Platnosť spôsobu platby, ktorý používate na platby za { $productName }, vypršala alebo čoskoro vyprší.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Platba za { $productName } zlyhala
subscriptionPaymentFailed-title = Ľutujeme, máme problém s vašou platbou
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Vyskytol sa problém s vašou poslednou platbou za { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Je možné, že platnosť vášho spôsobu platby vypršala alebo je váš aktuálny spôsob platby zastaraný.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Vyžaduje sa aktualizácia platobných údajov pre produkt { $productName }
subscriptionPaymentProviderCancelled-title = Ospravedlňujeme sa, máme problém so zvoleným spôsobom platby
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Zistili sme problém s vaším spôsobom platby za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Je možné, že platnosť vášho spôsobu platby vypršala alebo je váš aktuálny spôsob platby zastaraný.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Predplatné pre { $productName } bolo znova aktivované
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Ďakujeme za opätovnú aktiváciu predplatného produktu { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Váš fakturačný cyklus a platba zostanú rovnaké. Vaša ďalšia platba bude v sume { $invoiceTotal }  konaná dňa { $nextInvoiceDateOnly }. Vaše predplatné sa automaticky obnoví každé fakturačné obdobie, pokiaľ ho nezrušíte.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Upozornenie na automatické obnovenie produktu { $productName }
subscriptionRenewalReminder-title = Vaše predplatné bude čoskoro obnovené
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Vážený zákazník produktu { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Vaše aktuálne predplatné je nastavené na automatické obnovenie o { $reminderLength } dní. V tom čase vám { -brand-mozilla } obnoví predplatné { $planIntervalCount } { $planInterval } a bude účtovať poplatok { $invoiceTotal } pomocou zvoleného spôsobu platby.
subscriptionRenewalReminder-content-closing = S pozdravom,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Tím { $productName }
subscriptionReplaced-subject = Vaše predplatné bolo aktualizované ako súčasť vašej inovácie
subscriptionReplaced-title = Vaše predplatné bolo aktualizované
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Vaše individuálne predplatné pre { $productName } bolo nahradené a teraz je zahrnuté vo vašom novom balíku.
subscriptionReplaced-content-credit = Za akýkoľvek nevyužitý čas z predchádzajúceho predplatného dostanete kredit. Tento kredit bude automaticky pripísaný na váš účet a použitý na budúce poplatky.
subscriptionReplaced-content-no-action = Z vašej strany nie je potrebná žiadna akcia.
subscriptionsPaymentExpired-subject-2 = Platnosť spôsobu platby za vaše predplatné vypršala alebo čoskoro vyprší
subscriptionsPaymentExpired-title-2 = Platnosť vášho spôsobu platby vypršala alebo čoskoro vyprší
subscriptionsPaymentExpired-content-2 = Platobná metóda, ktorú používate na platby za nasledujúce predplatné, už vypršala alebo čoskoro vyprší.
subscriptionsPaymentProviderCancelled-subject = Vyžaduje sa aktualizácia platobných údajov pre predplatné produktov { -brand-mozilla(case: "gen") }
subscriptionsPaymentProviderCancelled-title = Ospravedlňujeme sa, máme problém so zvoleným spôsobom platby
subscriptionsPaymentProviderCancelled-content-detected = Pri nasledujúcich predplatných sme zistili problém s vaším spôsobom platby.
subscriptionsPaymentProviderCancelled-content-payment-1 = Je možné, že platnosť vášho spôsobu platby vypršala alebo je váš aktuálny spôsob platby zastaraný.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Platba za { $productName } bola prijatá
subscriptionSubsequentInvoice-title = Ďakujeme, že využívate naše predplatné!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Dostali sme vašu poslednú platbu za { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Vaša ďalšia faktúra bude vystavená dňa { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Inovovali ste na produkt { $productName }
subscriptionUpgrade-title = Ďakujeme, že ste inovovali!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Úspešne ste inovovali na { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Bol vám účtovaný jednorazový poplatok vo výške { $invoiceAmountDue }, ktorý zodpovedá vyššej cene vášho predplatného na zvyšok tohto fakturačného obdobia ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Na váš účet bol pripísaný kredit vo výške { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Od vašej ďalšej faktúry sa cena vášho predplatného zmení.
subscriptionUpgrade-content-old-price-day = Predchádzajúca sadzba bola { $paymentAmountOld } za deň.
subscriptionUpgrade-content-old-price-week = Predchádzajúca sadzba bola { $paymentAmountOld } za týždeň.
subscriptionUpgrade-content-old-price-month = Predchádzajúca sadzba bola { $paymentAmountOld } mesačne.
subscriptionUpgrade-content-old-price-halfyear = Predchádzajúca sadzba bola { $paymentAmountOld } za šesť mesiacov.
subscriptionUpgrade-content-old-price-year = Predchádzajúca sadzba bola { $paymentAmountOld } ročne.
subscriptionUpgrade-content-old-price-default = Predchádzajúca sadzba bola { $paymentAmountOld } za fakturačné obdobie.
subscriptionUpgrade-content-old-price-day-tax = Predchádzajúca sadzba bola { $paymentAmountOld } + { $paymentTaxOld } daň za deň.
subscriptionUpgrade-content-old-price-week-tax = Predchádzajúca sadzba bola { $paymentAmountOld } + { $paymentTaxOld } daň za týždeň.
subscriptionUpgrade-content-old-price-month-tax = Predchádzajúca sadzba bola { $paymentAmountOld } + { $paymentTaxOld } daň mesačne.
subscriptionUpgrade-content-old-price-halfyear-tax = Predchádzajúca sadzba bola { $paymentAmountOld } + { $paymentTaxOld } daň za šesť mesiacov.
subscriptionUpgrade-content-old-price-year-tax = Predchádzajúca sadzba bola { $paymentAmountOld } + { $paymentTaxOld } daň ročne.
subscriptionUpgrade-content-old-price-default-tax = Predchádzajúca sadzba dane bola { $paymentAmountOld } + { $paymentTaxOld } za fakturačné obdobie.
subscriptionUpgrade-content-new-price-day = Odteraz vám bude účtovaná suma { $paymentAmountNew } denne, bez zliav.
subscriptionUpgrade-content-new-price-week = Odteraz vám bude účtovaná suma { $paymentAmountNew } týždenne bez zliav.
subscriptionUpgrade-content-new-price-month = Odteraz vám bude mesačne účtovaná suma { $paymentAmountNew } bez zliav.
subscriptionUpgrade-content-new-price-halfyear = Odteraz vám bude účtovaná suma { $paymentAmountNew } každých šesť mesiacov bez zliav.
subscriptionUpgrade-content-new-price-year = Odteraz vám bude účtovaná suma { $paymentAmountNew } ročne bez zliav.
subscriptionUpgrade-content-new-price-default = Odteraz vám bude účtovaná suma { $paymentAmountNew } za každé fakturačné obdobie bez zliav.
subscriptionUpgrade-content-new-price-day-dtax = Odteraz vám bude účtovaná suma { $paymentAmountNew } + { $paymentTaxNew } daň za deň, bez zliav.
subscriptionUpgrade-content-new-price-week-tax = Odteraz vám bude týždenne účtovaná suma { $paymentAmountNew } + { $paymentTaxNew } daň, bez zliav.
subscriptionUpgrade-content-new-price-month-tax = Odteraz vám bude mesačne účtovaná suma { $paymentAmountNew } + { $paymentTaxNew } daň, bez zliav.
subscriptionUpgrade-content-new-price-halfyear-tax = Odteraz vám bude účtovaná suma { $paymentAmountNew } + { $paymentTaxNew } daň každých šesť mesiacov, bez zliav.
subscriptionUpgrade-content-new-price-year-tax = Odteraz vám bude účtovaná suma { $paymentAmountNew } + { $paymentTaxNew } daň ročne, bez zliav.
subscriptionUpgrade-content-new-price-default-tax = Odteraz vám bude účtovaná suma { $paymentAmountNew } + { $paymentTaxNew } daň za každé fakturačné obdobie, bez zliav.
subscriptionUpgrade-existing = Ak sa niektoré z vašich existujúcich predplatných prekrývajú s touto inováciou, budeme sa nimi zaoberať a pošleme vám samostatný e‑mail s podrobnosťami. Ak váš nový program obsahuje produkty, ktoré vyžadujú inštaláciu, pošleme vám samostatný e‑mail s pokynmi na ich inštaláciu a nastavenie.
subscriptionUpgrade-auto-renew = Vaše predplatné sa bude automaticky obnovovať každé fakturačné obdobie až dokým ho nezrušíte.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Na prihlásenie použite kód { $unblockCode }
unblockCode-preview = Tento kód vyprší o hodinu
unblockCode-title = Spoznávate toto prihlásenie?
unblockCode-prompt = Ak áno, tu je autorizačný kód, ktorý potrebujete:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ak áno, tu je autorizačný kód, ktorý potrebujete: { $unblockCode }
unblockCode-report = Ak nie, pomôžte nám odraziť útočníkov a <a data-l10n-name="reportSignInLink">nahláste nám to</a>.
unblockCode-report-plaintext = Ak nie, pomôžte nám odraziť útočníkov a nahláste nám to.
verificationReminderFinal-subject = Posledná pripomienka na potvrdenie účtu
verificationReminderFinal-description-2 = Pred pár týždňami ste si vytvorili { -product-mozilla-account(capitalization: "lower", case: "acc") }, no doteraz ste to nepotvrdili. Pre vašu bezpečnosť odstránime účet, ak nebude overený v priebehu nasledujúcich 24 hodín.
confirm-account = Potvrdiť účet
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Nezabudnite potvrdiť svoj účet
verificationReminderFirst-title-3 = Víta vás { -brand-mozilla }!
verificationReminderFirst-description-3 = Pred niekoľkými dňami ste si vytvorili { -product-mozilla-account(capitalization: "lower", case: "acc") }, no doteraz ste ho nepotvrdili. Potvrďte svoj účet v priebehu nasledujúcich 15 dní, inak bude automaticky vymazaný.
verificationReminderFirst-sub-description-3 = Nenechajte si ujsť prehliadač, ktorý dáva vás a vaše súkromie na prvé miesto.
confirm-email-2 = Potvrdiť účet
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Potvrdiť účet
verificationReminderSecond-subject-2 = Nezabudnite potvrdiť svoj účet
verificationReminderSecond-title-3 = Nenechajte si ujsť { -brand-mozilla(case: "acc") }!
verificationReminderSecond-description-4 = Pred niekoľkými dňami ste si vytvorili { -product-mozilla-account(capitalization: "lower", case: "acc") }, no doteraz ste ho nepotvrdili. Potvrďte svoj účet v priebehu nasledujúcich 10 dní, inak bude automaticky vymazaný.
verificationReminderSecond-second-description-3 = Váš { -product-mozilla-account(capitalization: "lower") } vám umožňuje synchronizovať údaje { -brand-firefox(case: "gen") } naprieč zariadeniami a odomyká vám prístup k produktom { -brand-mozilla(case: "gen") }, ktoré ešte viac chránia súkromie.
verificationReminderSecond-sub-description-2 = Staňte sa súčasťou nášho poslania premeniť internet na miesto, ktoré je otvorené pre každého.
verificationReminderSecond-action-2 = Potvrdiť účet
verify-title-3 = Poďte na internet vďaka { -brand-mozilla(case: "dat") }
verify-description-2 = Potvrďte svoj účet a vyťažte zo svojej { -brand-mozilla(case: "gen") } čo najviac, začínajúc s:
verify-subject = Dokončite vytváranie svojho účtu
verify-action-2 = Potvrdiť účet
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Použite kód { $code } na zmenu účtu
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Platnosť tohto kódu vyprší o { $expirationTime } minútu.
        [few] Platnosť tohto kódu vyprší o { $expirationTime } minúty.
        [many] Platnosť tohto kódu vyprší o { $expirationTime } minút.
       *[other] Platnosť tohto kódu vyprší o { $expirationTime } minút.
    }
verifyAccountChange-title = Meníte si informácie o účte?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Pomôžte nám udržať váš účet v bezpečí schválením tejto zmeny vykonanej na:
verifyAccountChange-prompt = Ak áno, tu je váš autorizačný kód:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Jeho platnosť vyprší o { $expirationTime } minútu.
        [few] Jeho platnosť vyprší o { $expirationTime } minúty.
        [many] Jeho platnosť vyprší o { $expirationTime } minút.
       *[other] Jeho platnosť vyprší o { $expirationTime } minút.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Prihlásili ste sa do produktu { $clientName }?
verifyLogin-description-2 = Pomôžte nám zabezpečiť bezpečnosť vášho účtu potvrdením, že ste sa prihlásili:
verifyLogin-subject-2 = Potvrdenie prihlásenia
verifyLogin-action = Potvrdiť prihlásenie
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Na prihlásenie použite kód { $code }
verifyLoginCode-preview = Platnosť tohto kódu vyprší o 5 minút.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Prihlásili ste sa do produktu { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Pomôžte nám zabezpečiť bezpečnosť vášho účtu schválením prihlásenia na zariadení:
verifyLoginCode-prompt-3 = Ak áno, tu je váš autorizačný kód:
verifyLoginCode-expiry-notice = Jeho platnosť vyprší po 5 minútach.
verifyPrimary-title-2 = Potvrdenie hlavnej e‑mailovej adresy
verifyPrimary-description = Požiadavka na zmenu v účte prišla z nasledovného zariadenia:
verifyPrimary-subject = Potvrdenie hlavnej e‑mailovej adresy
verifyPrimary-action-2 = Potvrdiť e‑mailovú adresu
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Po potvrdení budú k dispozícii zmeny v účte, napríklad pridanie alternatívnej e‑mailovej adresy.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Na potvrdenie vášho sekundárneho e‑mailu použite kód { $code }
verifySecondaryCode-preview = Platnosť tohto kódu vyprší o 5 minút.
verifySecondaryCode-title-2 = Potvrdenie alternatívnej e‑mailovej adresy
verifySecondaryCode-action-2 = Potvrdiť e‑mailovú adresu
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Požiadavka na použitie adresy { $email } ako alternatívnej e‑mailovej adresy bola vytvorená z nasledujúceho { -product-mozilla-account(case: "gen", capitalization: "lower") }:
verifySecondaryCode-prompt-2 = Použite tento potvrdzovací kód:
verifySecondaryCode-expiry-notice-2 = Jeho platnosť vyprší po 5 minútach. Po potvrdení začnete na túto e‑mailovú adresu dostávať bezpečnostné upozornenia a potvrdenia.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Na potvrdenie vášho účtu použite kód { $code }
verifyShortCode-preview-2 = Platnosť tohto kódu vyprší o 5 minút
verifyShortCode-title-3 = Poďte na internet vďaka { -brand-mozilla(case: "dat") }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Potvrďte svoj účet a vyťažte zo svojej { -brand-mozilla(case: "gen") } čo najviac, začínajúc s:
verifyShortCode-prompt-3 = Použite tento potvrdzovací kód:
verifyShortCode-expiry-notice = Jeho platnosť vyprší po 5 minútach.
