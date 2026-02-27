## Non-email strings

session-verify-send-push-title-2 = Pola { -product-mozilla-account(case: "gen") } přizjewić?
session-verify-send-push-body-2 = Klikńće tu, zo byšće wobkrućił, zo ty to sy
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je wobkrućenski kod { -brand-mozilla }. Płaći 5 mjeńšin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Wobkrućenski kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je wobnowjenski kod { -brand-mozilla }. Płaći 5 mjeńšin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je wobnowjenski kod { -brand-mozilla }. Płaći 5 mjeńšin.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kod { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="logo { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="logo { -brand-mozilla }">
subplat-automated-email = To je awtomatizowana e-mejlka; jeli sće ju zmylnje dóstał, njetrjebaće ničo činić.
subplat-privacy-notice = Zdźělenka priwatnosće
subplat-privacy-plaintext = Zdźělenka priwatnosće:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Dóstawaće tutu mejlku, dokelž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") } a wy sće za { $productName } zregistrowany.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Dóstawaće tutu mejlku, dokelž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-explainer-multiple-2 = Dóstawaće tutu mejlku, dokelž { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") } a sće wjacore produkty abonował.
subplat-explainer-was-deleted-2 = Dóstawaće tutu mejlku, dokelž { $email } je so za { -product-mozilla-account(case: "acc", capitalization: "lower") } zregistrowała.
subplat-manage-account-2 = Wopytajće swoju <a data-l10n-name="subplat-account-page">kontowu stronu</a>, zo byšće swoje nastajenja { -product-mozilla-account(case: "acc", capitalization: "lower") } rjadował.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Wopytajće swoju kontowu stronu, zo byšće swoje nastajenja { -product-mozilla-account(case: "acc", capitalization: "lower") } rjadował: { $accountSettingsUrl }
subplat-terms-policy = Wuměnjenja a wotwołanske prawidła
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Abonement wupowědźić
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Abonement zaso aktiwizować
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Płaćenske informacije aktualizować
subplat-privacy-policy = Prawidła priwatnosće { -brand-mozilla }
subplat-privacy-policy-2 = Zdźělenka priwatnosće { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Słužbne wuměnjenja { -product-mozilla-accounts(case: "gen", capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Prawniske
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Priwatnosć
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Prošu wobdźělće so na tutym <a data-l10n-name="cancellationSurveyUrl">krótkim naprašowanju</a>, zo byšće nam pomhał, naše słužby polěpšić.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Prošu wobdźělće so na tutym krótkim naprašowanju, zo byšće nam pomhał, naše słužby polěpšić:
payment-details = Płaćenske podrobnosće:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Čisło zličbowanki: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = { $invoiceTotal } dnja { $invoiceDateOnly } wotknihowane
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Přichodna zličbowanka: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Płaćenska metoda:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Płaćenska metoda: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Płaćenska metoda: { $cardName } so na { $lastFour } kónči
payment-provider-card-ending-in-plaintext = Płaćenska metoda: Karta so na { $lastFour } kónči
payment-provider-card-ending-in = <b>Płaćenska metoda:</b> Karta so na { $lastFour } kónči
payment-provider-card-ending-in-card-name = <b>Płaćenska metoda:</b> { $cardName } so na { $lastFour } kónči
subscription-charges-invoice-summary = Zjeće zličbowanki

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Čisło zličbowanki:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Čisło zličbowanki: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Podźělna płaćizna
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Podźělna płaćizna: { $remainingAmountTotal }
subscription-charges-list-price = Lisćinowa płaćizna
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Lisćinowa płaćizna: { $offeringPrice }
subscription-charges-credit-from-unused-time = Dobropis za njezwužity čas
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Dobroměće z njewužiteho časa: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Mjezywuslědk</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Mjezysuma: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Jónkróćny rabat
subscription-charges-one-time-discount-plaintext = Jónkróćny rabat: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-měsačny rabat
        [two] { $discountDuration }-měsačny rabat
        [few] { $discountDuration }-měsačny rabat
       *[other] { $discountDuration }-měsačny rabat
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
        [two] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
        [few] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-měsačny rabat: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabat
subscription-charges-discount-plaintext = Rabat: { $invoiceDiscountAmount }
subscription-charges-taxes = Dawki a popłatki
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Dawki a popłatki: { $invoiceTaxAmount }
subscription-charges-total = <b>Dohromady</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Dohromady: { $invoiceTotal }
subscription-charges-credit-applied = Dobroměće je nałožene
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Dobroměće nałožene: { $creditApplied }
subscription-charges-amount-paid = <b>Suma zapłaćena</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Suma zapłaćena: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Sće dobroměće { $creditReceived } dóstał, kotrež so z wašimi přichodnymi zličbowankami rozličujo.

##

subscriptionSupport = Maće prašenja wo swojim abonemenće? Naš <a data-l10n-name="subscriptionSupportUrl">team pomocy</a> je tu, zo by wam pomhał.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Maće prašenja wo swojim abonemenće? Naš team pomocy je tu, zo by wam pomhał:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Wulki dźak, zo sće { $productName } abonował. Jeli prašenja wo swojim abonemenće maće abo wjace informacijow wo { $productName } trjebaće,  <a data-l10n-name="subscriptionSupportUrl">stajće so prošu z nami do zwiska</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Wulki dźak, zo sće { $productName } abonował. Jeli prašenja wo swojim abonemenće maće abo wjace informacijow wo { $productName }s trjebaće,  stajće so prošu z nami do zwiska.
subscription-support-get-help = Wobstarajće sej pomoc za swój abonement
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Rjadujće swój abonement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Rjadujće swój abonement:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Pomoc skontaktować</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Pomoc skontaktować:
subscriptionUpdateBillingEnsure = Móžeće <a data-l10n-name="updateBillingUrl">tu</a> zawěsćić, zo waša płaćenska metoda a waše kontowe informacije su aktualne:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Móžeće tu zawěsćić, zo waša płaćenska metoda a waše kontowe informacije su aktualne:
subscriptionUpdateBillingTry = Budźemy pospytować, waše płaćenje za přichodne dny znowa přewjesć, ale dyrbiće snano <a data-l10n-name="updateBillingUrl">swoje płaćenske informacije aktualizować</a>, zo byšće nam pomhali, problem rozrisać.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Budźemy pospytować, waše płaćenje za přichodne dny znowa přewjesć, ale dyrbiće snano swoje płaćenske informacije aktualizować, zo byšće nam pomhali, problem rozrisać.
subscriptionUpdatePayment = Zo byšće přetorhnjenje swojeje słužby wobešoł, <a data-l10n-name="updateBillingUrl">aktualizujće prošu swoje płaćenske informacije</a> tak bórze kaž móžno.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Zo byšće přetorhnjenje swojeje słužby wobešoł, aktualizujće prošu swoje płaćenske informacije tak bórze kaž móžno:
view-invoice-link-action = Zličbowanku wobhladać
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Zličbowanku pokazać: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Witajće k { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Witajće k { $productName }
downloadSubscription-content-2 = Započńće wšě funkcije w swojim abonemenće wužiwać:
downloadSubscription-link-action-2 = Prěnje kroki
fraudulentAccountDeletion-subject-2 = Waše { -product-mozilla-account(captialization: "lower") } je so zhašało
fraudulentAccountDeletion-title = Waše konto je so zhašało
fraudulentAccountDeletion-content-part1-v2 = Njedawno je so { -product-mozilla-account(capitalization: "lower") } załožiło a abonement je so z pomocu tuteje e-mejloweje adresy wotličił. Kaž při wšěch kontach smy was prosyli, tutu e-mejlowa adresu wobkrućić, zo byšće swoje konto wobkrućił.
fraudulentAccountDeletion-content-part2-v2 = Tuchwilu widźimy, zo konto njeje so ženje wobkrućiło. Dokelž tutón krok njeje so dokónčił, njejsmy sej wěsći, hač to je awtorizowany abonement było. Tohodla je so { -product-mozilla-account(capitalization: "lower") }, kotrež je so z tutej e-mejlowej adresu zregistrowało, zhašało a waš abonement je so wupowědźił zarunujo wšě popłatki.
fraudulentAccountDeletion-contact = Jeli prašenja maće, stajće so z našim <a data-l10n-name="mozillaSupportUrl">teamom pomocy</a> do zwiska.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Jeli prašenja maće, stajće so prošu z našim teamom pomocy do zwiska: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Waš abonement { $productName } je so wotskazał
subscriptionAccountDeletion-title = Škoda, zo woteńdźeće
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Sće njedawno swoje { -product-mozilla-account(case: "acc", capitalization: "lower") } zhašał. Tohodla smy waš abonement { $productName } wotskazali. Waše kónčne płaćenje { $invoiceTotal } je so dnja { $invoiceDateOnly } zapłaćiło.
subscriptionAccountReminderFirst-subject = Dopomnjeće: Dokónčće konfigurowanje swojeho konta
subscriptionAccountReminderFirst-title = Hisće nimaće přistup k swojemu abonementej
subscriptionAccountReminderFirst-content-info-3 = Před někotrymi dnjemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo ženje wobkrućił. Nadźijamy so, zo konfigurowanje swojeho konta dokónčiće, zo byšće swój nowy abonement wužiwać móhł.
subscriptionAccountReminderFirst-content-select-2 = Wubjerće „Hesło wutworić“, zo byšće nowe hesło nastajił a přepruwowanje swojeho konta dokónčił.
subscriptionAccountReminderFirst-action = Hesło wutworić
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Poslednje dopomnjeće: Konfigurujće swoje konto
subscriptionAccountReminderSecond-title-2 = Witajće k { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Před někotrymi dnjemi sće { -product-mozilla-account(case: "acc", capitalization: "lower") } załožił, ale njejsće jo ženje wobkrućił. Nadźijamy so, zo konfigurowanje swojeho konta dokónčiće, zo byšće swój nowy abonement wužiwać móhł.
subscriptionAccountReminderSecond-content-select-2 = Wubjerće „Hesło wutworić“, zo byšće nowe hesło nastajił a přepruwowanje swojeho konta dokónčił.
subscriptionAccountReminderSecond-action = Hesło wutworić
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Waš abonement { $productName } je so wotskazał
subscriptionCancellation-title = Škoda, zo woteńdźeće

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Smy waš abonement za { $productName } wupowědźili. Waše kónčne płaćenje { $invoiceTotal } je so dnja { $invoiceDateOnly } sćiniło.
subscriptionCancellation-outstanding-content-2 = Smy waš abonement za { $productName } wupowědźili. Waše kónčne płaćenje { $invoiceTotal } so dnja { $invoiceDateOnly } sćini.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Waša słužba so hač do kónca wašeho aktualneho wotličenskeje doby pokročuje, kotraž je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Sće k { $productName } přešoł
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Sće wuspěšnje wot { $productNameOld } do { $productName } přeměnił.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Započinajo z wašej přichodnej zličbowanku so waš popłatk wot { $paymentAmountOld } přez { $productPaymentCycleOld } do { $paymentAmountNew } přez { $productPaymentCycleNew } změni. Potom tež jónkróćny dobropis { $paymentProrated } dóstanjeće, zo by so niši popłatk za zbytk { $productPaymentCycleOld } wotbłyšćował.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Jeli dyrbiće nowu softwaru instalować, zo byšće { $productName }s wužiwał, dóstanjeće separatnu mejlku ze sćehnjenskimi instrukcijemi.
subscriptionDowngrade-content-auto-renew = Waš abonement so awtomatisce kóždu wotličensku dobu podlěšuje, chibazo wupowědźiće.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Waš abonement { $productName } bórze spadnje
subscriptionEndingReminder-title = Waš abonement { $productName } bórze spadnje
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Waš přistup k { $productName } so dnja <strong>{ $serviceLastActiveDateOnly }</strong> skónči.
subscriptionEndingReminder-content-line2 = Jeli rady chceće { $productName } dale wužiwać, móžeće swój abonement w <a data-l10n-name="subscriptionEndingReminder-account-settings">kontowych nastajenjach</a> před <strong>{ $serviceLastActiveDateOnly }</strong> reaktiwizować. Jeli pomoc trjebaće, <a data-l10n-name="subscriptionEndingReminder-contact-support">stajće so z našim teamom pomocy do zwiska</a>.
subscriptionEndingReminder-content-line1-plaintext = Waš přistup k { $productName } so dnja { $serviceLastActiveDateOnly } skónči.
subscriptionEndingReminder-content-line2-plaintext = Jeli rady chceće { $productName } dale wužiwać, móžeće swój abonement w kontowych nastajenjach před { $serviceLastActiveDateOnly } reaktiwizować. Jeli pomoc trjebaće, stajće so z našim teamom pomocy do zwiska.
subscriptionEndingReminder-content-closing = Dźakujemy so, zo sće waženy abonent!
subscriptionEndingReminder-churn-title = Chceće přistup wobchować?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Płaća wobmjezowane wuměnjenja a wobmjezowanja</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Płaća wobmjezowane wuměnjenja a wobmjezowanja: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Stajće so z našim teamom pomocy do zwiska: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Waš abonement { $productName } je so wotskazał
subscriptionFailedPaymentsCancellation-title = Waš abonement je so wupowědźił
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Smy waš abonement { $productName } wupowědźili, dokelž wjacore płaćenske pospyty njejsu so poradźili. Zo byšće znowa přistup měł, startujće nowy abonement ze zaktualizowanej płaćenskej metodu.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Płaćenje { $productName } wobkrućene
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Wulki dźak, zo sće { $productName } abonował
subscriptionFirstInvoice-content-processing = Waše płaćenje so tuchwilu předźěłuje a móže do štyrjoch wobchodnych dnjow trać.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Dóstanjeće separatnu mejlku wo tym, kak móžeće započeć { $productName } wužiwać.
subscriptionFirstInvoice-content-auto-renew = Waš abonement so awtomatisce kóždu wotličensku dobu podlěšuje, chibazo wupowědźiće.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Waša přichodna zličbowanka so dnja { $nextInvoiceDateOnly } wuda.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Płaćenska metoda za { $productName } je spadnyła abo bórze spadnje
subscriptionPaymentExpired-title-2 = Waša płaćenska metoda je spadnyła abo bórze spadnje
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Płaćenska metoda, kotruž za { $productName } wužiwaće, je spadnyła abo bórze spadnje.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Płaćenje { $productName } je so nimokuliło
subscriptionPaymentFailed-title = Bohužel mamy problemy z wašim płaćenjom
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Mějachmy problem z wašim najnowšim płaćenjom za { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Waša płaćenska metoda je snano spadnjena, abo waša aktualna płaćenska metoda je zestarjena.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Aktualizowanje płaćenskich informacijow je za { $productName } trěbne
subscriptionPaymentProviderCancelled-title = Bohužel mamy problemy z wašej płaćenskej metodu
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Mějachmy problem z wašej płaćenskej metodu za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Waša płaćenska metoda je snano spadnjena, abo waša aktualna płaćenska metoda je zestarjena.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonement { $productName } je so zaso zaktiwizował
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Wulki dźak, zo sće zaso zaktiwizował swój abonement { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Waš wotličenski cyklus a płaćenje samsnej wostanjetej. Waša přichodna wotknihownje budźe { $invoiceTotal } dnja { $nextInvoiceDateOnly }. Waš abonement so po kóždej wotličenskej periodźe awtomatisce wobnowja, chibazo jón wupowědźiće.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Zdźělenka wo awtomatiskim podlěšenju { $productName }
subscriptionRenewalReminder-title = Waš abonement so bórze podlěši
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Luby kupc { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Waš aktualny abonement so awtomatisce na wobnowjenje za někotre dny staja: { $reminderLength }.
subscriptionRenewalReminder-content-discount-change = Waša přichodna zličbowanka změnu při tworjenju płaćiznow wotbłyšćuje, dokelž předchadny rabat hižo njepłaći a nowy rabat je so hižo nałožił.
subscriptionRenewalReminder-content-discount-ending = Dokelž prjedawši rabat je skónčeny, so waš abonement na standardnu płaćiznu wróći staji.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = Potom { -brand-mozilla } waš abonement { $planIntervalCount } { $planInterval } podlěši a suma { $invoiceTotal } so na płaćensku metodu we wašim konće nałoži.
subscriptionRenewalReminder-content-closing = Z přećelnym postrowom
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Team { $productName }
subscriptionReplaced-subject = Waš abonement je so jako dźěl wašeje aktualizacije zaktualizował
subscriptionReplaced-title = Waš abonement je so zaktualizował
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Waš jednotliwy abonement { $productName } je so wuměnił a je nětko we wašim pakeće wobsahowany.
subscriptionReplaced-content-credit = Dóstanjeće dobropis za njewužity čas ze swojeho předchadneho abonementa. Tutón dobropis so awtomatisce na waše konto nałoži a za přichodne popłatki wužiwa.
subscriptionReplaced-content-no-action = Z wašeje strony akcija trěbna njeje.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Płaćenje { $productName } dóstane
subscriptionSubsequentInvoice-title = Wulki dźak, zo sće abonent!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Smy waše najnowše płaćenje za { $productName } dóstali.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Waša přichodna zličbowanka so dnja { $nextInvoiceDateOnly } wuda.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Sće na { $productName } zaktualizował
subscriptionUpgrade-title = Wulki dźak za aktualizowanje!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sće wuspěšnje na { $productName } zaktualizował.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Wam je so jónkróćny popłatk { $invoiceAmountDue } wobličił, zo by so wyša płaćizna wašeho abonementa za zbytk tuteje wotličenskeje periody wotbłyšćowała ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Sće dobroměće we wysokosći { $paymentProrated } dóstał.
subscriptionUpgrade-content-subscription-next-bill-change = Započinajo z wašej přichodnej zličbowanku, so płaćizna wašeho abonementa změni.
subscriptionUpgrade-content-old-price-day = Předchadny popłatk je { $paymentAmountOld } na dźeń był.
subscriptionUpgrade-content-old-price-week = Předchadny popłatk je { $paymentAmountOld } na tydźeń był.
subscriptionUpgrade-content-old-price-month = Předchadny popłatk je { $paymentAmountOld } na měsac był.
subscriptionUpgrade-content-old-price-halfyear = Předchadny popłatk je { $paymentAmountOld } na šěsć měsacow był.
subscriptionUpgrade-content-old-price-year = Předchadny popłatk je { $paymentAmountOld } na lěto był.
subscriptionUpgrade-content-old-price-default = Předchadny popłatk je { $paymentAmountOld } na wotličenski interwal był.
subscriptionUpgrade-content-old-price-day-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na dźeń był.
subscriptionUpgrade-content-old-price-week-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na tydźeń był.
subscriptionUpgrade-content-old-price-month-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na měsac był.
subscriptionUpgrade-content-old-price-halfyear-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na šěsć měsacow był.
subscriptionUpgrade-content-old-price-year-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na lěto był.
subscriptionUpgrade-content-old-price-default-tax = Předchadny popłatk je { $paymentAmountOld } + { $paymentTaxOld } dawka na wotličenski interwal był.
subscriptionUpgrade-content-new-price-day = Wotnětka dyrbiće { $paymentAmountNew } na dźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-week = Wotnětka dyrbiće { $paymentAmountNew } na tydźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-month = Wotnětka dyrbiće { $paymentAmountNew } na měsac płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-halfyear = Wotnětka dyrbiće { $paymentAmountNew } na šěsć měsacow płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-year = Wotnětka dyrbiće { $paymentAmountNew } na lěto płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-default = Wotnětka dyrbiće { $paymentAmountNew } na wotličenski interwal płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-day-dtax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na dźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-week-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na tydźeń płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-month-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na měsac płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-halfyear-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na šěsć měsacow płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-year-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na lěto płaćić, nimo rabatow.
subscriptionUpgrade-content-new-price-default-tax = Wotnětka dyrbiće { $paymentAmountNew } + { $paymentTaxNew } dawka na wotličenski interwal płaćić, nimo rabatow.
subscriptionUpgrade-existing = Jeli so jedyn z wašich eksistowacych abonementow z tutej aktualizaciju překrywaja, budźemy so z nim zaběrać a wam separatnu mejlku z podrobnosćemi słać. Jeli waš nowy plan produkty wopřijima, kotrež sej instalaciju wužaduja, budźemy wam separatnu mejlku z instalaciskimi instrukcijemi słać.
subscriptionUpgrade-auto-renew = Waš abonement so awtomatisce kóždu wotličensku dobu podlěšuje, chibazo wupowědźiće.
subscriptionsPaymentExpired-subject-2 = Płaćenska metoda za swoje abonementy je spadnyła abo bórze spadnje
subscriptionsPaymentExpired-title-2 = Waša płaćenska metoda je spadnyła abo bórze spadnje
subscriptionsPaymentExpired-content-2 = Płaćenska metoda, z kotrejž płaćenja za slědowace abonementy přewjedźeće, je spadnyła abo bórze spadnje.
subscriptionsPaymentProviderCancelled-subject = Aktualizowanje płaćenskich informacijow je za abonementy { -brand-mozilla } trěbne
subscriptionsPaymentProviderCancelled-title = Bohužel mamy problemy z wašej płaćenskej metodu
subscriptionsPaymentProviderCancelled-content-detected = Mějachmy problem z wašej płaćenskej metodu za slědowace abonementy.
subscriptionsPaymentProviderCancelled-content-payment-1 = Waša płaćenska metoda je snano spadnjena, abo waša aktualna płaćenska metoda je zestarjena.
