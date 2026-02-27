## Non-email strings

session-verify-send-push-title-2 = Se prijavljate v { -product-mozilla-account(sklon: "tozilnik") }?
session-verify-send-push-body-2 = Kliknite tukaj za potrditev, da ste to vi
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je vaša potrditvena koda za račun { -brand-mozilla }. Poteče čez 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Potrditvena koda za račun { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je vaša obnovitvena koda za račun { -brand-mozilla }. Poteče čez 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Koda za račun { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je vaša obnovitvena koda za račun { -brand-mozilla }. Poteče čez 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Koda za račun { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logotip { -brand-mozilla(sklon: "rodilnik") }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logotip { -brand-mozilla(sklon: "rodilnik") }">
subplat-automated-email = Sporočilo je bilo poslano samodejno. Če ste ga prejeli po pomoti, vam ni potrebno storiti ničesar.
subplat-privacy-notice = Obvestilo o zasebnosti
subplat-privacy-plaintext = Obvestilo o zasebnosti:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = To sporočilo ste prejeli, ker je na { $email } registriran { -product-mozilla-account } in ste se naročili na { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = To sporočilo ste prejeli, ker je na { $email } registriran { -product-mozilla-account }.
subplat-explainer-multiple-2 = To sporočilo ste prejeli, ker je na { $email } registriran { -product-mozilla-account } in ste naročeni na več izdelkov.
subplat-explainer-was-deleted-2 = To sporočilo ste prejeli, ker je bil na { $email } registriran { -product-mozilla-account }.
subplat-manage-account-2 = Upravljajte nastavitve { -product-mozilla-account(sklon: "rodilnik") } na <a data-l10n-name="subplat-account-page">strani svojega računa</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Upravljajte nastavitve { -product-mozilla-account(sklon: "rodilnik") } na strani svojega računa: { $accountSettingsUrl }
subplat-terms-policy = Pogoji in pravila odpovedi
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Prekliči naročnino
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Obnovi naročnino
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Posodobi podatke za obračun
subplat-privacy-policy = Politika zasebnosti { -brand-mozilla(sklon: "rodilnik") }
subplat-privacy-policy-2 = Obvestilo o zasebnosti { -product-mozilla-accounts(sklon: "rodilnik") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Pogoji uporabe { -product-mozilla-accounts(sklon: "rodilnik") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Pravne informacije
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Zasebnost
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Pomagajte nam izboljšati naše storitve, tako da izpolnite to <a data-l10n-name="cancellationSurveyUrl">kratko anketo</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Pomagajte nam izboljšati naše storitve, tako da izpolnite to kratko anketo.
payment-details = Podatki o plačilu:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Številka računa: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Zaračunano: { $invoiceTotal } dne { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Naslednji račun: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Način plačila:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Način plačila: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Plačilno sredstvo: { $cardName }, ki se končuje s { $lastFour }
payment-provider-card-ending-in-plaintext = Plačilno sredstvo: kartica, ki se končuje s { $lastFour }
payment-provider-card-ending-in = <b>Plačilno sredstvo:</b> kartica, ki se končuje s { $lastFour }
payment-provider-card-ending-in-card-name = <b>Plačilno sredstvo:</b> { $cardName }, ki se končuje s { $lastFour }
subscription-charges-invoice-summary = Povzetek računa

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Številka računa:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Številka računa: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Sorazmerna cena
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Sorazmerna cena: { $remainingAmountTotal }
subscription-charges-list-price = Redna cena
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Redna cena: { $offeringPrice }
subscription-charges-credit-from-unused-time = Dobropis neizkoriščenega časa
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Dobropis od neuporabljenega časa: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Vmesna vsota</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Vmesni seštevek: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Enkratni popust
subscription-charges-one-time-discount-plaintext = Enkratni popust: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-mesečni popust
        [two] { $discountDuration }-mesečni popust
        [few] { $discountDuration }-mesečni popust
       *[other] { $discountDuration }-mesečni popust
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
        [two] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
        [few] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Popust
subscription-charges-discount-plaintext = Popust: { $invoiceDiscountAmount }
subscription-charges-taxes = Davki in pristojbine
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Davki in pristojbine: { $invoiceTaxAmount }
subscription-charges-total = <b>Skupaj</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Skupaj: { $invoiceTotal }
subscription-charges-credit-applied = Dobropis uveljavljen
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Uporabljeno dobro: { $creditApplied }
subscription-charges-amount-paid = <b>Plačan znesek</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Plačan znesek: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Prejeli ste dobroimetje { $creditReceived }, ki se bo uporabljalo pri vaših prihodnjih računih.

##

subscriptionSupport = Imate vprašanja o svoji naročnini? Naša <a data-l10n-name="subscriptionSupportUrl">ekipa za podporo</a> je tu, da vam pomaga.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Imate vprašanja o vaši naročnini? Naša ekipa za podporo je tu, da vam pomaga:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Hvala, ker ste se naročili na { $productName }. Če imate kakršnakoli vprašanja o naročnini ali če potrebujete več informacij o { $productName }, <a data-l10n-name="subscriptionSupportUrl">nam pišite</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Hvala, ker ste se naročili na { $productName }. Če imate kakršnakoli vprašanja o naročnini ali če potrebujete več informacij o { $productName }, nam pišite:
subscription-support-get-help = Poiščite pomoč za svojo naročnino
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Upravljanje naročnine</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Upravljajte naročnino:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Obrnite se na podporo</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Stopite v stik s podporo:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Tukaj</a> lahko poskrbite, da so vaš način plačila in podatki o računu posodobljeni.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tukaj lahko poskrbite, da so vaš način plačila in podatki o računu posodobljeni:
subscriptionUpdateBillingTry = Plačilo bomo znova poskusili izvesti v naslednjih dneh, vendar nam boste morda morali pomagati odpraviti težavo tako, da <a data-l10n-name="updateBillingUrl">posodobite podatke za plačilo</a>:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Plačilo bomo znova poskusili izvesti v naslednjih dneh, vendar nam boste morda morali pomagati odpraviti težavo tako, da posodobite podatke za plačilo:
subscriptionUpdatePayment = Da preprečite kakršnokoli prekinitev storitve, čim prej <a data-l10n-name="updateBillingUrl">posodobite svoje podatke za plačilo</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Da preprečite kakršnokoli prekinitev storitve, čim prej posodobite svoje podatke za plačilo:
view-invoice-link-action = Ogled računa
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Prikaži račun: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Dobrodošli v { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Dobrodošli v { $productName }
downloadSubscription-content-2 = Začnimo uporabljati vse funkcije, vključene v vašo naročnino:
downloadSubscription-link-action-2 = Začnite
fraudulentAccountDeletion-subject-2 = Vaš { -product-mozilla-account } je bil izbrisan
fraudulentAccountDeletion-title = Vaš račun je bil izbrisan
fraudulentAccountDeletion-content-part1-v2 = Pred kratkim je bil na ta e-poštni naslov ustvarjen { -product-mozilla-account } in zaračunana naročnina. Kot to storimo z vsemi novimi računi, smo vas prosili, da svoj račun potrdite s potrditvijo tega e-poštnega naslova.
fraudulentAccountDeletion-content-part2-v2 = Trenutno vidimo, da račun ni bil nikoli potrjen. Ker ta korak ni bil opravljen, nismo prepričani, ali ste to naročnino resnično nakazali vi. Zato je bil { -product-mozilla-account }, registriran na ta e-poštni naslov, izbrisan, naročnina pa preklicana, pri čemer so bili vsi stroški povrnjeni.
fraudulentAccountDeletion-contact = Če imate kakršnakoli vprašanja, se obrnite na našo <a data-l10n-name="mozillaSupportUrl">skupino za podporo</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Če imate kakršnakoli vprašanja, se obrnite na našo skupino za podporo: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Vaša naročnina za { $productName } je preklicana
subscriptionAccountDeletion-title = Žal nam je, ker odhajate
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Pred kratkim ste izbrisali svoj { -product-mozilla-account }. Zaradi tega smo preklicali vašo naročnino na { $productName }. Vaše zadnje plačilo { $invoiceTotal } je bilo nakazano { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Opomnik: Dokončajte nastavljanje računa
subscriptionAccountReminderFirst-title = Dostop do vaše naročnine še ni možen
subscriptionAccountReminderFirst-content-info-3 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Upamo, da boste dokončali nastavitev računa in si omogočili uporabo naročnine.
subscriptionAccountReminderFirst-content-select-2 = Izberite "Ustvari geslo", da nastavite novo geslo in dokončate potrjevanje računa.
subscriptionAccountReminderFirst-action = Ustvari geslo
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Zadnji opomnik: Nastavite svoj račun
subscriptionAccountReminderSecond-title-2 = Dobrodošli pri { -brand-mozilla(sklon: "mestnik") }!
subscriptionAccountReminderSecond-content-info-3 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Upamo, da boste dokončali nastavitev računa in si omogočili uporabo naročnine.
subscriptionAccountReminderSecond-content-select-2 = Izberite "Ustvari geslo", da nastavite novo geslo in dokončate potrjevanje računa.
subscriptionAccountReminderSecond-action = Ustvari geslo
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Vaša naročnina za { $productName } je preklicana
subscriptionCancellation-title = Žal nam je, ker odhajate

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Preklicali smo vašo naročnino na { $productName }. Vaše zadnje plačilo { $invoiceTotal } je bilo nakazano { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Preklicali smo vašo naročnino na { $productName }. Vaše zadnje plačilo { $invoiceTotal } bo nakazano { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Vaša storitev bo na voljo do konca trenutnega obračunskega obdobja, ki je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Preklopili ste na { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Uspešno ste preklopili z { $productNameOld } na { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Od naslednjega računa naprej se bo vaša cena spremenila iz { $paymentAmountOld } na { $productPaymentCycleOld } na { $paymentAmountNew } na { $productPaymentCycleNew }. Takrat vam bomo dodelili tudi enkraten dobropis v višini { $paymentProrated }, ki bo odražal nižjo bremenitev za preostanek tega obdobja.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = V kolikor morate za uporabo { $productName } namestiti novo programsko opremo, boste po e-pošti prejeli ločeno sporočilo z navodili za prenos.
subscriptionDowngrade-content-auto-renew = Naročnina se bo vsako obračunsko obdobje samodejno podaljšala, razen če se odločite za preklic.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Vaša naročnina za { $productName } bo kmalu potekla
subscriptionEndingReminder-title = Vaša naročnina za { $productName } bo kmalu potekla
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Vaš dostop do { $productName } bo ukinjen <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Če želite še naprej uporabljati { $productName }, lahko ponovno aktivirate svojo naročnino v <a data-l10n-name="subscriptionEndingReminder-account-settings">nastavitvah računa</a> pred <strong>{ $serviceLastActiveDateOnly }</strong> >. Če potrebujete pomoč, <a data-l10n-name="subscriptionEndingReminder-contact-support">se obrnite na našo skupino za podporo</a>.
subscriptionEndingReminder-content-line1-plaintext = Vaš dostop do { $productName } se bo končal { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Če želite še naprej uporabljati { $productName }, lahko v nastavitvah računa ponovno aktivirate svojo naročnino pred { $serviceLastActiveDateOnly }. Če potrebujete pomoč, se obrnite na našo skupino za podporo.
subscriptionEndingReminder-content-closing = Hvala, ker ste cenjen naročnik!
subscriptionEndingReminder-churn-title = Želite obdržati dostop?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Veljajo omejena določila</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Veljajo omejeni pogoji: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Stopite v stik z našo ekipo za podporo: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Vaša naročnina za { $productName } je preklicana
subscriptionFailedPaymentsCancellation-title = Vaša naročnina je bila preklicana
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Preklicali smo vam naročnino na { $productName } zaradi več neuspelih poskusov plačila. Če si želite povrniti dostop, začnite novo naročnino s posodobljenim načinom plačila.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Plačilo za { $productName } potrjeno
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Hvala, ker ste se naročili na { $productName }
subscriptionFirstInvoice-content-processing = Vaše plačilo je trenutno v obdelavi, ki lahko traja do štiri delovne dni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Prejeli boste ločeno e-poštno sporočilo, ki vam bo pomagalo začeti uporabljati { $productName }.
subscriptionFirstInvoice-content-auto-renew = Naročnina se bo samodejno obnovila vsako obračunsko obdobje, razen če se odločite za preklic.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Naslednji račun bo izdan { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Plačilnemu sredstvu za { $productName } je ali bo kmalu potekla veljavnost
subscriptionPaymentExpired-title-2 = Vašemu plačilnemu sredstvu je ali bo kmalu potekla veljavnost
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Plačilnemu sredstvu, ki ga uporabljate za { $productName }, je potekla veljavnost ali mu bo potekla v kratkem.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Plačilo za { $productName } neuspešno
subscriptionPaymentFailed-title = Žal imamo težave z vašim plačilom
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Pri zadnjem plačilu za { $productName } je prišlo do težave.
subscriptionPaymentFailed-content-outdated-1 = Morda je vašemu plačilnemu sredstvu potekla veljavnost ali pa je trenutni način plačila zastarel.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Potrebna je posodobitev podatkov o plačilu za { $productName }
subscriptionPaymentProviderCancelled-title = Žal imamo težave z vašim načinom plačila
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Zaznali smo težavo z vašim načinom plačila za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Morda je vašemu plačilnemu sredstvu potekla veljavnost ali pa je trenutni način plačila zastarel.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Naročnina na { $productName } je ponovno aktivirana
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Hvala, ker ste ponovno aktivirali svojo naročnino na { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Vaše obračunsko obdobje in plačilo bosta ostala enaka. Vaša naslednja bremenitev bo { $invoiceTotal } dne { $nextInvoiceDateOnly }. Vaša naročnina se bo samodejno obnovila vsako obračunsko obdobje, razen če se odločite za preklic.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Obvestilo o samodejnem podaljšanju { $productName }
subscriptionRenewalReminder-title = Vaša naročnina bo kmalu obnovljena
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Spoštovani uporabnik { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Vaša trenutna naročnina je nastavljena za samodejno podaljšanje čez { $reminderLength } dni.
subscriptionRenewalReminder-content-discount-change = Vaš naslednji račun odraža spremembo cene, saj je prejšnji popust potekel in je uveljavljen nov.
subscriptionRenewalReminder-content-discount-ending = Ker je prejšnji popust potekel, se bo naročnina podaljšala po standardni ceni.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = Takrat vam bo { -brand-mozilla } obnovil naročnino na { $planIntervalCount } { $planInterval } in plačilno sredstvo v vašem računu bo nabralo { $invoiceTotal }.
subscriptionRenewalReminder-content-closing = Lep pozdrav,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Ekipa { $productName }
subscriptionReplaced-subject = Vaša naročnina je bila posodobljena v okviru nadgradnje
subscriptionReplaced-title = Vaša naročnina je bila posodobljena
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Vaša posamezna naročnina na { $productName } je bila zamenjana in je zdaj vključena v vašo novo svežnjo.
subscriptionReplaced-content-credit = Prejeli boste dobro za ves neporabljen čas iz prejšnje naročnine. Dobroimetje bo samodejno pripisano vašemu računu in porabljeno za prihodnje stroške.
subscriptionReplaced-content-no-action = Ni vam treba storiti ničesar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Plačilo za { $productName } prejeto
subscriptionSubsequentInvoice-title = Hvala, ker ste naš naročnik!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Prejeli smo vaše zadnje plačilo za { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Naslednji račun bo izdan { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Nadgradili ste na { $productName }
subscriptionUpgrade-title = Hvala za nadgradnjo!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Uspešno ste nadgradili na { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Zaračunali smo vam enkraten prispevek v višini { $invoiceAmountDue }, ki odraža višjo ceno naročnine za preostanek tega obračunskega obdobja ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Na račun ste prejeli dobroimetje v višini { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Od naslednjega računa se bo cena naročnine spreminjala.
subscriptionUpgrade-content-old-price-day = Prejšnja cena je bila { $paymentAmountOld } na dan.
subscriptionUpgrade-content-old-price-week = Prejšnja cena je bila { $paymentAmountOld } na teden.
subscriptionUpgrade-content-old-price-month = Prejšnja cena je bila { $paymentAmountOld } na mesec.
subscriptionUpgrade-content-old-price-halfyear = Prejšnja cena je bila { $paymentAmountOld } za 6 mesecev.
subscriptionUpgrade-content-old-price-year = Prejšnja cena je bila { $paymentAmountOld } na leto.
subscriptionUpgrade-content-old-price-default = Prejšnja cena je bila { $paymentAmountOld } na obračunski interval.
subscriptionUpgrade-content-old-price-day-tax = Prejšnja postavka je bila { $paymentAmountOld } + { $paymentTaxOld } davek na dan.
subscriptionUpgrade-content-old-price-week-tax = Prejšnja postavka je bila { $paymentAmountOld } + { $paymentTaxOld } davek na teden.
subscriptionUpgrade-content-old-price-month-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na mesec.
subscriptionUpgrade-content-old-price-halfyear-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na šest mesecev.
subscriptionUpgrade-content-old-price-year-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na leto.
subscriptionUpgrade-content-old-price-default-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na obračunski interval.
subscriptionUpgrade-content-new-price-day = V prihodnje vam bomo zaračunali { $paymentAmountNew } na dan brez popustov.
subscriptionUpgrade-content-new-price-week = V prihodnje vam bomo zaračunavali { $paymentAmountNew } na teden brez popustov.
subscriptionUpgrade-content-new-price-month = V prihodnje vam bomo zaračunavali { $paymentAmountNew } na mesec brez popustov.
subscriptionUpgrade-content-new-price-halfyear = V prihodnje vam bomo zaračunavali { $paymentAmountNew } na šest mesecev brez popustov.
subscriptionUpgrade-content-new-price-year = V prihodnje vam bomo zaračunali { $paymentAmountNew } na leto brez popustov.
subscriptionUpgrade-content-new-price-default = V prihodnje vam bomo zaračunavali { $paymentAmountNew } za obračunski interval brez popustov.
subscriptionUpgrade-content-new-price-day-dtax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na dan, brez popustov.
subscriptionUpgrade-content-new-price-week-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na teden brez popustov.
subscriptionUpgrade-content-new-price-month-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na mesec, brez popustov.
subscriptionUpgrade-content-new-price-halfyear-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na šest mesecev, brez popustov.
subscriptionUpgrade-content-new-price-year-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na leto, brez popustov.
subscriptionUpgrade-content-new-price-default-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na obračunski interval brez popustov.
subscriptionUpgrade-existing = Če se katera od vaših obstoječih naročnin prekriva s to nadgradnjo, bomo to posodobili in vam poslali ločeno e-poštno sporočilo s podrobnostmi. Če vaša nova naročnina vključuje izdelke, ki zahtevajo namestitev, vam bomo poslali ločeno e-pošto z navodili za namestitev.
subscriptionUpgrade-auto-renew = Naročnina se bo vsako obračunsko obdobje samodejno podaljšala, razen če se odločite za preklic.
subscriptionsPaymentExpired-subject-2 = Plačilnemu sredstvu za vaše naročnine je ali bo kmalu potekla veljavnost
subscriptionsPaymentExpired-title-2 = Vašemu plačilnemu sredstvu je ali bo kmalu potekla veljavnost
subscriptionsPaymentExpired-content-2 = Plačilnemu sredstvu, s katerim plačujete naslednje naročnine, je ali bo kmalu potekla veljavnost.
subscriptionsPaymentProviderCancelled-subject = Potrebna je posodobitev podatkov o plačilu za naročnine { -brand-mozilla(sklon: "rodilnik") }
subscriptionsPaymentProviderCancelled-title = Žal imamo težave z vašim načinom plačila
subscriptionsPaymentProviderCancelled-content-detected = Zaznali smo težavo z vašim načinom plačila za naslednje naročnine.
subscriptionsPaymentProviderCancelled-content-payment-1 = Morda je vašemu plačilnemu sredstvu potekla veljavnost ali pa je trenutni način plačila zastarel.
