## Non-email strings

session-verify-send-push-title-2 = Pla { -product-mozilla-account(case: "gen") } pśizjawiś?
session-verify-send-push-body-2 = Klikniśo how, aby wobkšuśił, až ty to sy
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } jo wobkšuśeński kod { -brand-mozilla }. Płaśi 5 minutow.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Wobkšuśeński { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } jo wótnowjeński kod { -brand-mozilla }. Płaśi 5 minutow.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } jo wótnowjeński kod { -brand-mozilla }. Płaśi 5 minutow.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kod { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="logo { -brand-mozilla }">
subplat-automated-email = To jo awtomatizěrowana mailka; joli sćo ju zamólnje dostał, njetrjebaśo nic cyniś.
subplat-privacy-notice = Powěźeńka priwatnosći
subplat-privacy-plaintext = Powěźeńka priwatnosći:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Dostawaśo toś tu mejlku, dokulaž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") } a wy sćo za { $productName } zregistrěrowany.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Dostawaśo toś tu mejlku, dokulaž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-explainer-multiple-2 = Dostawaśo toś tu mejlku, dokulaž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") } a sćo aboněrował někotare produkty.
subplat-explainer-was-deleted-2 = Dostawaśo toś tu mejlku, dokulaž { $email } jo se zregistrěrowała za  { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-manage-account-2 = Woglědajśo se k swójomu <a data-l10n-name="subplat-account-page">kontowem bokoju</a>, aby nastajenja swójogo { -product-mozilla-account(case: "gen", capitalization: "lower") } zastojał.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Woglědajśo se k swójomu kontowemu bokoju, aby nastajenja swójogo { -product-mozilla-account(case: "gen", capitalization: "lower") } zastojał: { $accountSettingsUrl }
subplat-terms-policy = Wuměnjenja a wótwołańske pšawidła
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Abonement wupowěźeś
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Abonement zasej aktiwěrowaś
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Płaśeńske informacije aktualizěrowaś
subplat-privacy-policy = Pšawidła priwatnosći { -brand-mozilla }
subplat-privacy-policy-2 = Powěźeńka priwatnosći { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Słužbne wuměnjenja { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Pšawniske
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Priwatnosć
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Pšosym wobźělśo se na toś tom <a data-l10n-name="cancellationSurveyUrl">krotkem napšašowanju</a>, aby nam pomagał, naše słužby pólěpšyś.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Pšosym wobźělśo se na toś tom krotkem napšašowanju, aby nam pomagał, naše słužby pólěpšyś:
payment-details = Płaśeńske drobnostki:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numer zliceńki: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } dnja { $invoiceDateOnly } wópisane
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Pśiduca zliceńka: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Płaśeńska metoda:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Płaśeńska metoda: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Płaśeńska metoda: { $cardName } se na { $lastFour } kóńcy
payment-provider-card-ending-in-plaintext = Płaśeńska metoda: Kórta se na { $lastFour } kóńcy
payment-provider-card-ending-in = <b>Płaśeńska metoda:</b> Kórta se na { $lastFour } kóńcy
payment-provider-card-ending-in-card-name = <b>Płaśeńska metoda:</b> { $cardName } se na { $lastFour } kóńcy
subscription-charges-invoice-summary = Zespominanje zliceńki

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numer zliceńki:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numer zliceńki: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Późělna płaśizna
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Późělna płaśizna: { $remainingAmountTotal }
subscription-charges-list-price = Lisćinowa płaśizna
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Lisćinowa płaśizna: { $offeringPrice }
subscription-charges-credit-from-unused-time = Pśipisanje z njewužytego casa na konto
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Pśipisanje z njewužytego casa na konto: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Mjazywuslědk</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Mjazysuma: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Jadnorazowy rabat
subscription-charges-one-time-discount-plaintext = Jadnorazowy rabat: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-mjasecny rabat
        [two] { $discountDuration }-mjasecny rabat
        [few] { $discountDuration }-mjaseny rabat
       *[other] { $discountDuration }-mjasecny rabat
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-mjasecny rabat: { $invoiceDiscountAmount }
        [two] { $discountDuration }-mjasecny rabat: { $invoiceDiscountAmount }
        [few] { $discountDuration }-mjasecny rabat: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-mjasecny rabat: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabat
subscription-charges-discount-plaintext = Rabat: { $invoiceDiscountAmount }
subscription-charges-taxes = Danki a płaśonki
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Danki a płaśonki: { $invoiceTaxAmount }
subscription-charges-total = <b>Dogromady</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Dogromady: { $invoiceTotal }
subscription-charges-credit-applied = Pśipisanje na konto jo nałožone
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Pśipisanje na konto jo nałožone: { $creditApplied }
subscription-charges-amount-paid = <b>Suma zapłaśona</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Suma zapłaśona: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Sćo dostał kontowy plus { $creditReceived }, kótaryž se do wašych pśichodnych zliceńkow zalicyjo.

##

subscriptionSupport = Maśo pšašanja wó swójom abonemenśe? Naš <a data-l10n-name="subscriptionSupportUrl">team pomocy</a> jo how, aby wam pomagał.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Maśo pšašanja wó swójom abonemenśe? Naš team pomocy jo how, aby wam pomagał:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Wjeliki źěk, až sćo aboněrował { $productName }. Jolic pšašanja wó swójom abonemenśe maśo abo wěcej informacijow wó { $productName }s trjebaśo,  <a data-l10n-name="subscriptionSupportUrl">stajśo se pšosym z nami do zwiska</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Wjeliki źěk, až sćo aboněrował { $productName } Jolic pšašanja wó swójom abonemenśe maśo abo wěcej informacijow wó { $productName } trjebaśo,  stajśo se pšosym z nami do zwiska.
subscription-support-get-help = Wobstarajśo se pomoc za swój abonement
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Zastojśo swój abonement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Zastojśo swój abonement:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Z pomocu kontaktěrowaś</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Z pomocu kontaktěrowaś:
subscriptionUpdateBillingEnsure = Móžośo <a data-l10n-name="updateBillingUrl">how</a> zawěsćiś, až waša płaśeńska metoda a waše kontowe informacije su aktualne:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Móžośo how zawěsćiś, až waša płaśeńska metoda a waše kontowe informacije su aktualne:
subscriptionUpdateBillingTry = Buźomy wopytowaś, wašo płaśenje za pśiduce dny znowego pśewjasć, ale musyśo snaź <a data-l10n-name="updateBillingUrl">swóje płaśeńske informacije aktualizěrowaś</a>, aby nam pomagali, problem rozwězaś.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Buźomy wopytowaś, wašo płaśenje za pśiduce dny znowego pśewjasć, ale musyśo snaź swóje płaśeńske informacije aktualizěrowaś, aby nam pomagali, problem rozwězaś.
subscriptionUpdatePayment = Aby se pśetergnjenja swójeje słužby wobinuł, <a data-l10n-name="updateBillingUrl">aktualizěrujśo pšosym swóje płaśeńske informacije</a> tak skóro ako móžno.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Aby se pśetergnjenja swójeje słužby wobinuł, aktualizěrujśo pšosym swóje płaśeńske informacije tak skóro ako móžno:
view-invoice-link-action = Zliceńku se woglědaś
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Zliceńku pokazaś: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Witajśo k { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Witajśo k { $productName }
downloadSubscription-content-2 = Zachopśo wšykne funkcije w swójom abonemenśe wužywaś:
downloadSubscription-link-action-2 = Prědne kšace
fraudulentAccountDeletion-subject-2 = Wašo { -product-mozilla-account } jo se wulašowało
fraudulentAccountDeletion-title = Wašo konto jo se wulašowało
fraudulentAccountDeletion-content-part1-v2 = Njedawno jo se załožyło { -product-mozilla-account } a abonement jo se wótlicył z pomocu toś teje e-mailoweje adrese. Ako pśi wšych kontach smy was pšosyli, toś tu e-mailowa adresu wobkšuśiś, aby wy swójo konto wobkšuśił.
fraudulentAccountDeletion-content-part2-v2 = Tuchylu wiźimy, až konto njejo se nigdy wobkšuśiło. Dokulaž toś ten kšac njejo se dokóńcył, njejsmy se wěste, lěc to jo było awtorizěrowany abonement. Togodla jo se { -product-mozilla-account } wulašowało, kótarež jo se zregistrěrowało z toś teju e-mailoweju adresu, a waš abonement jo se wupowěźeł ze zarunanim wšych płaśonkow.
fraudulentAccountDeletion-contact = Jolic pšašanja maśo, stajśo se z našym <a data-l10n-name="mozillaSupportUrl">teamom pomocy</a> do zwiska.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Jolic pšašanja maśo, stajśo se pšosym z našym teamom pomocy do zwiska: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Waš abonement { $productName } jo se wótskazał
subscriptionAccountDeletion-title = Škóda, až wótejźośo
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Sćo njedawno wulašował swójo { -product-mozilla-account(case: "acc", capitalization: "lower") }. Togodla smy wótskazali waš abonement { $productName }. Wašo kóńcne płaśenje { $invoiceTotal } jo se zapłaśiło dnja { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Dopominanje: Dokóńcćo konfigurěrowanje swójogo konta
subscriptionAccountReminderFirst-title = Hysći njamaśo pśistup k swójomu abonementoju
subscriptionAccountReminderFirst-content-info-3 = Pśed někotarymi dnjami sćo załožył { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale njejsćo jo ženje wobkšuśił. Naźijamy se, až konfigurěrowanje swójogo konta dokóńcyśo, aby mógał wužywaś swój nowy abonement.
subscriptionAccountReminderFirst-content-select-2 = Wubjeŕśo „Gronidło napóraś“, aby nowe gronidło nastajił a pśeglědanje swójogo konta dokóńcył.
subscriptionAccountReminderFirst-action = Gronidło napóraś
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Slědne dopominanje: Konfigurěrujśo swójo konto
subscriptionAccountReminderSecond-title-2 = Witajśo k { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Pśed někotarymi dnjami sćo załožył { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale njejsćo jo ženje wobkšuśił. Naźijamy se, až konfigurěrowanje swójogo konta dokóńcyśo, aby mógał wužywaś swój nowy abonement.
subscriptionAccountReminderSecond-content-select-2 = Wubjeŕśo „Gronidło napóraś“, aby nowe gronidło nastajił a pśeglědanje swójogo konta dokóńcył.
subscriptionAccountReminderSecond-action = Gronidło napóraś
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Waš abonement { $productName } jo se wótskazał
subscriptionCancellation-title = Škóda, až wótejźośo

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Smy wupowěźeli waš abonement za { $productName }. Wašo kóńcne płaśenje { $invoiceTotal } jo se stało dnja { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Smy wupowěźeli waš abonement za { $productName }. Wašo kóńcne płaśenje { $invoiceTotal } se dnja { $invoiceDateOnly } stanjo.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Waša słužba se až do kóńca wašogo aktualnego casa wótliceja pókšacujo, kótaryž jo { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Sćo pśejšeł k { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Sćo wuspěšnje pśejšeł wót { $productNameOld } do { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Zachopinajucy z wašeju pśiduceju zliceńku se waš płaśonk wót { $paymentAmountOld } na { $productPaymentCycleOld } do { $paymentAmountNew } pśez { $productPaymentCycleNew } změnijo. Pótom teke jadnorazowe pśipisanje { $paymentProrated } na konto dostanjośo, aby se nišy płaśonk za zbytk { $productPaymentCycleOld } wótbłyšćował.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Jolic musyśo nowu softwaru instalěrowaś, aby { $productName } wužywał, dostanjośo separatnu mejlku ze ześěgnjeńskimi instrukcijami.
subscriptionDowngrade-content-auto-renew = Waš abonement se awtomatiski kuždy cas wótlicenja pśedlejšyjo, snaźkuli wupowěźejośo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Waš abonement { $productName } skóro spadnjo
subscriptionEndingReminder-title = Waš abonement { $productName } skóro spadnjo
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Waš pśistup k { $productName } se dnja <strong>{ $serviceLastActiveDateOnly }</strong> skóńcyjo.
subscriptionEndingReminder-content-line2 = Jolic rad cośo { $productName } dalej wužywaś, móžośo swój abonement w <a data-l10n-name="subscriptionEndingReminder-account-settings">kontowych nastajenjach</a> pśed <strong>{ $serviceLastActiveDateOnly }</strong> reaktiwěrowaś. Jolic pomoc trjebaśo, <a data-l10n-name="subscriptionEndingReminder-contact-support">stajśo se z našym teamom pomocy do zwiska</a>.
subscriptionEndingReminder-content-line1-plaintext = Waš pśistup k { $productName } se dnja { $serviceLastActiveDateOnly } skóńcyjo.
subscriptionEndingReminder-content-line2-plaintext = Jolic rad cośo { $productName } dalej wužywaś, móžośo swój abonement w kontowych nastajenjach pśed { $serviceLastActiveDateOnly } reaktiwěrowaś. Jolic pomoc trjebaśo, stajśo se z našym teamom pomocy do zwiska.
subscriptionEndingReminder-content-closing = Źěkujomy se, až sćo wažony abonent!
subscriptionEndingReminder-churn-title = Cośo pśistup wobchowaś?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Płaśe wobgranicowane wuměnjenja a wobgranicowanja</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Płaśe wobgranicowane wuměnjenja a wobgranicowanja: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Stajśo se z našym teamom pomocy do zwiska: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Waš abonement { $productName } jo se wótskazał
subscriptionFailedPaymentsCancellation-title = Waš abonement jo se wupowěźeł
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Smy wupowěźeli waš abonement { $productName }, dokulaž někotare płaśeńske wopyty njejsu se raźili. Aby znowegu pśistup měł, startujśo nowy abonement ze zaktualizěrowaneju płaśeńskeju metodu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Płaśenje { $productName } wobkšuśone
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Wjeliki źěk, až sćo aboněrował { $productName }
subscriptionFirstInvoice-content-processing = Wašo płaśenje se tuchylu pśeźěłujo a móžo až do styrich wobchodnych dnjow traś.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Dostanjośo separatnu mejlku wó tom, kak móžośo zachopiś { $productName } wužywaś.
subscriptionFirstInvoice-content-auto-renew = Waš abonement se awtomatiski kuždy cas wótlicenja pśedlejšyjo, snaźkuli wupowěźejośo.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Waša pśiduca zliceńka se dnja { $nextInvoiceDateOnly } wudajo.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Płaśeńska metoda za { $productName } jo spadnuła abo skóro spadnjo
subscriptionPaymentExpired-title-2 = Waša płaśeńska metoda jo spadnuła abo skóro spadnjo
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Płaśeńska metoda, kótaruž za { $productName } wužywaśo, jo spadnuła abo skóro spadnjo.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Płaśenje { $productName } njejo se raźiło
subscriptionPaymentFailed-title = Bóžko mamy problemy z wašym płaśenim
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Sym měli problem z wašym nejnowšym płaśenim za { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Waša płaśeńska metoda jo snaź spadnuła, abo waša aktualna płaśeńska metoda jo zestarjona.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Aktualizěrowanje płaśeńskich informacijow jo za { $productName } trjebne
subscriptionPaymentProviderCancelled-title = Bóžko mamy problemy z wašeju płaśeńskeju metodu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Smy měli problem z wašeju nejnowšeju płaśeńskeju metodu za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Waša płaśeńska metoda jo snaź spadnuła, abo waša aktualna płaśeńska metoda jo zestarjona.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonement{ $productName } jo se zasej zaktiwěrował
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Wjeliki źěk, až sćo zasej zaktiwěrował swój abonement { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Waš wótliceński cyklus a płaśenje samskej wóstanjotej. Waša pśiduce wótpisanje { $invoiceTotal } buźo dnja { $nextInvoiceDateOnly }. Waš abonement se pó kuždej wótliceńskej perioźe awtomatiski wótnowja, snaźkuli jen wupowěźejośo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Powěźeńka wó awtomatiskem pśedlejšenju { $productName }
subscriptionRenewalReminder-title = Waš abonement se skóro pśedlejšyjo
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Luby kupc { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Waš aktualny abonement se awtomatiski na wótnowjenje za někotare dny staja: { $reminderLength }.
subscriptionRenewalReminder-content-discount-change = Waša pśiduca zliceńka změnu pśi twórjenju płaśiznow wótbłyšćujo, dokulaž pjerwjejšny rabat wěcej njepłaśi a nowy rabat jo se južo nałožył.
subscriptionRenewalReminder-content-discount-ending = Dokulaž pjerwjejšny rabat jo skóńcony, se waš abonement na standardnu płaśiznu slědk stajijo.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Pón { -brand-mozilla } waš wšedny abonement pódlejšujo a suma { $invoiceTotalExcludingTax } + { $invoiceTax } danka se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-with-tax-week = Pón { -brand-mozilla } waš tyźeński abonement pódlejšujo a suma { $invoiceTotalExcludingTax } + { $invoiceTax } danka se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-with-tax-month = Pón { -brand-mozilla } waš mjasecny abonement pódlejšujo a suma { $invoiceTotalExcludingTax } + { $invoiceTax } danka se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Pón { -brand-mozilla } waš šesćmjasecny abonement pódlejšujo a suma { $invoiceTotalExcludingTax } + { $invoiceTax } danka se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-with-tax-year = Pón { -brand-mozilla } waš lětny abonement pódlejšujo a suma { $invoiceTotalExcludingTax } + { $invoiceTax } danka se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-with-tax-default = Pón { -brand-mozilla } waš abonement pódlejšujo a suma { $invoiceTotalExcludingTax } + { $invoiceTax } danka se na płaśeńsku metodu we wašom konśe nałožyjo.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Pón { -brand-mozilla } waš wšedny abonement pódlejšujo a suma { $invoiceTotal } se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-invoice-total-week = Pón { -brand-mozilla } waš tyźeński abonement pódlejšujo a suma { $invoiceTotal } se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-invoice-total-month = Pón { -brand-mozilla } waš mjasecny abonement pódlejšujo a suma { $invoiceTotal } se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Pón { -brand-mozilla } waš šesćmjasecny abonement pódlejšujo a suma { $invoiceTotal } se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-invoice-total-year = Pón { -brand-mozilla } waš lětny abonement pódlejšujo a suma { $invoiceTotal } se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-charge-invoice-total-default = Pón { -brand-mozilla } waš abonement pódlejšujo a suma { $invoiceTotal } se na płaśeńsku metodu we wašom konśe nałožyjo.
subscriptionRenewalReminder-content-closing = Z pśijaśelnym póstrowom
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Team { $productName }
subscriptionReplaced-subject = Waš abonement jo se zaktualizěrował ako źěl wašeje aktualizacije
subscriptionReplaced-title = Waš abonement jo se zaktualizěrował
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Waš jadnotliwy abonement { $productName } jo se wuměnił a jo něnto we wašom pakeśe wopśimjony.
subscriptionReplaced-content-credit = Dostanjośo pśipisanje za njewužyty cas ze swójogo pjerwjejšnego abonementa. Toś to pśipisanje se awtomatiski na wašo konto nałožyjo a za pśichodne płaśonki wužywa.
subscriptionReplaced-content-no-action = Z wašogo boka akcija njejo trjebna.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Płaśenje { $productName } dostane
subscriptionSubsequentInvoice-title = Wjeliki źěk, až sćo abonent!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Smy dostali waše nejnowše płaśenje za { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Waša pśiduca zliceńka se dnja { $nextInvoiceDateOnly } wudajo.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Sćo aktualizěrował na { $productName }
subscriptionUpgrade-title = Wjeliki źěk za aktualizěrowanje!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sćo wuspěšnje aktualizěrował na { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Wam jo se jadnorazowy płaśonk { $invoiceAmountDue } woblicył, aby se wuša płaśizna wašogo abonementa za zbytk toś teje wótliceńskeje periody wótbłyšćowała ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Sćo dostał kontowy plus we wusokosći { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Zachopinajucy z wašeju pśiduceju zliceńku, se płaśizna wašogo abonementa změnijo.
subscriptionUpgrade-content-old-price-day = Pjerwjejšny płaśonk jo był { $paymentAmountOld } na źeń.
subscriptionUpgrade-content-old-price-week = Pjerwjejšny płaśonk jo był { $paymentAmountOld } na tyźeń.
subscriptionUpgrade-content-old-price-month = Pjerwjejšny płaśonk jo był { $paymentAmountOld } na mjasec.
subscriptionUpgrade-content-old-price-halfyear = Pjerwjejšny płaśonk jo był { $paymentAmountOld } na šesć mjasecow.
subscriptionUpgrade-content-old-price-year = Pjerwjejšny płaśonk jo był { $paymentAmountOld } na lěto.
subscriptionUpgrade-content-old-price-default = Pjerwjejšny płaśonk jo był { $paymentAmountOld } na wótliceński interwal.
subscriptionUpgrade-content-old-price-day-tax = Pjerwjejšny płaśonk jo był { $paymentAmountOld } + { $paymentTaxOld } danka na źeń.
subscriptionUpgrade-content-old-price-week-tax = Pjerwjejšny płaśonk jo był { $paymentAmountOld } + { $paymentTaxOld } danka na tyźeń.
subscriptionUpgrade-content-old-price-month-tax = Pjerwjejšny płaśonk jo był { $paymentAmountOld } + { $paymentTaxOld } danka na mjasec.
subscriptionUpgrade-content-old-price-halfyear-tax = Pjerwjejšny płaśonk jo był { $paymentAmountOld } + { $paymentTaxOld } danka na šesć mjasecow.
subscriptionUpgrade-content-old-price-year-tax = Pjerwjejšny płaśonk jo był { $paymentAmountOld } + { $paymentTaxOld } danka na lěto.
subscriptionUpgrade-content-old-price-default-tax = Pjerwjejšny płaśonk jo był { $paymentAmountOld } + { $paymentTaxOld } danka na wótliceński interwal.
subscriptionUpgrade-content-new-price-day = Wótněnta musyśo { $paymentAmountNew } na źeń płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-week = Wótněnta musyśo { $paymentAmountNew } na tyźeń płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-month = Wótněnta musyśo { $paymentAmountNew } na mjasec płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-halfyear = Wótněnta musyśo { $paymentAmountNew } na šesć mjasecow płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-year = Wótněnta musyśo { $paymentAmountNew } na lěto płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-default = Wótněnta musyśo { $paymentAmountNew } na wótliceński interwal płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-day-dtax = Wótněnta musyśo { $paymentAmountNew } + { $paymentTaxNew } danka na źeń płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-week-tax = Wótněnta musyśo { $paymentAmountNew } + { $paymentTaxNew } danka na tyźeń płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-month-tax = Wótněnta musyśo { $paymentAmountNew } + { $paymentTaxNew } danka na mjasec płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-halfyear-tax = Wótněnta musyśo { $paymentAmountNew } + { $paymentTaxNew } danka na šesć mjasecow płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-year-tax = Wótněnta musyśo { $paymentAmountNew } + { $paymentTaxNew } danka na lěto płaśiś, mimo rabatow.
subscriptionUpgrade-content-new-price-default-tax = Wótněnta musyśo { $paymentAmountNew } + { $paymentTaxNew } danka na wótliceński interwal płaśiś, mimo rabatow.
subscriptionUpgrade-existing = Jolic se jaden z wašych eksistěrujucych abonementow z toś teju aktualizaciju prěkuju, buźomy se z nim zaběraś a wam separatnu mejlku z drobnostkami słaś. Jolic waš nowy plan produkty wopśimujo, kótarež se instalaciju pominaju, buźomy wam separatnu mejlku z instalaciskimi instrukcijami słaś.
subscriptionUpgrade-auto-renew = Waš abonement se awtomatiski kuždy cas wótlicenja pśedlejšyjo, snaźkuli wupowěźejośo.
subscriptionsPaymentExpired-subject-2 = Płaśeńska metoda za swóje abonementy jo spadnuła abo skóro spadnjo
subscriptionsPaymentExpired-title-2 = Waša płaśeńska metoda jo spadnuła abo skóro spadnjo
subscriptionsPaymentExpired-content-2 = Płaśeńska metoda, z kótarejuž płaśenja za slědujuce abonementy pśewjeźośo, jo spadnuła abo skóro spadnjo.
subscriptionsPaymentProviderCancelled-subject = Aktualizěrowanje płaśeńskich informacijow jo za abonementy { -brand-mozilla } trjebne
subscriptionsPaymentProviderCancelled-title = Bóžko mamy problemy z wašeju płaśeńskeju metodu
subscriptionsPaymentProviderCancelled-content-detected = Smy měli problem z wašeju nejnowšeju płaśeńskeju metodu za slědujuce abonementy.
subscriptionsPaymentProviderCancelled-content-payment-1 = Waša płaśeńska metoda jo snaź spadnuła, abo waša aktualna płaśeńska metoda jo zestarjona.
