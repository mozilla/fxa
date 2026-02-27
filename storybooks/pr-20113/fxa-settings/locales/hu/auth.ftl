## Non-email strings

session-verify-send-push-title-2 = Bejelentkezik a { -product-mozilla-account }jába?
session-verify-send-push-body-2 = Kattintson ide, hogy megerősítse személyazonosságát
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = A { -brand-mozilla } ellenőrzőkódja: { $code }. 5 perc múlva lejár.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } ellenőrzőkód: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = A { -brand-mozilla } helyreállítási kódja: { $code }. 5 perc múlva lejár.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kód: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = A { -brand-mozilla } helyreállítási kódja: { $code }. 5 perc múlva lejár.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kód: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logó">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logó">
subplat-automated-email = Ez egy automatikus üzenet, ha úgy véli tévedésből kapta, akkor nincs teendője.
subplat-privacy-notice = Adatvédelmi nyilatkozat
subplat-privacy-plaintext = Adatvédelmi nyilatkozat:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Azért kapta ezt az levelet, mert a(z) { $email } rendelkezik { -product-mozilla-account }kal, és feliratkozott erre: { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Azért kapta ezt a levelet, mert { $email } { -product-mozilla-account }kal rendelkezik.
subplat-explainer-multiple-2 = Azért kapta ezt a levelet, mert a(z) { $email } rendelkezik { -product-mozilla-account }kal, és több termékre is előfizetett.
subplat-explainer-was-deleted-2 = Azért kapta ezt az levelet, mert a(z) { $email } címhez { -product-mozilla-account }ot regisztráltak.
subplat-manage-account-2 = Kezelje a { -product-mozilla-account }ja beállításait a <a data-l10n-name="subplat-account-page">fiókoldala</a> felkeresésével.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Kezelje a { -product-mozilla-account }ja beállításait a fiókoldalának felkeresésével: { $accountSettingsUrl }
subplat-terms-policy = Feltételek és lemondási feltételek
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Előfizetés lemondása
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Előfizetés újraaktiválása
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Számlázási információk frissítése
subplat-privacy-policy = A { -brand-mozilla } adatvédelmi irányelvei
subplat-privacy-policy-2 = { -product-mozilla-accounts } adatvédelmi nyilatkozata
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts } szolgáltatási feltételei
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Jogi információk
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Adatvédelem
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Segítsen bennünket szolgáltatásunk fejlesztésében azzal, hogy kitölti ezt a <a data-l10n-name="cancellationSurveyUrl">rövid kérdőívet</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Segítsen bennünket szolgáltatásunk fejlesztésében azzal, hogy kitölti az alábbi rövid kérdőívet:
payment-details = Fizetési részletek:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Díjbekérő száma: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Levonás: { $invoiceTotal }, ekkor: { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Következő díjbekérő: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Fizetési mód:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Fizetési mód: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Fizetési mód: { $lastFour } végződésű { $cardName } kártya
payment-provider-card-ending-in-plaintext = Fizetési mód: { $lastFour } végződésű kártya
payment-provider-card-ending-in = <b>Fizetési mód:</b> { $lastFour } végződésű kártya
payment-provider-card-ending-in-card-name = <b>Fizetési mód:</b> { $lastFour } végződésű { $cardName } kártya
subscription-charges-invoice-summary = Számlaösszesítő

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Számla száma:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Számla száma: { $invoiceNumber }
subscription-charges-invoice-date = <b>Dátum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Dátum: { $invoiceDateOnly }
subscription-charges-prorated-price = Időarányos ár
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Időarányos ár: { $remainingAmountTotal }
subscription-charges-list-price = Listaár
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listaár: { $offeringPrice }
subscription-charges-credit-from-unused-time = Jóváírás a fel nem használt időből
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Jóváírás a fel nem használt időből: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Részösszeg</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Részösszeg: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Egyszeri kedvezmény
subscription-charges-one-time-discount-plaintext = Egyszeri kedvezmény: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } havi kedvezmény
       *[other] { $discountDuration } havi kedvezmény
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration } havi kedvezmény: { $invoiceDiscountAmount }
       *[other] { $discountDuration } havi kedvezmény: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Kedvezmény
