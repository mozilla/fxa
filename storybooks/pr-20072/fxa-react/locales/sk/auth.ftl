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
cancellationSurvey = Vyplňte, prosím, tento <a data-l10n-name="cancellationSurveyUrl">krátky prieskum</a> a pomôžte nám zlepšiť naše služby.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Vyplňte, prosím, tento krátky formulár a pomôžte nám zlepšiť naše služby:
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
view-invoice-link-action = Zobraziť faktúru
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Zobraziť faktúru: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Vaše predplatné produktu { $productName } bolo zrušené
subscriptionAccountDeletion-title = Mrzí nás, že odchádzate
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Nedávno ste odstránili svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }. V dôsledku toho sme zrušili vaše predplatné produktu { $productName }. Vaša posledná platba vo výške { $invoiceTotal } bola zaplatená dňa { $invoiceDateOnly }.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Vaše predplatné produktu { $productName } čoskoro vyprší
subscriptionEndingReminder-title = Vaše predplatné produktu { $productName } čoskoro vyprší
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Váš prístup k produktu { $productName } sa skončí dňa <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Ak chcete naďalej používať { $productName }, môžete si predplatné znova aktivovať v <a data-l10n-name="subscriptionEndingReminder-account-settings">Nastaveniach účtu</a> pred dátumom <strong>{ $serviceLastActiveDateOnly }</strong>. Ak potrebujete pomoc, <a data-l10n-name="subscriptionEndingReminder-contact-support">kontaktujte náš tím podpory</a>.
subscriptionEndingReminder-content-line1-plaintext = Váš prístup k produktu { $productName } sa skončí dňa { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Ak chcete naďalej používať { $productName }, môžete si predplatné znova aktivovať v Nastaveniach účtu pred dátumu { $serviceLastActiveDateOnly }. Ak potrebujete pomoc, kontaktujte náš tím podpory.
subscriptionEndingReminder-content-closing = Ďakujeme, že ste naším cenným odberateľom!
subscriptionEndingReminder-churn-title = Chcete si zachovať prístup?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Platia podmienky a obmedzenia</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Platia podmienky a obmedzenia: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontaktujte náš tím podpory: { $subscriptionSupportUrlWithUtm }
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
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Vaše aktuálne predplatné sa automaticky obnoví o { $reminderLength } dní.
subscriptionRenewalReminder-content-discount-change = Vaša ďalšia faktúra odráža zmenu ceny, pretože predchádzajúca zľava sa skončila a bola uplatnená nová zľava.
subscriptionRenewalReminder-content-discount-ending = Keďže predchádzajúca zľava sa skončila, vaše predplatné sa obnoví za štandardnú cenu.
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
subscriptionsPaymentExpired-subject-2 = Platnosť spôsobu platby za vaše predplatné vypršala alebo čoskoro vyprší
subscriptionsPaymentExpired-title-2 = Platnosť vášho spôsobu platby vypršala alebo čoskoro vyprší
subscriptionsPaymentExpired-content-2 = Platobná metóda, ktorú používate na platby za nasledujúce predplatné, už vypršala alebo čoskoro vyprší.
subscriptionsPaymentProviderCancelled-subject = Vyžaduje sa aktualizácia platobných údajov pre predplatné produktov { -brand-mozilla(case: "gen") }
subscriptionsPaymentProviderCancelled-title = Ospravedlňujeme sa, máme problém so zvoleným spôsobom platby
subscriptionsPaymentProviderCancelled-content-detected = Pri nasledujúcich predplatných sme zistili problém s vaším spôsobom platby.
subscriptionsPaymentProviderCancelled-content-payment-1 = Je možné, že platnosť vášho spôsobu platby vypršala alebo je váš aktuálny spôsob platby zastaraný.
