## Non-email strings

session-verify-send-push-title-2 = Te conectezi la { -product-mozilla-account }?
session-verify-send-push-body-2 = Dă clic aici să confirmi că ești tu
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } este codul tău de verificare { -brand-mozilla }. Expiră în 5 minute.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Cod de verificare { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } este codul tău de recuperare { -brand-mozilla }. Expiră în 5 minute.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Cod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } este codul tău de recuperare { -brand-mozilla }. Expiră în 5 minute.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Cod { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = Politica de confidențialitate { -brand-mozilla }
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Notificare privind confidențialitatea
moz-accounts-terms-url = Condiții de utilizare a serviciilor { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Acesta este un mesaj automat pe e-mail; dacă l-ai primit din greșeală, nu trebuie să faci nimic.
subplat-privacy-notice = Notificare privind confidențialitatea
subplat-privacy-plaintext = Notificare privind confidențialitatea:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Ai primit acest mesaj pe e-mail deoarece { $email } are un cont { -product-mozilla-account } și te-ai abonat la { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Ai primit acest mesaj pe e-mail deoarece { $email } are un cont { -product-mozilla-account }.
subplat-explainer-multiple-2 = Ai primit acest mesaj pe e-mail deoarece { $email } are un cont { -product-mozilla-account } și te-ai abonat la mai multe priduse.
subplat-explainer-was-deleted-2 = Ai primit acest mesaj pe e-mail deoarece { $email } a fost înregistrat pentru un { -product-mozilla-account }.
subplat-manage-account-2 = Gestionează-ți setările { -product-mozilla-account } intrând pe <a data-l10n-name="subplat-account-page">pagina contului</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gestionează-ți setările { -product-mozilla-account } intrând pe pagina contului tău: { $accountSettingsUrl }
subplat-terms-policy = Termeni și politica de anulare
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anulează abonamentul
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivează abonamentul
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Actualizează informațiile de facturare
subplat-privacy-policy = Politica de confidențialitate { -brand-mozilla }
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Notificare privind confidențialitatea
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Condiții de utilizare a serviciilor { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Mențiuni legale
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Confidențialitate
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Dacă ți se șterge contul, vei primi în continuare mesaje pe e-mail de la Corporația Mozilla și Fundația Mozilla, cu excepția cazului în care <a data-l10n-name="unsubscribeLink">ceri dezabonarea</a>.
account-deletion-info-block-support = Dacă ai întrebări sau ai nevoie de asistență, nu ezita să contactezi <a data-l10n-name="supportLink">echipa noastră de asistență</a>.
account-deletion-info-block-communications-plaintext = Dacă ți se șterge contul, vei primi în continuare mesaje pe e-mail de la Corporația Mozilla și Fundația Mozilla, cu excepția cazului în care ceri dezabonarea:
account-deletion-info-block-support-plaintext = Dacă ai întrebări sau ai nevoie de asistență, nu ezita să contactezi echipa noastră de asistență:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Download { $productName } on { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Download { $productName } on the { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalează { $productName } pe <a data-l10n-name="anotherDeviceLink">un alt dispozitiv desktop</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalează { $productName } pe <a data-l10n-name="anotherDeviceLink">un alt dispozitiv</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Ia { $productName } de pe Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Descarcă { $productName } din App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instalează { $productName } pe un alt dispozitiv:
automated-email-change-2 = Dacă nu ai făcut-o deja, <a data-l10n-name="passwordChangeLink">schimbă-ți parola</a> imediat.
automated-email-support = Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Dacă nu ai făcut-o deja, schimbă-ți parola imediat:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pentru mai multe informații, intră pe Asistență { -brand-mozilla }:
automated-email-inactive-account = Acesta este un mesaj automat trimis pe e-mail. L-ai primit pentru că ai un cont { -product-mozilla-account } și au trecut 2 ani de la ultima conectare.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
automated-email-no-action-plaintext = Acesta este un mesaj automat trimis pe e-mail. Dacă l-ai primit din greșeală, nu trebuie să faci nimic.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Acesta este un mesaj automat trimis pe e-mail; dacă nu ai autorizat așa ceva, te rugăm să îți schimbi parola:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Solicitarea venit de la { $uaBrowser } pe { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Solicitarea venit de la { $uaBrowser } pe { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Solicitarea venit de la { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Solicitarea venit de la { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Solicitarea venit de la { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Dacă nu ai fost tu, <a data-l10n-name="revokeAccountRecoveryLink">șterge cheia nouă</a> și <a data-l10n-name="passwordChangeLink">schimbă-ți parola</a>.
automatedEmailRecoveryKey-change-pwd-only = Dacă nu ai fost tu, <a data-l10n-name="passwordChangeLink">schimbă-ți parola</a>.
automatedEmailRecoveryKey-more-info = Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Această solicitare a venit de la:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Dacă nu ai fost tu, șterge noua cheie:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Dacă nu ai fost tu, schimbă-ți parola:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = și schimbă-ți parola:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pentru mai multe informații, intră pe { -brand-mozilla } Asistență:
automated-email-reset =
    Acesta este un mesaj automat trimis pe e-mail; dacă nu ai autorizat așa ceva, atunci <a data-l10n-name="resetLink">resetează-ți parola</a>.
    Pentru mai multe informații, te rugăm să intri pe <a data-l10n-name="supportLink">Asistență { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Dacă nu ai autorizat așa ceva, resetează-ți acum parola la { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Dacă nu tu ai făcut asta, atunci <a data-l10n-name="resetLink">resetează-ți parola</a> și <a data-l10n-name="twoFactorSettingsLink">resetează autentificarea în doi pași</a> imediat.
    Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Dacă nu tu ai făcut asta, atunci resetează-ți parola imediat pe:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Resetează-ți și autentificarea în doi pași pe:
brand-banner-message = Știai că ne-am schimbat numele din { -product-firefox-accounts } în { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Află mai multe</a>
cancellationSurvey = Te rugăm să ne ajuți să ne îmbunătățim serviciile participând la acest <a data-l10n-name="cancellationSurveyUrl">scurt sondaj</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Te rugăm să ne ajuți să ne îmbunătățim serviciile participând la acest scurt sondaj:
change-password-plaintext = Dacă suspectezi că cineva încearcă să îți intre în cont, te rugăm să îți modifici parola.
manage-account = Gestionează contul
manage-account-plaintext = { manage-account }:
payment-details = Detalii de plată:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Număr factură: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Debitat: { $invoiceTotal } la data de { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Următoarea factură: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodă de plată:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodă de plată: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodă de plată: { $cardName } care se termină în { $lastFour }
payment-provider-card-ending-in-plaintext = Metodă de plată: Card care se termină în { $lastFour }
payment-provider-card-ending-in = <b>Metodă de plată:</b> Card care se termină în { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodă de plată:</b> { $cardName } care se termină în { $lastFour }
subscription-charges-invoice-summary = Rezumatul facturii

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Număr factură:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Număr factură: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Preț proporțional
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Preț proporțional: { $remainingAmountTotal }
subscription-charges-list-price = Preț de listă
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Preț de listă: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credit din timpul neutilizat
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credit din timpul neutilizat: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Reducere unică
subscription-charges-one-time-discount-plaintext = Reducere unică: -{ $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Reducere de { $discountDuration } lună
        [few] Reducere de { $discountDuration } luni
       *[other] Reducere de { $discountDuration } de luni
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Reducere de { $discountDuration } lună: { $invoiceDiscountAmount }
        [few] Reducere de { $discountDuration } luni: { $invoiceDiscountAmount }
       *[other] Reducere de { $discountDuration } de luni: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Reducere
subscription-charges-discount-plaintext = Reducere: { $invoiceDiscountAmount }
subscription-charges-taxes = Taxe și comisioane
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxe și comisioane: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Credit aplicat
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credit aplicat: { $creditApplied }
subscription-charges-amount-paid = <b>Sumă achitată</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Sumă achitată: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Ai primit un credit în cont de { $creditReceived }, care va fi aplicat facturilor viitoare.

##

subscriptionSupport = Ai întrebări despre abonament? <a data-l10n-name="subscriptionSupportUrl">Echipa de asistență</a> este aici ca să te ajute.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Întrebări despre abonament? Echipa noastră de asistență este aici pentru a te ajuta:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Îți mulțumim că te-ai abonat la { $productName }. Dacă ai întrebări despre abonament sau vrei mai multe informații despre { $productName }, <a data-l10n-name="subscriptionSupportUrl">contactează-ne</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Îți mulțumim că te-ai abonat la { $productName }. Dacă ai întrebări despre abonament sau vrei mai multe informații despre { $productName }, contactează-ne.
subscription-support-get-help = Obține ajutor pentru abonament
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gestionează-ți abonamentul</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gestionează-ți abonamentul:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contactează asistența</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactează serviciul de asistență:
subscriptionUpdateBillingEnsure = Te poți asigura că metoda de plată și informațiile contului sunt la zi <a data-l10n-name="updateBillingUrl">aici</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Te poți asigura că metoda de plată și informațiile contului sunt la zi aici:
subscriptionUpdateBillingTry = Vom încerca din nou plata în următoarele zile, dar este posibil să fie nevoie să ne ajuți să remediem problema <a data-l10n-name="updateBillingUrl">actualizând informațiile de plată</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Vom încerca din nou plata în următoarele zile, dar este posibil să fie nevoie să ne ajuți să remediem problema actualizând informațiile de plată.
subscriptionUpdatePayment = Pentru a preveni orice întrerupere a serviciului, <a data-l10n-name="updateBillingUrl">actualizează-ți informațiile de plată</a> cât mai curând posibil.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Pentru a preveni orice întrerupere a serviciului, actualizează-ți informațiile de plată cât mai curând posibil:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Pentru mai multe informații, intră pe { -brand-mozilla } Asistență: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } pe { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } pe { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimate)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimate)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimate)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimată)
view-invoice-link-action = Vezi factura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Vezi factura: { $invoiceLink }
cadReminderFirst-subject-1 = Memento! Hai să sincronizăm { -brand-firefox }
cadReminderFirst-action = Sincronizează alt dispozitiv
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Îți trebuie două pentru sincronizare
cadReminderFirst-description-v2 = Ia-ți cu tine filele pe toate dispozitivele. Ia cu tine marcajele, parolele și alte date oriunde folosești { -brand-firefox }.
cadReminderSecond-subject-2 = Nu rata! Să finalizăm setarea sincronizării
cadReminderSecond-action = Sincronizează alt dispozitiv
cadReminderSecond-title-2 = Nu uita să sincronizezi!
cadReminderSecond-description-sync = Sincronizează-ți marcajele, parolele, filele deschise și multe altele — oriunde folosești { -brand-firefox }.
cadReminderSecond-description-plus = În plus, datele tale sunt întotdeauna criptate. Numai tu și dispozitivele pe care le aprobi le puteți vedea.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bine ai venit la { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bine ai venit la { $productName }
downloadSubscription-content-2 = Hai să începem să folosim toate funcționalitățile incluse în abonamentul tău:
downloadSubscription-link-action-2 = Începe
fraudulentAccountDeletion-subject-2 = Contul tău { -product-mozilla-account } a fost șters
fraudulentAccountDeletion-title = Contul tău a fost șters
fraudulentAccountDeletion-content-part1-v2 = Recent, a fost creat un { -product-mozilla-account } și a fost facturat un abonament folosind această adresă de e-mail. Așa cum procedăm cu toate conturile noi, te-am rugat să îți confirmi contul validând mai întâi această adresă de e-mail.
fraudulentAccountDeletion-content-part2-v2 = Vedem acum că acel cont nu a fost niciodată confirmat. Cum nu a fost finalizat acest pas, nu suntem siguri dacă a fost un abonament autorizat. Drept urmare, { -product-mozilla-account } înregistrat cu această adresă de e-mail a fost șters, iar abonamentul a fost anulat, toate taxele fiind rambursate.
fraudulentAccountDeletion-contact = Pentru orice întrebări, contactează <a data-l10n-name="mozillaSupportUrl">echipa de asistență</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Pentru orice întrebări, contactează echipa de asistență: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Ultima șansă ca să îți păstrezi { -product-mozilla-account }
inactiveAccountFinalWarning-title = Contul { -brand-mozilla } și datele vor fi șterse
inactiveAccountFinalWarning-preview = Intră în cont ca să îl păstrezi
inactiveAccountFinalWarning-account-description = Contul { -product-mozilla-account } este folosit pentru acces la produse gratuite de confidențialitate și navigare, cum ar fi sincronizarea { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } și { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = La data de <strong>{ $deletionDate }</strong>, contul și datele personale vor fi șterse definitiv dacă nu te conectezi.
inactiveAccountFinalWarning-action = Intră în cont ca să îl păstrezi
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Intră în cont ca să îl păstrezi:
inactiveAccountFirstWarning-subject = Nu-ți pierde contul
inactiveAccountFirstWarning-title = Vrei să îți păstrezi contul și datele { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Contul { -product-mozilla-account } este folosit pentru acces la produse gratuite de confidențialitate și navigare, cum ar fi sincronizarea { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } și { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Am observat că nu te-ai conectat de 2 ani.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Contul și datele personale vor fi șterse definitiv pe data de <strong>{ $deletionDate }</strong> pentru că nu ai fost activ(ă).
inactiveAccountFirstWarning-action = Intră în cont ca să îl păstrezi
inactiveAccountFirstWarning-preview = Intră în cont ca să îl păstrezi
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Intră în cont ca să îl păstrezi:
inactiveAccountSecondWarning-subject = Acțiune necesară: Contul va fi șters în 7 zile
inactiveAccountSecondWarning-title = Contul { -brand-mozilla } și datele vor fi șterse în 7 zile
inactiveAccountSecondWarning-account-description-v2 = Contul { -product-mozilla-account } este folosit pentru acces la produse gratuite de confidențialitate și navigare, cum ar fi sincronizarea { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } și { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Contul și datele personale vor fi șterse definitiv pe data de <strong>{ $deletionDate }</strong> pentru că nu ai fost activ(ă).
inactiveAccountSecondWarning-action = Intră în cont ca să îl păstrezi
inactiveAccountSecondWarning-preview = Intră în cont ca să îl păstrezi
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Intră în cont ca să îl păstrezi:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Ai epuizat codurile de autentificare de rezervă!
codes-reminder-title-one = Ai ajuns la ultimul cod de autentificare de rezevă
codes-reminder-title-two = E momentul să creezi mai multe coduri de autentificare de rezervă
codes-reminder-description-part-one = Codurile de autentificare de rezervă te ajută să îți restaurezi informațiile când uiți parola.
codes-reminder-description-part-two = Creează coduri noi acum ca să nu îți pierzi datele mai târziu.
codes-reminder-description-two-left = Mai ai numai două coduri rămase.
codes-reminder-description-create-codes = Creează coduri de autentificare de rezervă nou ca să te ajute să intri din nou în cont dacă este blocat.
lowRecoveryCodes-action-2 = Creează coduri
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nu mai ai niciun cod de autentificare de rezervă
        [one] A mai rămas doar 1 cod de autentificare de rezervă
        [few] Au mai rămas doar { $numberRemaining } de coduri de autentificare de rezervă!
       *[other] Au mai rămas doar { $numberRemaining } (de) coduri de autentificare de rezervă!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = O autentificare nouă în { $clientName }
newDeviceLogin-subjectForMozillaAccount = O autentificare nouă în { -product-mozilla-account }
newDeviceLogin-title-3 = Contul tău { -product-mozilla-account } a fost folosit pentru autentificare
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nu ai fost tu? <a data-l10n-name="passwordChangeLink">Schimbă-ți parola</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nu ai fost tu? Schimbă-ți parola:
newDeviceLogin-action = Gestionează contul
passwordChanged-subject = Parolă actualizată
passwordChanged-title = Parolă modificată cu succes
passwordChanged-description-2 = Parola { -product-mozilla-account } a fost schimbată cu succes de pe acest dispozitiv:
passwordChangeRequired-subject = Activitate suspectă detectată
passwordChangeRequired-preview = Schimbă-ți parola imediat
passwordChangeRequired-title-2 = Resetează-ți parola
passwordChangeRequired-suspicious-activity-3 = Ți-am blocat contul pentru a-l proteja de activități suspecte. Ai fost deconectat de pe toate dispozitivele tale, iar toate datele sincronizate au fost șterse ca măsură de precauție.
passwordChangeRequired-sign-in-3 = Ca să intri iar în cont, trebuie doar să îți resetezi parola.
passwordChangeRequired-different-password-2 = <b>Important:</b> Alege o parolă puternică, diferită de cea folosită anterior.
passwordChangeRequired-different-password-plaintext-2 = Important: Alege o parolă puternică, diferită de cea folosită anterior.
passwordChangeRequired-action = Resetează parola
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Folosește { $code } pentru a-ți schimba parola
password-forgot-otp-preview = Codul expiră în 10 minute.
password-forgot-otp-title = Ți-ai uitat parola?
password-forgot-otp-request = Am primit o solicitare de schimbare a parolei pentru contul { -product-mozilla-account } de la:
password-forgot-otp-code-2 = Dacă ai fost tu, iată codul de confirmare ca să continui:
password-forgot-otp-expiry-notice = Codul expiră în 10 minute.
passwordReset-subject-2 = Parola ta a fost resetată
passwordReset-title-2 = Parola ta a fost resetată
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ți-ai resetat parola { -product-mozilla-account } pe:
passwordResetAccountRecovery-subject-2 = Parola ta a fost resetată
passwordResetAccountRecovery-title-3 = Parola ta a fost resetată
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Ți-ai folosit cheia de recuperare a contului ca să îți resetezi parola { -product-mozilla-account } pe:
passwordResetAccountRecovery-information = Te-am deconectat de pe toate dispozitivele sincronizate. Am creat o nouă cheie de recuperare a contului în locul celei pe care ai folosit-o. O poți modifica în setările contului.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Te-am deconectat de pe toate dispozitivele sincronizate. Am creat o nouă cheie de recuperare a contului în locul celei pe care ai folosit-o. O poți modifica în setările contului:
passwordResetAccountRecovery-action-4 = Gestionează contul
passwordResetRecoveryPhone-subject = Număr de telefon de recuperare folosit
passwordResetRecoveryPhone-preview = Verifică dacă ai fost tu
passwordResetRecoveryPhone-title = Numărul de telefon de recuperare a fost folosit pentru confirmarea resetării parolei
passwordResetRecoveryPhone-device = Număr de telefon de recuperare folosit de pe:
passwordResetRecoveryPhone-action = Gestionează contul
passwordResetWithRecoveryKeyPrompt-subject = Parola ta a fost resetată
passwordResetWithRecoveryKeyPrompt-title = Parola ta a fost resetată
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ți-ai resetat parola { -product-mozilla-account } pe:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Creează o cheie de recuperare a contului
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Creează o cheie de recuperare a contului:
passwordResetWithRecoveryKeyPrompt-cta-description = Va trebui să te autentifici iar pe toate dispozitivele sincronizate. Data viitoare, păstrează-ți datele în siguranță cu o cheie de recuperare a contului. Îți permite recuperarea datelor dacă uiți parola.
postAddAccountRecovery-subject-3 = A fost creată o cheie nouă de recuperare a contului
postAddAccountRecovery-title2 = Ai creat o cheie nouă de recuperare a contului
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Păstrează cheia într-un loc sigur — vei avea nevoie de ea ca să restaurezi datele de navigare criptate dacă uiți parola.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Cheia poate fi folosită o singură dată. După ce o folosești, vom crea automat una nouă pentru tine. Sau poți crea una nouă oricând din setările contului.
postAddAccountRecovery-action = Gestionează contul
postAddLinkedAccount-subject-2 = Cont nou asociat cu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Contul tău { $providerName } a fost asociat cu { -product-mozilla-account }
postAddLinkedAccount-action = Gestionează contul
postAddRecoveryPhone-subject = Număr de telefon de recuperare adăugat
postAddRecoveryPhone-preview = Cont protejat cu autentificare în doi pași
postAddRecoveryPhone-title-v2 = Ai adăugat un număr de telefon pentru recuperare
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Ai adăugat { $maskedLastFourPhoneNumber } ca număr de telefon pentru recuperare
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Cum îți protejează contul
postAddRecoveryPhone-how-protect-plaintext = Cum îți protejează contul:
postAddRecoveryPhone-enabled-device = L-ai activat de pe:
postAddRecoveryPhone-action = Gestionează contul
postAddTwoStepAuthentication-preview = Contul tău este protejat
postAddTwoStepAuthentication-subject-v3 = Autentificarea în doi pași este activă
postAddTwoStepAuthentication-title-2 = Ai activat autentificarea în doi pași
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Ai făcut cererea de pe:
postAddTwoStepAuthentication-action = Gestionează contul
postAddTwoStepAuthentication-code-required-v4 = Vei avea nevoie de acum înainte de codurile de securitate generate de aplicația ta de autentificare pentru fiecare autentificare.
postAddTwoStepAuthentication-recovery-method-codes = Ai adăugat și coduri de autentificare de rezervă ca metodă de recuperare.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Ai adăugat și { $maskedPhoneNumber } ca număr de telefon pentru recuperare.
postAddTwoStepAuthentication-how-protects-link = Cum îți protejează contul
postAddTwoStepAuthentication-how-protects-plaintext = Cum îți protejează contul
postAddTwoStepAuthentication-device-sign-out-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
postChangeAccountRecovery-subject = Cheie modificată de recuperare a contului
postChangeAccountRecovery-title = Ți-ai modificat cheia de recuperare a contului
postChangeAccountRecovery-body-part1 = Acum ai o cheie nouă de recuperare a contului. Cea anterioară a fost ștearsă.
postChangeAccountRecovery-body-part2 = Salvează cheia nouă într-un loc sigur — vei avea nevoie de ea ca să restaurezi datele de navigare criptate dacă uiți parola.
postChangeAccountRecovery-action = Gestionează contul
postChangePrimary-subject = Adresă de e-mail primară actualizată
postChangePrimary-title = Adresă de e-mail primară nouă
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Ai schimbat cu succes adresa de e-mail primară în { $email }. Aceasta este acum numele de utilizator ca să intri în contul { -product-mozilla-account } și pentru primirea notificărilor de securitate și a confirmărilor de conectare.
postChangePrimary-action = Gestionează contul
postChangeRecoveryPhone-subject = Număr de telefon de recuperare actualizat
postChangeRecoveryPhone-preview = Cont protejat cu autentificare în doi pași
postChangeRecoveryPhone-title = Ți-ai schimbat numărul de telefon pentru recuperare
postChangeRecoveryPhone-description = Acum ai un nou număr de telefon pentru recuperare. Numărul anterior a fost șters.
postChangeRecoveryPhone-requested-device = Ai făcut cererea de pe:
postChangeTwoStepAuthentication-preview = Contul tău este protejat
postChangeTwoStepAuthentication-subject = Autentificare în doi pași actualizată
postChangeTwoStepAuthentication-title = Autentificarea în doi pași a fost actualizată
postChangeTwoStepAuthentication-use-new-account = Acum trebuie să utilizezi noua intrare { -product-mozilla-account } în aplicația de autentificare. Cea veche nu va mai funcționa și o poți elimina.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Ai făcut cererea de pe:
postChangeTwoStepAuthentication-action = Gestionează contul
postChangeTwoStepAuthentication-how-protects-link = Cum îți protejează contul
postChangeTwoStepAuthentication-how-protects-plaintext = Cum îți protejează contul:
postChangeTwoStepAuthentication-device-sign-out-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
postConsumeRecoveryCode-title-3 = Codul de autentificare de rezervă a fost folosit pentru a confirma resetarea parolei.
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Cod utilizat din:
postConsumeRecoveryCode-action = Gestionează contul
postConsumeRecoveryCode-subject-v3 = Cod de autentificare de rezervă utilizat
postConsumeRecoveryCode-preview = Verifică dacă ai fost tu
postNewRecoveryCodes-subject-2 = Coduri noi de autentificare de rezervă create
postNewRecoveryCodes-title-2 = Ai creat coduri noi de autentificare de rezervă
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Au fost create pe:
postNewRecoveryCodes-action = Gestionează contul
postRemoveAccountRecovery-subject-2 = Cheie de recuperare a contului ștearsă
postRemoveAccountRecovery-title-3 = Ți-ai șters cheia de recuperare a contului
postRemoveAccountRecovery-body-part1 = Ai nevoie de cheia de recuperare a contului ca să restaurezi datele de navigare criptate dacă uiți parola.
postRemoveAccountRecovery-body-part2 = Dacă nu ai făcut-o deja, creează o cheie nouă de recuperare a contului în setările contului pentru a preveni pierderea parolelor salvate, a marcajelor, a istoricului de navigare și a altor date.
postRemoveAccountRecovery-action = Gestionează contul
postRemoveRecoveryPhone-subject = Numărul de telefon de recuperare a fost eliminat
postRemoveRecoveryPhone-preview = Cont protejat cu autentificare în doi pași
postRemoveRecoveryPhone-title = Numărul de telefon de recuperare a fost eliminat
postRemoveRecoveryPhone-description-v2 = Numărul de telefon de recuperare a fost eliminat din setările pentru autentificare în doi pași.
postRemoveRecoveryPhone-description-extra = Poți folosi în continuare codurile de autentificare de rezervă pentru conectare dacă nu poți utiliza aplicația de autentificare.
postRemoveRecoveryPhone-requested-device = Ai făcut cererea de pe:
postRemoveSecondary-subject = Adresă de e-mail secundară eliminată
postRemoveSecondary-title = Adresă de e-mail secundară eliminată
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Ai eliminat cu succes { $secondaryEmail } ca adresă de e-mail secundară din contul tău { -product-mozilla-account }. Notificările de securitate și confirmările de autentificare nu vor mai fi trimise la această adresă.
postRemoveSecondary-action = Gestionează contul
postRemoveTwoStepAuthentication-subject-line-2 = Autentificare în doi pași dezactivată
postRemoveTwoStepAuthentication-title-2 = Ai dezactivat autentificarea în doi pași
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = L-ai dezactivat de pe:
postRemoveTwoStepAuthentication-action = Gestionează contul
postRemoveTwoStepAuthentication-not-required-2 = Nu mai ai nevoie de coduri de securitate din aplicația de autentificare când te autentifici.
postSigninRecoveryCode-subject = Cod de autentificare de rezervă utilizat pentru autentificare
postSigninRecoveryCode-preview = Confirmă activitatea contului
postSigninRecoveryCode-title = Codul de autentificare de rezervă a fost folosit pentru autentificare
postSigninRecoveryCode-description = Dacă nu ai făcut-o tu, trebuie să îți schimbi imediat parola ca să îți păstrezi contul în siguranță.
postSigninRecoveryCode-device = Te-ai conectat de pe:
postSigninRecoveryCode-action = Gestionează contul
postSigninRecoveryPhone-subject = Număr de telefon de recuperare folosit pentru autentificare
postSigninRecoveryPhone-preview = Confirmă activitatea contului
postSigninRecoveryPhone-title = Numărul de telefon de recuperare a fost folosit pentru autentificare
postSigninRecoveryPhone-description = Dacă nu ai făcut-o tu, trebuie să îți schimbi imediat parola ca să îți păstrezi contul în siguranță.
postSigninRecoveryPhone-device = Te-ai conectat de pe:
postSigninRecoveryPhone-action = Gestionează contul
postVerify-sub-title-3 = Suntem încântați să te vedem!
postVerify-title-2 = Vrei să vezi aceeași filă pe două dispozitive?
postVerify-description-2 = E simplu! Instalează { -brand-firefox } pe un alt dispozitiv și intră în cont pentru sincronizare. E ca prin magie!
postVerify-sub-description = (Psst… Înseamnă și că poți accesa marcajele, parolele și alte date { -brand-firefox } oriunde ești conectat(ă).)
postVerify-subject-4 = Bine ai venit la { -brand-mozilla }!
postVerify-setup-2 = Conectează un alt dispozitiv:
postVerify-action-2 = Conectează alt dispozitiv
postVerifySecondary-subject = E-mail secundar adăugat
postVerifySecondary-title = E-mail secundar adăugat
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Ai confirmat cu succes { $secondaryEmail } ca adresă de e-mail secundară pentru { -product-mozilla-account }. Notificările de securitate și confirmarea intrărilor în cont vor fi trimise acum la ambele adrese de e-mail.
postVerifySecondary-action = Gestionează contul
recovery-subject = Resetează-ți parola
recovery-title-2 = Ți-ai uitat parola?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Am primit o solicitare de schimbare a parolei pentru contul { -product-mozilla-account } de pe:
recovery-new-password-button = Creează o parolă nouă dând clic pe butonul de mai jos. Linkul va expira într-o oră.
recovery-copy-paste = Creează o parolă nouă prin copierea și inserarea URL-ului de mai jos în browser. Linkul va expira într-o oră.
recovery-action = Creează o parolă nouă
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Abonamentul { $productName } a fost anulat
subscriptionAccountDeletion-title = Ne pare rău că pleci
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Ți-ai șters recent { -product-mozilla-account }. Prin urmare, ți-am anulat abonamentul { $productName }. Factura finală { $invoiceTotal } a fost achitată la data de { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Bine ai venit la { $productName }: Setează-ți parola.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Bine ai venit la { $productName }
subscriptionAccountFinishSetup-content-processing = Plata este în curs de procesare și finalizarea poate dura până la patru zile lucrătoare. Abonamentul se va reînnoi automat în fiecare perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
subscriptionAccountFinishSetup-content-create-3 = Apoi, vei crea o parolă { -product-mozilla-account } ca să începi să îți folosești abonamentul.
subscriptionAccountFinishSetup-action-2 = Începe
subscriptionAccountReminderFirst-subject = Memento: Finalizează configurarea contului
subscriptionAccountReminderFirst-title = Încă nu poți accesa abonamentul
subscriptionAccountReminderFirst-content-info-3 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Sperăm că vei termina configurarea contului, astfel încât să poți utiliza noul abonament.
subscriptionAccountReminderFirst-content-select-2 = Selectează „Creează parolă” pentru a configura o parolă nouă și ca să finalizezi confirmarea contului.
subscriptionAccountReminderFirst-action = Creează parola
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ultima reamintire: Configurează contul
subscriptionAccountReminderSecond-title-2 = Bine ai venit la { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Sperăm că vei termina configurarea contului, astfel încât să poți utiliza noul abonament.
subscriptionAccountReminderSecond-content-select-2 = Selectează „Creează parolă” pentru a configura o parolă nouă și ca să finalizezi confirmarea contului.
subscriptionAccountReminderSecond-action = Creează parola
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Abonamentul la { $productName } a fost anulat
subscriptionCancellation-title = Ne pare rău că pleci

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Ți-am anulat abonamentul la { $productName }. Plata finală de { $invoiceTotal } a fost efectuată pe data de { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Ți-am anulat abonamentul la { $productName }. Plata finală de { $invoiceTotal } va fi efectuată pe data de { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Serviciul va continua până la sfârșitul perioadei de facturare curente, care este { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Ai trecut la { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Ai trecut cu succes de la { $productNameOld } la { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Începând cu următoarea factură, tariful se va modifica din { $paymentAmountOld } pe{ $productPaymentCycleOld } în { $paymentAmountNew } pe { $productPaymentCycleNew }. Tot atunci vei primi un credit unic de { $paymentProrated } care să reflecte tariful mai mic pentru restul acestei{ $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Dacă trebuie să instalezi software nou ca să folosești { $productName }, vei primi un mesaj separat pe e-mail cu instrucțiunile de descărcare.
subscriptionDowngrade-content-auto-renew = Abonamentul se va reînnoi automat cu o perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Abonamentul { $productName } a fost anulat
subscriptionFailedPaymentsCancellation-title = Abonamentul a fost anulat
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Ți-am anulat abonamentul la { $productName } pentru că au eșuat mai multe încercări de plată. Pentru a obține iar accesul, fă-ți un abonament nou cu o metodă de plată actualizată.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Plată confirmată pentru { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Îți mulțumim că te-ai abonat la { $productName }
subscriptionFirstInvoice-content-processing = Plata efectuată este în procesare și poate dura până la patru zile lucrătoare.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Vei primi un mesaj nou pe e-mail despre cum să începi să utilizezi { $productName }.
subscriptionFirstInvoice-content-auto-renew = Abonamentul se va reînnoi automat cu o perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Următoarea factură va fi emisă pe data de { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Metodă de plată pentru { $productName } expirată sau care expiră în curând
subscriptionPaymentExpired-title-2 = Metoda ta de plată a expirat sau va expira în curând
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Metoda de plată pe care o folosești pentru { $productName } este expirată sau va expira în curând.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Plata pentru { $productName } a eșuat
subscriptionPaymentFailed-title = Ne pare rău, întâmpinăm probleme cu plata ta
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Am întâmpinat o problemă cu ultima ta plată pentru { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Este posibil să îți fi expirat metoda de plată sau ca metoda de plată actuală să nu mai fie de actualitate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Este necesară actualizarea informațiilor de plată pentru { $productName }
subscriptionPaymentProviderCancelled-title = Ne pare rău, întâmpinăm probleme cu metoda ta de plată
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Am detectat o problemă cu metoda ta de plată pentru { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Este posibil să îți fi expirat metoda de plată sau ca metoda de plată actuală să nu mai fie de actualitate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonamentul pentru { $productName } a fost reactivat
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Îți mulțumim că ți-ai reactivat abonamentul pentru { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ciclul tău de facturare și plăți va rămâne același. Următoarea sumă percepută va fi de { $invoiceTotal } la data de { $nextInvoiceDateOnly }. Abonamentul tău se va reînnoi automat la fiecare perioadă de facturare dacă nu optezi pentru anularea lui.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Notificare de reînnoire automată a abonamentului pentru { $productName }
subscriptionRenewalReminder-title = Abonamentul va fi reînnoit în curând
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Dragă client { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Abonamentul tău actual este setat să se reînnoiască automat în { $reminderLength } zile. Atunci, { -brand-mozilla } îți va reînnoi abonamentul { $planIntervalCount } { $planInterval } și o taxă de { $invoiceTotal } va fi aplicată metodei de plată din contul tău.
subscriptionRenewalReminder-content-closing = Salutări,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Echipa { $productName }
subscriptionReplaced-subject = Abonamentul a fost actualizat ca parte a trecerii la o versiune superioară
subscriptionReplaced-title = Abonamentul a fost actualizat
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Abonamentul tău individual { $productName } a fost înlocuit și acum este inclus în noul pachet.
subscriptionReplaced-content-credit = Vei primi un credit pentru timpul neutilizat din abonamentul anterior. Acest credit va fi aplicat automat contului tău și utilizat pentru plăți viitoare.
subscriptionReplaced-content-no-action = Nu necesită nicio acțiune din partea ta.
subscriptionsPaymentExpired-subject-2 = Metoda de plată pentru abonamentele tale a expirat sau va expira în curând
subscriptionsPaymentExpired-title-2 = Metoda ta de plată a expirat sau va expira în curând
subscriptionsPaymentExpired-content-2 = Metoda de plată pe care o folosești pentru plățile pentru următoarele abonamente a expirat sau va expira în curând.
subscriptionsPaymentProviderCancelled-subject = Este necesară actualizarea informațiilor de plată pentru abonamentele { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Ne pare rău, întâmpinăm probleme cu metoda ta de plată
subscriptionsPaymentProviderCancelled-content-detected = Am detectat o problemă cu metoda ta de plată pentru următoarele abonamente.
subscriptionsPaymentProviderCancelled-content-payment-1 = Este posibil să îți fi expirat metoda de plată sau ca metoda de plată actuală să nu mai fie de actualitate.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Plată primită pentru { $productName }
subscriptionSubsequentInvoice-title = Îți mulțumim că te-ai abonat!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Am primit ultima plată pentru { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Următoarea factură va fi emisă pe data de { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Ai trecut la o versiune superioară de { $productName }
subscriptionUpgrade-title = Îți mulțumim că ai trecut la noua versiune!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Ai trecut cu succes la versiunea superioară de { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ți s-a perceput o taxă unică de { $invoiceAmountDue } pentru a reflecta prețul mai mare al abonamentului pentru restul acestei perioade de facturare ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Ai primit un credit în cont în valoare de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Începând cu următoarea factură, prețul abonamentului se va schimba.
subscriptionUpgrade-content-old-price-day = Tariful anterior era de { $paymentAmountOld } pe zi.
subscriptionUpgrade-content-old-price-week = Tariful anterior era de { $paymentAmountOld } pe săptămână.
subscriptionUpgrade-content-old-price-month = Tariful anterior era de { $paymentAmountOld } pe lună.
subscriptionUpgrade-content-old-price-halfyear = Tariful anterior era de { $paymentAmountOld } pe șase luni.
subscriptionUpgrade-content-old-price-year = Tariful anterior era de { $paymentAmountOld } pe an.
subscriptionUpgrade-content-old-price-default = Tariful anterior era de { $paymentAmountOld } pe perioadă de facturare.
subscriptionUpgrade-content-old-price-day-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe zi.
subscriptionUpgrade-content-old-price-week-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe săptămână.
subscriptionUpgrade-content-old-price-month-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe lună.
subscriptionUpgrade-content-old-price-halfyear-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe șase luni.
subscriptionUpgrade-content-old-price-year-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe an.
subscriptionUpgrade-content-old-price-default-tax = Tariful anterior era de { $paymentAmountOld } + { $paymentTaxOld } taxe pe perioadă de facturare.
subscriptionUpgrade-content-new-price-day = De acum înainte, ți se va factura { $paymentAmountNew } pe zi, excluzând reducerile.
subscriptionUpgrade-content-new-price-week = De acum înainte, ți se va factura { $paymentAmountNew } pe săptămână, excluzând reducerile.
subscriptionUpgrade-content-new-price-month = De acum înainte, ți se va factura { $paymentAmountNew } pe lună, excluzând reducerile.
subscriptionUpgrade-content-new-price-halfyear = De acum înainte, ți se va factura { $paymentAmountNew } pe șase luni, excluzând reducerile.
subscriptionUpgrade-content-new-price-year = De acum înainte, ți se va factura { $paymentAmountNew } pe an, excluzând reducerile.
subscriptionUpgrade-content-new-price-default = De acum înainte, ți se va factura { $paymentAmountNew } pe perioadă de facturare, excluzând reducerile.
subscriptionUpgrade-content-new-price-day-dtax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe zi, excluzând reducerile.
subscriptionUpgrade-content-new-price-week-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe săptămână, excluzând reducerile.
subscriptionUpgrade-content-new-price-month-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe lună, excluzând reducerile.
subscriptionUpgrade-content-new-price-halfyear-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe șase luni, excluzând reducerile.
subscriptionUpgrade-content-new-price-year-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe an, excluzând reducerile.
subscriptionUpgrade-content-new-price-default-tax = De acum înainte, ți se va factura { $paymentAmountNew } + { $paymentTaxNew } taxe pe perioadă de facturare, excluzând reducerile.
subscriptionUpgrade-existing = Dacă oricare dintre abonamentele tale existente se suprapune cu această trecere la o versiune superioară, le vom gestiona și îți vom trimite un mesaj separat pe e-mail cu detaliile. Dacă noul tău plan include produse care necesită instalare, îți vom trimite un mesaj separat pe e-mail cu instrucțiuni de configurare.
subscriptionUpgrade-auto-renew = Abonamentul se va reînnoi automat cu o perioadă de facturare, cu excepția cazului în care alegi să îl anulezi.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Folosește { $unblockCode } pentru autentificare
unblockCode-preview = Codul expiră într-o oră
unblockCode-title = Tu ești încerci să te autentifici?
unblockCode-prompt = Dacă da, iată codul de autorizare de care ai nevoie:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Dacă da, iată codul de autorizare de care ai nevoie: { $unblockCode }
unblockCode-report = Dacă nu, ajută-ne să ținem departe intrușii și <a data-l10n-name="reportSignInLink">raportează-ne</a>.
unblockCode-report-plaintext = Dacă nu, ajută-ne să blocăm intrușii și raportează-ne.
verificationReminderFinal-subject = Ultima reamintire să îți confirmi contul
verificationReminderFinal-description-2 = Acum câteva săptămâni ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Pentru siguranța ta, vom șterge contul dacă nu este verificat în următoarele 24 de ore.
confirm-account = Confirmă contul
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ține minte că trebuie să confirmi contul
verificationReminderFirst-title-3 = Bine ai venit la { -brand-mozilla }!
verificationReminderFirst-description-3 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Te rugăm să confirmi contul în următoarele 15 zile, altfel va fi șters automat.
verificationReminderFirst-sub-description-3 = Nu rata browserul care te pune pe tine și confidențialitatea ta pe primul loc.
confirm-email-2 = Confirmă contul
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmă contul
verificationReminderSecond-subject-2 = Ține minte că trebuie să confirmi contul
verificationReminderSecond-title-3 = Nu rata { -brand-mozilla }!
verificationReminderSecond-description-4 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Te rugăm să confirmi contul în următoarele 10 zile, altfel va fi șters automat.
verificationReminderSecond-second-description-3 = Contul { -product-mozilla-account } îți permite să îți sincronizezi experiența { -brand-firefox } pe toate dispozitivele și deblochează accesul la mai multe produse { -brand-mozilla } care îți protejează confidențialitatea.
verificationReminderSecond-sub-description-2 = Alătură-te misiunii noastre de a transforma internetul într-un loc deschis tuturor.
verificationReminderSecond-action-2 = Confirmă contul
verify-title-3 = Intră pe internet cu { -brand-mozilla }
verify-description-2 = Confirmă-ți contul și folosește la maxim { -brand-mozilla } oriunde te autentifici, începând cu:
verify-subject = Finalizează crearea contului
verify-action-2 = Confirmă contul
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Folosește { $code } pentru a-ți schimba contul
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Codul expiră în { $expirationTime } minut
        [few] Codul expiră în { $expirationTime } minute
       *[other] Codul expiră în { $expirationTime } de minute
    }
verifyAccountChange-title = Îți modifici informațiile contului?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Ajută-ne să îți ținem contul în siguranță aprobând autentificarea în:
verifyAccountChange-prompt = Dacă da, iată codul tău de autorizare:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Expiră în { $expirationTime } minut
        [few] Expiră în { $expirationTime } minute
       *[other] Expiră în { $expirationTime } de minute
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Te-ai autentificat în { $clientName }?
verifyLogin-description-2 = Ajută-ne să îți protejăm contul confirmând autentificarea în:
verifyLogin-subject-2 = Confirmă autentificarea
verifyLogin-action = Confirmă autentificarea
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Folosește { $code } pentru autentificare
verifyLoginCode-preview = Codul expiră în 5 minute.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Te-ai autentificat în { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ajută-ne să îți protejăm contul aprobând autentificarea în:
verifyLoginCode-prompt-3 = Dacă da, iată codul tău de autorizare:
verifyLoginCode-expiry-notice = Expiră în 5 minute.
verifyPrimary-title-2 = Confirmă adresa de e-mail primară
verifyPrimary-description = A fost trimisă o cerere de modificare a contului tău pe următorul dispozitiv:
verifyPrimary-subject = Confirmă adresa primară de e-mail
verifyPrimary-action-2 = Confirmă adresa de e-mail
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Odată confirmată, vor fi posibile modificări ale contului de pe acest dispozitiv, precum adăugarea unei adrese de e-mail secundare.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Folosește { $code } pentru confirmarea adresei secundare de e-mail
verifySecondaryCode-preview = Codul expiră în 5 minute.
verifySecondaryCode-title-2 = Confirmă adresa de e-mail secundară
verifySecondaryCode-action-2 = Confirmă adresa de e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = A fost trimisă o cerere pentru a folosi { $email } ca adresă de e-mail secundară de pe următorul cont { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Folosește acest cod de confirmare:
verifySecondaryCode-expiry-notice-2 = Expiră în 5 minute. Odată confirmată, această adresă va începe să primească notificări de securitate și confirmări.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Folosește { $code } pentru confirmarea contului
verifyShortCode-preview-2 = Codul expiră în 5 minute.
verifyShortCode-title-3 = Intră pe internet cu { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirmă-ți contul și folosește la maxim { -brand-mozilla } oriunde te autentifici, începând cu:
verifyShortCode-prompt-3 = Folosește acest cod de confirmare:
verifyShortCode-expiry-notice = Expiră în 5 minute.
