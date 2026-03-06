## Non-email strings

session-verify-send-push-title-2 = Přihlašujete se k { -product-mozilla-account(case: "dat", capitalization: "lower") }?
session-verify-send-push-body-2 = Klepnutím zde potvrďte, že jste to vy
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je váš ověřovací kód od { -brand-mozilla(case: "gen") }. Platnost vyprší za 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Ověřovací kód { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je váš obnovovací kód od { -brand-mozilla(case: "gen") }. Platnost vyprší za 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kód { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je váš obnovovací kód od { -brand-mozilla(case: "gen") }. Platnost vyprší za 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kód { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla }">
subplat-automated-email = Toto je automaticky zaslaný e-mail – pokud jste si ho nevyžádali, můžete ho ignorovat.
subplat-privacy-notice = Zásady ochrany osobních údajů
subplat-privacy-plaintext = Zásady ochrany osobních údajů:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Tuto e-mailovou zprávu vám posíláme, protože e-mailová adresa { $email } má založený { -product-mozilla-account(case: "acc", capitalization: "lower") } a jste přihlášení v produktu { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Tuto e-mailovou zprávu vám posíláme, protože { $email } má založený { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-explainer-multiple-2 = Tuto e-mailovou zprávu vám posíláme, protože { $email } má založený { -product-mozilla-account(case: "acc", capitalization: "lower") } a máte předplaceno několik produktů.
subplat-explainer-was-deleted-2 = Tento e-mail jste dostali, protože na adresu { $email } byl zaregistrován { -product-mozilla-account(capitalization: "lower") }.
subplat-manage-account-2 = Svá nastavení { -product-mozilla-account(case: "gen", capitalization: "lower") } můžete spravovat na <a data-l10n-name="subplat-account-page">stránce svého účtu</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Spravujte nastavení { -product-mozilla-account(case: "gen", capitalization: "lower") } na stránce svého účtu: { $accountSettingsUrl }
subplat-terms-policy = Podmínky zrušení
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Zrušit předplatné
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Znovu aktivovat předplatné
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Aktualizovat platební informace
subplat-privacy-policy = { -brand-mozilla } a soukromí
subplat-privacy-policy-2 = Oznámení o ochraně osobních údajů { -product-mozilla-accounts(capitalization: "uppercase", case: "gen") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Podmínky služby { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Právní informace
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Ochrana osobních údajů
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Pomozte nám vylepšit naše služby tím, že se zúčastníte tohoto <a data-l10n-name="cancellationSurveyUrl">krátkého průzkumu</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Vyplňte prosím krátký formulář a pomozte nám zlepšit naše služby:
payment-details = Detaily platby:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Číslo dokladu: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Dne { $invoiceDateOnly } účtováno { $invoiceTotal }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Další platba: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Platební metoda:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Platební metoda: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Platební metoda: { $cardName } končící na { $lastFour }
payment-provider-card-ending-in-plaintext = Platební metoda: Karta končící na { $lastFour }
payment-provider-card-ending-in = <b>Platební metoda:</b> Karta končící na { $lastFour }
payment-provider-card-ending-in-card-name = <b>Platební metoda:</b> { $cardName } končící na { $lastFour }
subscription-charges-invoice-summary = Přehled faktur

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Číslo faktury:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Číslo faktury: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Poměrná cena
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Poměrná cena: { $remainingAmountTotal }
subscription-charges-list-price = Ceníková cena
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Ceníková cena: { $offeringPrice }
subscription-charges-credit-from-unused-time = Kredit z nevyužitého času
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kredit za nevyužitý čas: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Mezisoučet</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Mezisoučet: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Jednorázová sleva
subscription-charges-one-time-discount-plaintext = Jednorázová sleva: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Sleva { $discountDuration } měsíc
        [few] Sleva { $discountDuration } měsíce
       *[other] Sleva { $discountDuration } měsíců
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-měsíční sleva: { $invoiceDiscountAmount }
        [few] { $discountDuration }-měsíční sleva: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-měsíční sleva: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Sleva
subscription-charges-discount-plaintext = Sleva: { $invoiceDiscountAmount }
subscription-charges-taxes = Daně a poplatky
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Daně a poplatky: { $invoiceTaxAmount }
subscription-charges-total = <b>Celkem</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Celkem: { $invoiceTotal }
subscription-charges-credit-applied = Použitý kredit
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Použitý kredit: { $creditApplied }
subscription-charges-amount-paid = <b>Zaplacená částka</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Zaplacená částka: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Na váš účet byl připsán kredit ve výši { $creditReceived }, který bude použit na vaše budoucí faktury.

##

subscriptionSupport = Máte dotaz ohledně vašeho předplatného? Pomůže vám náš <a data-l10n-name="subscriptionSupportUrl">tým podpory</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Máte dotaz ohledně vašeho předplatného? Pomůže vám náš tým podpory:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Děkujeme vám za předplacení produktu { $productName }. Pokud budete mít jakékoliv otázky k vašemu předplatnému nebo budete potřebovat informace o produktu { $productName }, <a data-l10n-name="subscriptionSupportUrl">kontaktujte nás</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Děkujeme vám za předplacení produktu { $productName }. Pokud budete mít jakékoliv otázky k vašemu předplatnému nebo budete potřebovat informace o produktu { $productName }, kontaktujte nás:
subscription-support-get-help = Získejte pomoc s předplatným
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Správa předplatného</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Správa předplatného:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kontaktujte podporu</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kontaktovat podporu:
subscriptionUpdateBillingEnsure = Ověřte, že jsou vaše platební údaje a informace o účtu <a data-l10n-name="updateBillingUrl">aktuální</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ověřte, že jsou vaše platební údaje a informace o účtu aktuální:
subscriptionUpdateBillingTry = Vaši platbu zkusíme provést znovu za několik dní. Mezitím můžete ověřit, <a data-l10n-name="updateBillingUrl">zda jsou vaše platební údaje aktuální</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vaši platbu zkusíme provést znovu za několik dní. Mezitím můžete ověřit, zda jsou vaše platební údaje aktuální:
subscriptionUpdatePayment = Abyste zabránili jakémukoliv přerušení předplatného služeb, <a data-l10n-name="updateBillingUrl">aktualizujte včas své platební údaje</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Abyste zabránili jakémukoliv přerušení předplatného služeb, aktualizujte včas své platební údaje:
view-invoice-link-action = Zobrazit fakturu
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Zobrazit fakturu: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Vítá vás { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Vítá vás { $productName }
downloadSubscription-content-2 = Začněte používat všechny funkce, které jsou zahrnuté ve vašem předplatném:
downloadSubscription-link-action-2 = Začít
fraudulentAccountDeletion-subject-2 = Váš { -product-mozilla-account(capitalization: "lower") } byl smazán
fraudulentAccountDeletion-title = Váš účet byl smazán
fraudulentAccountDeletion-content-part1-v2 = Nedávno byl vytvořen účet { -product-mozilla-account } a pomocí této e-mailové adresy bylo účtováno předplatné. Stejně jako u všech nových účtů jsme vás požádali o potvrzení účtu nejprve ověřením této e-mailové adresy.
fraudulentAccountDeletion-content-part2-v2 = V současné době vidíme, že účet nebyl nikdy potvrzen. Protože tento krok nebyl dokončen, nejsme si jisti, zda se jednalo o autorizované předplatné. V důsledku toho byl smazán { -product-mozilla-account } zaregistrovaný na tuto e-mailovou adresu, vaše předplatné bylo zrušeno a všechny poplatky byly vráceny.
fraudulentAccountDeletion-contact = Pokud máte nějaké dotazy, kontaktujte prosím náš <a data-l10n-name="mozillaSupportUrl">tým podpory</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Pokud máte nějaké dotazy, kontaktujte náš tým podpory: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Vaše předplatné produktu { $productName } bylo zrušeno
subscriptionAccountDeletion-title = Je nám líto, že odcházíte
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Nedávno jste smazali svůj { -product-mozilla-account(case: "acc") }. Proto jsme zrušili vaše předplatné produktu { $productName }. Vaše poslední platba ve výši{ $invoiceTotal } byla uhrazena dne { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Připomínka: dokončete nastavení vašeho účtu
subscriptionAccountReminderFirst-title = Zatím nemáte přístup ke svému předplatnému
subscriptionAccountReminderFirst-content-info-3 = Před několika dny jste vytvořili { -product-mozilla-account(case: "acc") }, ale nikdy jste jej nepotvrdili. Doufáme, že dokončíte nastavení svého účtu, abyste mohli používat své nové předplatné.
subscriptionAccountReminderFirst-content-select-2 = Vyberte „Vytvořit heslo“ pro nastavení nového hesla a dokončení potvrzování účtu.
subscriptionAccountReminderFirst-action = Vytvoření hesla
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Poslední připomenutí: Nastavte si svůj účet
subscriptionAccountReminderSecond-title-2 = Vítá vás { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Před několika dny jste vytvořili { -product-mozilla-account(case: "acc") }, ale nikdy jste jej nepotvrdili. Doufáme, že dokončíte nastavení svého účtu, abyste mohli používat své nové předplatné.
subscriptionAccountReminderSecond-content-select-2 = Vyberte „Vytvořit heslo“ pro nastavení nového hesla a dokončení potvrzování účtu.
subscriptionAccountReminderSecond-action = Vytvoření hesla
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Vaše předplatné produktu { $productName } bylo zrušeno
subscriptionCancellation-title = Je nám líto, že odcházíte

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Zrušili jsme své předplatné produktu { $productName }. Vaše poslední platba ve výši { $invoiceTotal } byla zaplacena dne { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Zrušili jsme vaše předplatné produktu { $productName }. Vaše poslední platba ve výši { $invoiceTotal } bude zaplacena dne { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Služba bude dostupná až do konce vašeho aktuálního fakturačního období, což je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Úspěšně jste přešli na { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Úspěšně jste přešli z { $productNameOld } na { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Od příštího vyúčtování se váš poplatek změní z { $paymentAmountOld } za { $productPaymentCycleOld } na { $paymentAmountNew } za { $productPaymentCycleNew }. Zároveň vám bude poskytnut jednorázový kredit ve výši { $paymentProrated }, který odráží nižší poplatek za zbytek stávajícího období { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Pokud je pro používání produktu { $productName } potřeba instalace dodatečného softwaru, pošleme vám samostatný e-mail s pokyny, jak ho stáhnout.
subscriptionDowngrade-content-auto-renew = Vaše předplatné se bude každé fakturační období automaticky obnovovat, dokud ho nezrušíte.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Vaše předplatné produktu { $productName } brzy vyprší
subscriptionEndingReminder-title = Vaše předplatné produktu { $productName } brzy vyprší
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Váš přístup ke službě { $productName } skončí dne <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Pokud chcete nadále používat { $productName }, můžete své předplatné znovu aktivovat v <a data-l10n-name="subscriptionEndingReminder-account-settings">nastavení účtu</a>, a to do <strong>{ $serviceLastActiveDateOnly }</strong >. Pokud potřebujete pomoci, <a data-l10n-name="subscriptionEndingReminder-contact-support">kontaktujte náš tým podpory</a>.
subscriptionEndingReminder-content-line1-plaintext = Váš přístup k produktu { $productName } skončí dne { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Pokud chcete pokračovat v používání aplikace { $productName }, můžete své předplatné znovu aktivovat v nastavení účtu do { $serviceLastActiveDateOnly }. Pokud potřebujete pomoci, kontaktujte náš tým podpory.
subscriptionEndingReminder-content-closing = Děkujeme, že jste naším cenným odběratelem!
subscriptionEndingReminder-churn-title = Chcete si zachovat přístup?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Na nabídku se vztahují pouze podmínky</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Na nabídku se vztahují podmínky a omezení: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontaktujte náš tým podpory: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Vaše předplatné produktu { $productName } bylo zrušeno
subscriptionFailedPaymentsCancellation-title = Vaše předplatné bylo zrušeno
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Zrušili jsme vaše předplatné služby { $productName } z důvodu opakovaného selhání platby. Pro opětovné získání přístupu prosím objednejte nové předplatné s novými platebními údaji.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Platba za { $productName } byla potvrzena
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Děkujeme, že jste si předplatili { $productName }
subscriptionFirstInvoice-content-processing = Vaši platbu nyní zpracováváme, což může trvat až čtyři pracovní dny.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Obdržíte samostatný e-mail o tom, jak začít používat { $productName }.
subscriptionFirstInvoice-content-auto-renew = Vaše předplatné se bude každé fakturační období automaticky obnovovat, dokud ho nezrušíte.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Příští faktura vám bude vystavena dne { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Platnost platební metody { $productName } vypršela nebo brzy vyprší
subscriptionPaymentExpired-title-2 = Platnost vaší platební metody vypršela nebo brzy vyprší
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Platnost platební metody, kterou používáte pro { $productName }, vypršela nebo brzy vyprší.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Platba za produkt { $productName } se nezdařila
subscriptionPaymentFailed-title = Omlouváme se, máme potíže s vaší platbou
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Vyskytl se problém s vaší poslední platbou za { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Je možné, že vypršela platnost vaší platební metody, nebo jsou vaše platební údaje zastaralé.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Je vyžadována aktualizace platebních údajů pro produkt { $productName }
subscriptionPaymentProviderCancelled-title = Je nám to líto, ale s vaší platební metodou se vyskytly problémy
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Zjistili jsme problém s vaší platební metodou za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Je možné, že vypršela platnost vaší platební metody, nebo jsou vaše platební údaje zastaralé.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Předplatné produktu { $productName } bylo znovu aktivované
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Děkujeme, že jste si znovu aktivovali předplatné produktu { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Váš fakturační cyklus a platba zůstanou stejné. Vaše další platba bude { $invoiceTotal } dne { $nextInvoiceDateOnly }. Vaše předplatné se automaticky obnoví každé fakturační období, pokud se nerozhodnete jej zrušit.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Upozornění na automatické obnovení produktu { $productName }
subscriptionRenewalReminder-title = Vaše předplatné bude brzy obnoveno
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Vážený zákazníku produktu { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Vaše aktuální předplatné je nastaveno tak, aby se za { $reminderLength } dní automaticky obnovilo.
subscriptionRenewalReminder-content-discount-change = Vaše příští faktura odráží změny v cenách, protože skončila předchozí sleva a byla uplatněna nová.
subscriptionRenewalReminder-content-discount-ending = Protože skončila předchozí sleva, bude vaše předplatné obnoveno za standardní cenu.
subscriptionRenewalReminder-content-closing = S pozdravem,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Tým produktu { $productName }
subscriptionReplaced-subject = Vaše předplatné bylo aktualizováno v rámci upgradu
subscriptionReplaced-title = Vaše předplatné bylo aktualizováno
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Vaše individuální předplatné produktu { $productName } bylo nahrazeno a je nyní zahrnuto v novém balíčku.
subscriptionReplaced-content-credit = Obdržíte kredit za nevyužitý čas v rámci předchozího předplatného. Tento kredit bude automaticky připsán na váš účet a použit k úhradě budoucích plateb.
subscriptionReplaced-content-no-action = Z vaší strany není vyžadována žádná akce.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Platba za produkt { $productName } byla přijata
subscriptionSubsequentInvoice-title = Děkujeme, že využíváte naše předplatné.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Obdrželi jsme vaši poslední platbu za produkt { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Příští faktura vám bude vystavena dne { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Úspěšně jste aktualizovali na produkt { $productName }
subscriptionUpgrade-title = Děkujeme za povýšení vašeho předplatného.
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Úspěšně jste přešli na { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Byl vám účtován jednorázový poplatek { $invoiceAmountDue }, který odráží vyšší cenu vašeho předplatného pro zbytek tohoto fakturačního období ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Obdrželi jste kredit ve výši { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Od příštího vyúčtování se cena vašeho předplatného změní.
subscriptionUpgrade-content-old-price-day = Předchozí cena byla { $paymentAmountOld } na den.
subscriptionUpgrade-content-old-price-week = Předchozí sazba byla { $paymentAmountOld } týdně.
subscriptionUpgrade-content-old-price-month = Předchozí sazba byla { $paymentAmountOld } měsíčně.
subscriptionUpgrade-content-old-price-halfyear = Předchozí sazba byla { $paymentAmountOld } za šest měsíců.
subscriptionUpgrade-content-old-price-year = Předchozí sazba byla { $paymentAmountOld } ročně.
subscriptionUpgrade-content-old-price-default = Předchozí sazba byla { $paymentAmountOld } za interval účtování.
subscriptionUpgrade-content-old-price-day-tax = Předchozí sazba byla { $paymentAmountOld } + daň { $paymentTaxOld } denně.
subscriptionUpgrade-content-old-price-week-tax = Předchozí sazba byla { $paymentAmountOld } + daň { $paymentTaxOld } týdně.
subscriptionUpgrade-content-old-price-month-tax = Předchozí sazba byla { $paymentAmountOld } + daň { $paymentTaxOld } měsíčně.
subscriptionUpgrade-content-old-price-halfyear-tax = Předchozí sazba byla { $paymentAmountOld } + { $paymentTaxOld } daň za šest měsíců.
subscriptionUpgrade-content-old-price-year-tax = Předchozí sazba byla { $paymentAmountOld } + daň { $paymentTaxOld } ročně.
subscriptionUpgrade-content-old-price-default-tax = Předchozí sazba byla { $paymentAmountOld } + { $paymentTaxOld } daň za interval účtování.
subscriptionUpgrade-content-new-price-day = Do budoucna vám bude účtováno { $paymentAmountNew } za den bez slev.
subscriptionUpgrade-content-new-price-week = Do budoucna vám bude účtováno { $paymentAmountNew } týdně bez slev.
subscriptionUpgrade-content-new-price-month = Do budoucna vám bude účtováno { $paymentAmountNew } měsíčně bez slev.
subscriptionUpgrade-content-new-price-halfyear = Od teď vám bude účtováno { $paymentAmountNew } každých šest měsíců bez slev.
subscriptionUpgrade-content-new-price-year = Do budoucna vám bude účtováno { $paymentAmountNew } ročně bez slev.
subscriptionUpgrade-content-new-price-default = Do budoucna vám bude účtováno { $paymentAmountNew } za interval účtování bez slev.
subscriptionUpgrade-content-new-price-day-dtax = Do budoucna vám bude účtováno { $paymentAmountNew } + { $paymentTaxNew } daň denně bez slev.
subscriptionUpgrade-content-new-price-week-tax = Do budoucna vám bude účtováno { $paymentAmountNew } + { $paymentTaxNew } daň týdně bez slev.
subscriptionUpgrade-content-new-price-month-tax = Do budoucna vám bude účtováno { $paymentAmountNew } + { $paymentTaxNew } daň měsíčně bez slev.
subscriptionUpgrade-content-new-price-halfyear-tax = Od teď vám bude účtováno { $paymentAmountNew } + { $paymentTaxNew } daň každých šest měsíců bez slev.
subscriptionUpgrade-content-new-price-year-tax = Do budoucna vám bude účtováno { $paymentAmountNew } + { $paymentTaxNew } daň ročně bez slev.
subscriptionUpgrade-content-new-price-default-tax = Od nynějška vám bude účtováno { $paymentAmountNew } + { $paymentTaxNew } daň za každé interval účtování bez slev.
subscriptionUpgrade-existing = Pokud se některé z vašich stávajících předplatných překrývá s touto aktualizací, my se tím budeme zabývat a zašleme vám samostatný e-mail s podrobnostmi. Pokud váš nový plán obsahuje produkty, které vyžadují instalaci, zašleme vám samostatný e-mail s pokyny k nastavení.
subscriptionUpgrade-auto-renew = Vaše předplatné se bude každé fakturační období automaticky obnovovat, dokud ho nezrušíte.
subscriptionsPaymentExpired-subject-2 = Platnost platební metody pro vaše předplatné vypršela nebo brzy vyprší
subscriptionsPaymentExpired-title-2 = Platnost vaší platební metody vypršela nebo brzy vyprší
subscriptionsPaymentExpired-content-2 = Platnost platební metody, kterou používáte k platbám za následující předplatné, vypršela nebo brzy vyprší.
subscriptionsPaymentProviderCancelled-subject = Pro předplatná { -brand-mozilla } je vyžadována aktualizace platebních údajů
subscriptionsPaymentProviderCancelled-title = Je nám to líto, ale s vaší platební metodou se vyskytly problémy
subscriptionsPaymentProviderCancelled-content-detected = S vaší platební metodou platbou pro úhradu následujících předplatných se vyskytly problémy.
subscriptionsPaymentProviderCancelled-content-payment-1 = Je možné, že vypršela platnost vaší platební metody, nebo jsou vaše platební údaje zastaralé.