subscription-charges-discount-plaintext = Kedvezmény: { $invoiceDiscountAmount }
subscription-charges-taxes = Adók és díjak
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Adók és díjak: { $invoiceTaxAmount }
subscription-charges-total = <b>Összesen</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Összesen: { $invoiceTotal }
subscription-charges-credit-applied = Jóváírás alkalmazva
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Jóváírás: { $creditApplied }
subscription-charges-amount-paid = <b>Kifizetett összeg</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Kifizetett összeg: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = { $creditReceived } összegű fiókjóváírást kapott, amely a jövőbeni számláin lesz felhasználva.

##

subscriptionSupport = Kérdése van az előfizetéséről? A <a data-l10n-name="subscriptionSupportUrl">támogatási csapatunk</a> itt van, hogy segítsen.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Kérdése van az előfizetéséről? A támogatási csapatunk itt van, hogy segítsen:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Köszönjük, hogy előfizetett a { $productName } szolgáltatásra. Ha kérdése van az előfizetésével kapcsolatban, vagy további információra van szükséges a { $productName } szolgáltatással kapcsolatban, akkor <a data-l10n-name="subscriptionSupportUrl">lépjen velünk kapcsolatba</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Köszönjük, hogy előfizetett a { $productName } szolgáltatásra. Ha kérdése van az előfizetésével kapcsolatban, vagy további információra van szükséges a { $productName } szolgáltatással kapcsolatban, akkor lépjen velünk kapcsolatba:
subscription-support-get-help = Segítség az előfizetéshez
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Előfizetés kezelése</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Előfizetés kezelése:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kapcsolatfelvétel az ügyfélszolgálattal</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kapcsolatfelvétel az ügyfélszolgálattal:
subscriptionUpdateBillingEnsure = Itt meggyőződhet arról, hogy fizetési módja és fiókja adatai naprakészek <a data-l10n-name="updateBillingUrl">itt</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Itt meggyőződhet arról, hogy fizetési módja és fiókja adatai naprakészek:
subscriptionUpdateBillingTry = A következő napokban újra megpróbáljuk a befizetését, de előfordulhat, hogy segítenie kell nekünk a <a data-l10n-name="updateBillingUrl">fizetési információinak frissítésével</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = A következő napokban újra megpróbáljuk a befizetését, de előfordulhat, hogy segítenie kell nekünk a fizetési információinak frissítésével:
subscriptionUpdatePayment = A szolgáltatás folytonossága érdekében <a data-l10n-name="updateBillingUrl">frissítse a fizetési információit</a> a lehető leghamarabb.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = A szolgáltatás folytonossága érdekében frissítse a fizetési információit a lehető leghamarabb:
view-invoice-link-action = Számla megtekintése
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Díjbekérő megtekintése: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Üdvözli a { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Üdvözli a { $productName }
downloadSubscription-content-2 = Kezdjük el használni az előfizetésében szereplő összes szolgáltatást:
downloadSubscription-link-action-2 = Kezdő lépések
fraudulentAccountDeletion-subject-2 = A { -product-mozilla-account }ja törölve lett
fraudulentAccountDeletion-title = Fiókját törölték
fraudulentAccountDeletion-content-part1-v2 = A közelmúltban egy { -product-mozilla-account } jött létre, és az előfizetést ezzel az e-mail-címmel fizették ki. Mint minden új fióknál, megkértük, hogy erősítse meg fiókját az e-mail-cím ellenőrzésével.
fraudulentAccountDeletion-content-part2-v2 = Jelenleg azt látjuk, hogy a fiókot sosem erősítették meg. Mivel ez a lépés nem fejeződött be, így nem vagyunk biztosak abban, hogy ez egy engedélyezett előfizetés volt-e. Ennek eredményeként az e-mail-címre regisztrált { -product-mozilla-account } törölve lett, az előfizetését pedig az összes költség visszatérítése mellett töröltük.
fraudulentAccountDeletion-contact = Ha kérdése van, forduljon <a data-l10n-name="mozillaSupportUrl">támogatási csapatunkhoz</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ha bármilyen kérdése van, forduljon támogatási csapatunkhoz: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Lemondta a(z) { $productName } előfizetését
subscriptionAccountDeletion-title = Sajnáljuk, hogy távozik
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Nemrég törölte a { -product-mozilla-account }ját. Ezért megszakítottuk a(z) { $productName } előfizetését. Az utolsó { $invoiceTotal } $ értékű befizetése ekkor történt: { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Emlékeztető: Fejezze be a fiókja beállítását
subscriptionAccountReminderFirst-title = Még nem férhet hozzá az előfizetéséhez
subscriptionAccountReminderFirst-content-info-3 = Néhány nappal ezelőtt létrehozott egy { -product-mozilla-account }ot, de nem erősítette meg. Reméljük, hogy befejezi fiókja beállítását, hogy használhassa az új előfizetését.
subscriptionAccountReminderFirst-content-select-2 = Válassza a „Jelszó létrehozása” lehetőséget, hogy új jelszót állítson be, és befejezze a fiókja megerősítését.
subscriptionAccountReminderFirst-action = Jelszó létrehozása
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Végső emlékeztető: Állítsa be a fiókját
subscriptionAccountReminderSecond-title-2 = Üdvözli a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Néhány nappal ezelőtt létrehozott egy { -product-mozilla-account }ot, de nem erősítette meg. Reméljük, hogy befejezi fiókja beállítását, hogy használhassa az új előfizetését.
subscriptionAccountReminderSecond-content-select-2 = Válassza a „Jelszó létrehozása” lehetőséget, hogy új jelszót állítson be, és befejezze a fiókja megerősítését.
subscriptionAccountReminderSecond-action = Jelszó létrehozása
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Lemondta a(z) { $productName } előfizetését
subscriptionCancellation-title = Sajnáljuk, hogy távozik

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Lemondtuk a { $productName } előfizetését. Az utolsó, { $invoiceTotal } összegű befizetését a következő napon volt kifizetve: { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Lemondtuk a { $productName } előfizetését. Az utolsó, { $invoiceTotal } összegű befizetését a következő napon lesz kifizetve: { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Szolgáltatása a jelenlegi számlázási időszak végéig, azaz { $serviceLastActiveDateOnly } végéig folytatódik.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Váltott erre: { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Sikeresen váltott erről: { $productNameOld }, erre: { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A következő számlától fogva a levonása megváltozik { $paymentAmountOld }/{ $productPaymentCycleOld } összegről a következőre: { $paymentAmountNew }/{ $productPaymentCycleNew }. Akkor kapni fog egy egyszeri { $paymentProrated } értékű jóváírást, amely a(z) { $productPaymentCycleOld } hátralévő időszakára eső különbözet.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ha új szoftver telepítése szükséges a { $productName } használatához, akkor külön e-mailt fog kapni a letöltési utasításokkal.
subscriptionDowngrade-content-auto-renew = Előfizetése számlázási időszakonként automatikusan megújul, hacsak nem dönt úgy, hogy lemondja.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = A { $productName }-előfizetése hamarosan lejár
subscriptionEndingReminder-title = A { $productName }-előfizetése hamarosan lejár
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = A(z) { $productName } szolgáltatáshoz való hozzáférése ekkor jár le: <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Ha továbbra is szeretné használni a { $productName } szolgáltatást, akkor a <a data-l10n-name="subscriptionEndingReminder-account-settings">Fiókbeállítások</a> részben <strong>{ $serviceLastActiveDateOnly }</strong> előtt aktiválhatja az előfizetését. Ha segítségre van szüksége, <a data-l10n-name="subscriptionEndingReminder-contact-support">lépjen kapcsolatba az ügyfélszolgálati csapatunkkal</a>.
subscriptionEndingReminder-content-line1-plaintext = A(z) { $productName } szolgáltatáshoz való hozzáférése ekkor jár le: { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Ha továbbra is szeretné használni a(z) { $productName } szolgáltatást, akkor { $serviceLastActiveDateOnly } előtt újraaktiválhatja az előfizetését a Fiókbeállításokban. Ha segítségre van szüksége, forduljon támogatási csapatunkhoz.
subscriptionEndingReminder-content-closing = Köszönjük, hogy értékes előfizető lett!
subscriptionEndingReminder-churn-title = Meg szeretné tartani a hozzáférését?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Korlátozott feltételek és korlátozások vonatkoznak erre</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Korlátozott feltételek és korlátozások vonatkoznak erre: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Lépjen kapcsolatba támogatási csapatunkkal: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Lemondta a(z) { $productName } előfizetését
subscriptionFailedPaymentsCancellation-title = Az előfizetése lemondásra került
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Lemondtuk a(z) { $productName } előfizetését, mert több fizetési kísérlet sem sikerült. Hogy újra hozzáférést kapjon, indítson egy új előfizetést egy frissített fizetési móddal.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = A(z) { $productName } befizetése megerősítve
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Köszönjük, hogy feliratkozott a(z) { $productName } szolgáltatásra
subscriptionFirstInvoice-content-processing = Az ön befizetése feldolgozás alatt áll, ami akár négy munkanapig is tarthat.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Külön e-mailt fog kapni a { $productName } használatának megkezdéséről.
subscriptionFirstInvoice-content-auto-renew = Előfizetése számlázási időszakonként automatikusan megújul, hacsak nem dönt úgy, hogy lemondja.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = A következő számla ekkor lesz kiállítva: { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = A(z) { $productName } fizetési módja lejárt vagy hamarosan lejár
subscriptionPaymentExpired-title-2 = A fizetési módja lejárt vagy hamarosan lejár
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = A(z) { $productName } előfizetésének befizetéséhez használt fizetési módja lejárt vagy hamarosan lejár.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = A(z) { $productName } befizetése sikertelen
subscriptionPaymentFailed-title = Sajnáljuk, gondok vannak a befizetésével
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Probléma merült fel a legutóbbi { $productName } befizetésével kapcsolatban.
subscriptionPaymentFailed-content-outdated-1 = Előfordulhat, hogy a fizetési módja lejárt, vagy a jelenlegi fizetési módja elavult.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = A fizetési információk frissítése szükséges a következőnél: { $productName }
subscriptionPaymentProviderCancelled-title = Sajnáljuk, gondok vannak a fizetési módjával
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Problémát észleltünk a { $productName } termékhez tartozó fizetési módjával kapcsolatban.
subscriptionPaymentProviderCancelled-content-reason-1 = Előfordulhat, hogy a fizetési módja lejárt, vagy a jelenlegi fizetési módja elavult.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } előfizetés újraaktiválva
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Köszönjük, hogy újraaktiválta a { $productName } előfizetését.
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = A számlázási ciklusa és fizetése változatlan marad. A következő terhelés { $invoiceTotal } lesz, ekkor: { $nextInvoiceDateOnly }. Előfizetése automatikusan megújítja az összes számlázási időszakot, hacsak nem dönt úgy, hogy lemondja.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } automatikus megújítási értesítés
subscriptionRenewalReminder-title = Az előfizetése hamarosan meg lesz újítva
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Tisztelt { $productName } vásárló!
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = A jelenlegi előfizetése { $reminderLength } nap múlva automatikusan megújul.
subscriptionRenewalReminder-content-discount-change = A következő számla az árazás változását tükrözi, mivel egy korábbi kedvezmény lejárt, és egy új kedvezmény került alkalmazásra.
subscriptionRenewalReminder-content-discount-ending = Mivel egy korábbi kedvezmény lejárt, az előfizetése a szokásos áron újul meg.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Ekkor a { -brand-mozilla } megújítja a napi előfizetését, és { $invoiceTotalExcludingTax } + { $invoiceTax } adó lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-with-tax-week = Ekkor a { -brand-mozilla } megújítja a heti előfizetését, és { $invoiceTotalExcludingTax } + { $invoiceTax } adó lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-with-tax-month = Ekkor a { -brand-mozilla } megújítja a havi előfizetését, és { $invoiceTotalExcludingTax } + { $invoiceTax } adó lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Ekkor a { -brand-mozilla } megújítja a hat hónapos előfizetését, és { $invoiceTotalExcludingTax } + { $invoiceTax } adó lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-with-tax-year = Ekkor a { -brand-mozilla } megújítja az éves előfizetését, és { $invoiceTotalExcludingTax } + { $invoiceTax } adó lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-with-tax-default = Ekkor a { -brand-mozilla } megújítja az előfizetését, és { $invoiceTotalExcludingTax } + { $invoiceTax } adó lesz felszámítva a fiókjában beállított fizetési módra.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Ekkor a { -brand-mozilla } megújítja a napi előfizetését, és { $invoiceTotal } lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-invoice-total-week = Ekkor a { -brand-mozilla } megújítja a heti előfizetését, és { $invoiceTotal } lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-invoice-total-month = Ekkor a { -brand-mozilla } megújítja a havi előfizetését, és { $invoiceTotal } lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Ekkor a { -brand-mozilla } megújítja a hat hónapos előfizetését, és { $invoiceTotal } lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-invoice-total-year = Ekkor a { -brand-mozilla } megújítja az éves előfizetését, és { $invoiceTotal } lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-charge-invoice-total-default = Ekkor a { -brand-mozilla } megújítja az előfizetését, és { $invoiceTotal } lesz felszámítva a fiókjában beállított fizetési módra.
subscriptionRenewalReminder-content-closing = Üdvözlettel,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = A { $productName } csapat
subscriptionReplaced-subject = Az előfizetése a frissítés részeként frissítve lett
subscriptionReplaced-title = Az előfizetése frissítve lett
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Az egyéni { $productName } előfizetése le lett cserélve, és most már az új csomagja része.
subscriptionReplaced-content-credit = Az előző előfizetése során fel nem használt idő után jóváírást kap. Ez a jóváírás automatikusan jóváírásra kerül a fiókjában, és a jövőbeni terhelésekhez lesz felhasználva.
subscriptionReplaced-content-no-action = Nincs teendője az Ön részéről.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = A(z) { $productName } befizetése megérkezett
subscriptionSubsequentInvoice-title = Köszönjük, hogy előfizető lett!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Megkaptuk legutóbbi { $productName } befizetését.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = A következő számla ekkor lesz kiállítva: { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Frissített erre: { $productName }
subscriptionUpgrade-title = Köszönjük, hogy magasabb csomagra frissített!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sikeresen frissített erre: { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Egy egyszeri { $invoiceAmountDue } összegű díjat számoltunk fel, amely a számlázási időszak ({ $productPaymentCycleOld }) hátralévő részében az előfizetés magasabb árat tükrözi.
subscriptionUpgrade-content-charge-credit = { $paymentProrated } összegű jóváírást kapott.
subscriptionUpgrade-content-subscription-next-bill-change = A következő számlától kezdve az előfizetés ára megváltozik.
subscriptionUpgrade-content-old-price-day = A korábbi ár { $paymentAmountOld } volt naponta.
subscriptionUpgrade-content-old-price-week = A korábbi ár { $paymentAmountOld } volt hetente.
subscriptionUpgrade-content-old-price-month = A korábbi díj { $paymentAmountOld } volt havonta.
subscriptionUpgrade-content-old-price-halfyear = A korábbi díj { $paymentAmountOld } volt hat havonta.
subscriptionUpgrade-content-old-price-year = A korábbi díj { $paymentAmountOld } volt évente.
subscriptionUpgrade-content-old-price-default = A korábbi díj { $paymentAmountOld } volt számlázási időszakonként.
subscriptionUpgrade-content-old-price-day-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt naponta.
subscriptionUpgrade-content-old-price-week-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt hetente.
subscriptionUpgrade-content-old-price-month-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt havonta.
subscriptionUpgrade-content-old-price-halfyear-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt hat havonta.
subscriptionUpgrade-content-old-price-year-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt évente.
subscriptionUpgrade-content-old-price-default-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt számlázási időszakonként.
subscriptionUpgrade-content-new-price-day = A továbbiakban naponta { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-week = A továbbiakban hetente { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-month = A továbbiakban havonta { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-halfyear = A továbbiakban hat havonta { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-year = A továbbiakban évente { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-default = A továbbiakban számlázási időszakonként { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-day-dtax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva naponta, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-week-tax = A továbbiakban { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva hetente, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-month-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva havonta, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-halfyear-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva hat havonta, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-year-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva évente, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-default-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva számlázási időszakonként, a kedvezményeket nem számítva.
subscriptionUpgrade-existing = Ha bármelyik meglévő előfizetése fedi ezt a frissítést, akkor azt kezeljük, és külön e-mailt küldünk a részletekről. Ha az új előfizetése telepítést igénylő termékeket tartalmaz, akkor külön e-mailt küldünk a beállítási utasításokkal.
subscriptionUpgrade-auto-renew = Előfizetése számlázási időszakonként automatikusan megújul, hacsak nem dönt úgy, hogy lemondja.
subscriptionsPaymentExpired-subject-2 = Az előfizetéseihez tartozó fizetési mód lejárt vagy hamarosan lejár
subscriptionsPaymentExpired-title-2 = A fizetési módja lejárt vagy hamarosan lejár
subscriptionsPaymentExpired-content-2 = A következő előfizetésekhez használt fizetési mód lejárt vagy hamarosan lejár.
subscriptionsPaymentProviderCancelled-subject = A fizetési információk frissítése szükséges a { -brand-mozilla(ending: "accented") }s előfizetéseknél
subscriptionsPaymentProviderCancelled-title = Sajnáljuk, gondok vannak a fizetési módjával
subscriptionsPaymentProviderCancelled-content-detected = Problémát észleltünk a következő előfizetésekhez tartozó fizetési módjával kapcsolatban.
subscriptionsPaymentProviderCancelled-content-payment-1 = Előfordulhat, hogy a fizetési módja lejárt, vagy a jelenlegi fizetési módja elavult.
