## Non-email strings

session-verify-send-push-title-2 = Skrá þig inn á { -product-mozilla-account }?
session-verify-send-push-body-2 = Smelltu hér til að staðfesta að þetta sért þú
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } er { -brand-mozilla } staðfestingarkóðinn þinn. Hann rennur út eftir 5 mínútur.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } staðfestingarkóði: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } er { -brand-mozilla } endurheimtukóðinn þinn. Hann rennur út eftir 5 mínútur.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kóði: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } er { -brand-mozilla } endurheimtukóðinn þinn. Hann rennur út eftir 5 mínútur.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kóði: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } merki">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Samstilla tæki">
body-devices-image = <img data-l10n-name="devices-image" alt="Tæki">
fxa-privacy-url = Persónuverndarstefna { -brand-mozilla }
moz-accounts-privacy-url-2 = Persónuverndarstefna { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Þjónustuskilmálar { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } táknmerki">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } táknmerki">
subplat-automated-email = Þetta er sjálfvirkur tölvupóstur; ef þú fékkst hann óvart sendan, þarftu ekkert að gera.
subplat-privacy-notice = Meðferð persónuupplýsinga
subplat-privacy-plaintext = Meðferð persónuupplýsinga:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Þú færð þennan tölvupóst vegna þess að { $email } er með { -product-mozilla-account } og þú hefur skráð þig á { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Þú færð þennan tölvupóst vegna þess að { $email } er með { -product-mozilla-account }.
subplat-explainer-multiple-2 = Þú færð þennan tölvupóst vegna þess að { $email } er með { -product-mozilla-account } og þú ert áskrifandi að ýmsum þjónustum.
subplat-explainer-was-deleted-2 = Þú færð þennan tölvupóst vegna þess að { $email } var skráð fyrir { -product-mozilla-account }.
subplat-manage-account-2 = Sýslaðu með stillingar { -product-mozilla-account } með því að fara á <a data-l10n-name="subplat-account-page">reikningssíðuna þína</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Stjórnaðu stillingum { -product-mozilla-account } með því að fara á reikningssíðuna þína: { $accountSettingsUrl }
subplat-terms-policy = Skilmálar og afbókunarreglur
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Hætta áskrift
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Endurvirkja áskrift
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Uppfæra greiðsluupplýsingar
subplat-privacy-policy = Persónuverndarstefna { -brand-mozilla }
subplat-privacy-policy-2 = Persónuverndarstefna { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Þjónustuskilmálar { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Lögfræðilegt efni
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Friðhelgi
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Ef reikningnum þínum er eytt, færðu samt áfram tölvupósta frá Mozilla Corporation og Mozilla Foundation, nema þú <a data-l10n-name="unsubscribeLink">biðjir um að áskriftinni að þeim sé sagt upp</a>.
account-deletion-info-block-support = Ef þú hefur einhverjar spurningar eða þarft aðstoð, skaltu ekki hika við að hafa samband við <a data-l10n-name="supportLink">aðstoðarteymið okkar</a>.
account-deletion-info-block-communications-plaintext = Ef reikningnum þínum er eytt, færðu samt áfram tölvupósta frá Mozilla Corporation og Mozilla Foundation, nema þú biðjir um að áskriftinni að þeim sé sagt upp:
account-deletion-info-block-support-plaintext = Ef þú hefur einhverjar spurningar eða þarft aðstoð, skaltu ekki hika við að hafa samband við aðstoðarteymið okkar:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Sæktu { $productName } á { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Sæktu { $productName } í { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Settu { $productName } upp á <a data-l10n-name="anotherDeviceLink">annarri vinnutölvu</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Settu { $productName } upp á <a data-l10n-name="anotherDeviceLink">öðru tæki</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Náðu í { $productName } á Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Sæktu { $productName } í App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Settu upp { $productName } á öðru tæki:
automated-email-change-2 = Ef það varst ekki þú sem gerðir þessa aðgerð skaltu <a data-l10n-name="passwordChangeLink">breyta lykilorðinu þínu</a> strax.
automated-email-support = Til að sjá nánari upplýsingar, skaltu fara á <a data-l10n-name="supportLink">{ -brand-mozilla } aðstoðargáttina</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ef það varst ekki þú sem gerðir þessa aðgerð skaltu breyta lykilorðinu þínu strax:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Til að sjá nánari upplýsingar, skaltu fara á { -brand-mozilla } aðstoðargáttina:
automated-email-inactive-account = Þetta er sjálfvirkur tölvupóstur. Þú ert að fá hann vegna þess að þú ert með { -product-mozilla-account } og að liðin eru 2 ár síðan þú skráðir þig inn síðast.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext }Til að sjá frekari upplýsingar, skaltu fara á <a data-l10n-name="supportLink">{ -brand-mozilla } aðstoðargáttina</a>.
automated-email-no-action-plaintext = Þetta er sjálfvirkur tölvupóstur. Ef þú fékkst hann fyrir mistök þarftu ekki að gera neitt.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Þetta er sjálfvirkur tölvupóstur; ef þú leyfðir ekki þessa aðgerð skaltu endilega breyta lykilorðinu þínu:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Þessi beiðni kom frá { $uaBrowser } á { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Þessi beiðni kom frá { $uaBrowser } á { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Þessi beiðni kom frá { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Þessi beiðni kom frá { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Þessi beiðni kom frá { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ef þetta varst ekki þú, <a data-l10n-name="revokeAccountRecoveryLink">skaltu eyða nýja lyklinum</a> og <a data-l10n-name="passwordChangeLink">breyta lykilorðinu þínu</a>.
automatedEmailRecoveryKey-change-pwd-only = Ef þetta varst ekki þú, <a data-l10n-name="passwordChangeLink">skaltu breyta lykilorðinu þínu</a>.
automatedEmailRecoveryKey-more-info = Til að sjá nánari upplýsingar, skaltu fara á <a data-l10n-name="supportLink">{ -brand-mozilla } aðstoðargáttina</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Þessi beiðni kom frá:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ef þetta varst ekki þú, skaltu eyða nýja lyklinum:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ef þetta varst ekki þú, skaltu breyta lykilorðinu þínu:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = og breyta lykilorðinu þínu:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Til að sjá nánari upplýsingar, skaltu fara á { -brand-mozilla } aðstoðargáttina:
automated-email-reset =
    Þetta er sjálfvirkur tölvupóstur; ef þú heimilaðir ekki þessa aðgerð, skaltu <a data-l10n-name="resetLink">endurstilla lykilorðið þitt</a>.
    Til að sjá frekari upplýsingar, geturðu farið á <a data-l10n-name="supportLink">{ -brand-mozilla } Support aðstoðargáttina</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ef það varst ekki þú sem leyfðir þessa aðgerð, þá skaltu endurstilla lykilorðið þitt núna á { $resetLink }
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ef það varst ekki þú sem gerðir þessa aðgerð skaltu endurstilla lykilorðið þitt strax:
brand-banner-message = Vissir þú að við breyttum nafni okkar úr { -product-firefox-accounts } í { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Frekari upplýsingar</a>
cancellationSurvey = Hjálpaðu okkur við að bæta þjónustuna með því að taka þátt í <a data-l10n-name="cancellationSurveyUrl">stuttri könnun</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Hjálpaðu okkur við að bæta þjónustuna með því að taka þátt í stuttri könnun:
change-password-plaintext = Ef þig grunar að einhver sé að reyna að fá aðgang að notandaaðgangnum þínum, skaltu endurstilla lykilorðið þitt.
manage-account = Sýsla með reikning
manage-account-plaintext = { manage-account }:
payment-details = Nánar um greiðslu:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Reikningur númer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Innheimt: { $invoiceTotal } þann { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Næsti reikningur: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Samtala: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-discount = Afsláttur
subscription-charges-discount-plaintext = Afsláttur: { $invoiceDiscountAmount }
subscription-charges-taxes = Skattar og gjöld
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Skattar og gjöld: { $invoiceTaxAmount }
subscription-charges-total = <b>Samtals</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Samtals: { $invoiceTotal }
subscription-charges-amount-paid = <b>Greidd upphæð</b>

##

subscriptionSupport = Spurningar varðandi áskriftina þína? <a data-l10n-name="subscriptionSupportUrl">Aðstoðarteymið</a> okkar er hér til að hjálpa þér.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Spurningar um áskriftina þína? Þjónustuteymi okkar er hér til að hjálpa þér:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Þakka þér fyrir að gerast áskrifandi að { $productName }. Ef þú hefur einhverjar spurningar um áskriftina þína eða þarft frekari upplýsingar um { $productName } geturðu <a data-l10n-name="subscriptionSupportUrl">haft samband við okkur</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Þakka þér fyrir að gerast áskrifandi að { $productName }. Ef þú hefur einhverjar spurningar um áskriftina þína eða þarft frekari upplýsingar um { $productName } geturðu haft samband við okkur:
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Hafa samband við aðstoðarteymið:
subscriptionUpdateBillingEnsure = Þú getur tryggt að greiðslumáti og reikningsupplýsingar þínar séu uppfærðar <a data-l10n-name="updateBillingUrl">hér</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Þú getur tryggt að greiðslumáti og reikningsupplýsingar þínar séu uppfærðar hér:
subscriptionUpdateBillingTry = Við reynum aftur að fá greiðsluna þína í gegn á næstu dögum, en þú gætir þurft að hjálpa okkur við að lagfæra þetta með því að <a data-l10n-name="updateBillingUrl">uppfæra greiðsluupplýsingarnar þínar</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Við reynum aftur að fá greiðsluna þína í gegn á næstu dögum, en þú gætir þurft að hjálpa okkur við að lagfæra þetta með því að uppfæra greiðsluupplýsingarnar þínar:
subscriptionUpdatePayment = Til að koma í veg fyrir truflanir á þjónustunni þinni skaltu <a data-l10n-name="updateBillingUrl">uppfæra greiðsluupplýsingarnar þínar</a> eins fljótt og auðið er.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Til að koma í veg fyrir truflanir á þjónustunni þinni skaltu uppfæra greiðsluupplýsingarnar þínar eins fljótt og auðið er:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } á { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } á { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (áætlað)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (áætlað)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (áætlað)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (áætlað)
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Skoða reikning: { $invoiceLink }
cadReminderFirst-subject-1 = Áminning! Við ættum að samstilla { -brand-firefox }
cadReminderFirst-action = Samstilla annað tæki
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Það þarf tvennt til að samstilla
cadReminderFirst-description-v2 = Taktu flipana með þér yfir á öll tækin þín. Fáðu bókamerkin þín, lykilorð og önnur gögn hvert sem þú notar { -brand-firefox }.
cadReminderSecond-subject-2 = Ekki missa af! Ljúkum við uppsetningu samstillingar hjá þér
cadReminderSecond-action = Samstilla annað tæki
cadReminderSecond-title-2 = Ekki gleyma að samstilla!
cadReminderSecond-description-sync = Samstilltu bókamerkin og lykilorðin þín, allsstaðar þar sem þú notar { -brand-firefox }.
cadReminderSecond-description-plus = Auk þess eru gögnin þín alltaf dulrituð. Aðeins þú og tæki sem þú samþykkir geta séð þau.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Velkomin í { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Velkomin í { $productName }
downloadSubscription-content-2 = Við skulum byrja á að nota alla eiginleikana sem fylgja áskriftinni þinni:
downloadSubscription-link-action-2 = Komast í gang
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } þínum var eytt
fraudulentAccountDeletion-title = Reikningnum þínum var eytt
fraudulentAccountDeletion-content-part1-v2 = Nýlega var stofnaður { -product-mozilla-account } og áskrift sett í innheimtu með þessu póstfangi. Eins og við gerum með alla nýja reikninga, báðum við þig um að staðfesta reikninginn þinn með því að staðfesta þetta tölvupóstfang fyrst.
fraudulentAccountDeletion-content-part2-v2 = Sem stendur sjáum við að reikningurinn hefur aldrei verið staðfestur. Þar sem ekki var lokið við þetta skref, getum við ekki verið viss um hvort þetta hafi verið heimil áskrift. Þess vegna var { -product-mozilla-account } sem skráður var á þetta póstfang eytt og áskriftinni sagt upp auk þess að allar kröfur hafa verið endurgreiddar.
fraudulentAccountDeletion-contact = Ef þú ert með einhverjar spurningar skaltu hafa samband við <a data-l10n-name="mozillaSupportUrl">aðstoðarteymið okkar</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ef þú ert með einhverjar spurningar skaltu hafa samband við aðstoðarteymið okkar: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Síðasti séns til að halda { -product-mozilla-account }-reikningnum þínum
inactiveAccountFinalWarning-title = { -brand-mozilla }-reikningnum þínum og tengdum gögnum verður eytt
inactiveAccountFinalWarning-preview = Skráðu þig inn til að halda reikningnum þínum
inactiveAccountFinalWarning-account-description = { -product-mozilla-account } er notað til að fá aðgang að ókeypis persónuverndar- og vafraþjónustu á borð við { -brand-firefox }-samstillingu, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Þann <strong>{ $deletionDate }</strong> verður reikningnum þínum og persónulegum gögnum eytt varanlega nema þú skráir þig inn.
inactiveAccountFinalWarning-action = Skráðu þig inn til að halda reikningnum þínum
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Skráðu þig inn til að halda reikningnum þínum:
inactiveAccountFirstWarning-subject = Ekki tapa reikningnum þínum
inactiveAccountFirstWarning-title = Viltu halda { -brand-mozilla }-reikningnum þínum og tengdum gögnum?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } er notað til að fá aðgang að ókeypis persónuverndar- og vafraþjónustu á borð við { -brand-firefox }-samstillingu, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Við höfum tekið eftir því að þú hefur ekki skráð þig inn í 2 ár.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Reikningnum þínum og persónulegum gögnum verður varanlega eytt þann <strong>{ $deletionDate }</strong> vegna þess að langt er síðan þú hefur notað þetta.
inactiveAccountFirstWarning-action = Skráðu þig inn til að halda reikningnum þínum
inactiveAccountFirstWarning-preview = Skráðu þig inn til að halda reikningnum þínum
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Skráðu þig inn til að halda reikningnum þínum:
inactiveAccountSecondWarning-subject = Aðgerðar krafist: Reikningi verður eytt eftir 7 daga
inactiveAccountSecondWarning-title = { -brand-mozilla }-reikningnum þínum og tengdum gögnum verður eytt eftir 7 daga
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account } er notað til að fá aðgang að ókeypis persónuverndar- og vafraþjónustu á borð við { -brand-firefox }-samstillingu, { -product-mozilla-monitor }, { -product-firefox-relay } og { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Reikningnum þínum og persónulegum gögnum verður varanlega eytt þann <strong>{ $deletionDate }</strong> vegna þess að langt er síðan þú hefur notað þetta.
inactiveAccountSecondWarning-action = Skráðu þig inn til að halda reikningnum þínum
inactiveAccountSecondWarning-preview = Skráðu þig inn til að halda reikningnum þínum
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Skráðu þig inn til að halda reikningnum þínum:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Þú ert búinn með alla varaauðkenningarkóða!
codes-reminder-title-one = Þú ert á síðasta varaauðkenningarkóðanum þínum
codes-reminder-title-two = Tími til kominn að búa til fleiri varaauðkenningarkóða
codes-reminder-description-part-one = Varaauðkenningarkóðar hjálpa þér að endurheimta upplýsingarnar þínar þegar þú gleymir lykilorðinu þínu.
codes-reminder-description-part-two = Útbúðu nýja kóða núna svo þú tapir ekki gögnunum þínum síðar.
codes-reminder-description-two-left = Þú átt aðeins tvo kóða eftir.
codes-reminder-description-create-codes = Búðu til nýja varaauðkenningarkóða til að hjálpa þér að komast aftur inn á reikninginn þinn ef þú lokast úti.
lowRecoveryCodes-action-2 = Útbúa kóða
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Enginn varaauðkenningarkóði eftir
        [one] Aðeins 1 varaauðkenningarkóði eftir
       *[other] Aðeins { $numberRemaining } varaauðkenningarkóðar eftir!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ný innskráning á { $clientName }
newDeviceLogin-subjectForMozillaAccount = Ný innskráning á { -product-mozilla-account }-reikninginn þinn
newDeviceLogin-title-3 = { -product-mozilla-account } þinn var notaður til að skrá þig inn
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ekki þú? <a data-l10n-name="passwordChangeLink">Breyttu lykilorðinu þínu</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ekki þú? Breyttu lykilorðinu þínu:
newDeviceLogin-action = Sýsla með reikning
passwordChanged-subject = Lykilorð uppfært
passwordChanged-title = Tókst að breyta lykilorði
passwordChanged-description-2 = Lykilorðinu fyrir { -product-mozilla-account } þinn var breytt af eftirfarandi tæki:
passwordChangeRequired-subject = Vart við grunsamlega virkni
passwordChangeRequired-action = Endurstilla lykilorð
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-title = Gleymdirðu lykilorðinu þínu?
password-forgot-otp-request = Við fengum beiðni um breytingu á lykilorði á { -product-mozilla-account }-reikningnum þínum frá:
password-forgot-otp-code-2 = Ef þetta varst þú, þá er hér staðfestingarkóði þinn til að halda áfram:
password-forgot-otp-expiry-notice = Þessi kóði rennur út eftir 10 mínútur.
passwordReset-subject-2 = Lykilorðið þitt var endurstillt
passwordReset-title-2 = Lykilorðið þitt var endurstillt
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Þú endurstilltir { -product-mozilla-account } lykilorðið þitt á:
passwordResetAccountRecovery-subject-2 = Lykilorðið þitt var endurstillt
passwordResetAccountRecovery-title-3 = Lykilorðið þitt var endurstillt
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Þú notaðir endurheimtulykil reikningsins þíns til að uppfæra { -product-mozilla-account } lykilorðið þitt á:
passwordResetAccountRecovery-information = Við skráðum þig út úr öllum samstilltu tækjunum þínum. Við bjuggum til nýjan endurheimtulykil í stað þess sem þú notaðir. Þú getur breytt þessu í reikningsstillingunum þínum.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Við skráðum þig út úr öllum samstilltu tækjunum þínum. Við bjuggum til nýjan endurheimtulykil í stað þess sem þú notaðir. Þú getur breytt þessu í reikningsstillingunum þínum:
passwordResetAccountRecovery-action-4 = Sýsla með reikning
passwordResetRecoveryPhone-subject = Endurheimtusímanúmer sem var notað
passwordResetRecoveryPhone-preview = Göngum úr skugga um að þetta hafi verið þú
passwordResetRecoveryPhone-action = Sýsla með reikning
passwordResetWithRecoveryKeyPrompt-subject = Lykilorðið þitt var endurstillt
passwordResetWithRecoveryKeyPrompt-title = Lykilorðið þitt var endurstillt
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Þú endurstilltir { -product-mozilla-account } lykilorðið þitt á:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Útbúðu endurheimtulykil reiknings
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Útbúðu endurheimtulykil reiknings:
passwordResetWithRecoveryKeyPrompt-cta-description = Þú þarft að skrá þig inn aftur á öllum samstilltu tækjunum þínum. Næst skaltu halda gögnunum þínum öruggum með endurheimtulykli. Þetta gerir þér kleift að endurheimta gögnin þín ef þú gleymir lykilorðinu þínu.
postAddAccountRecovery-subject-3 = Nýr endurheimtulykill reiknings útbúinn
postAddAccountRecovery-title2 = Þú bjóst til nýjan endurheimtulykil fyrir reikninginn
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Vistaðu þennan lykil á öruggum stað - þú þarft hann til að endurheimta dulrituðu vafragögnin þín ef þú gleymir lykilorðinu þínu.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Aðeins er hægt að nota þennan lykil einu sinni. Eftir að þú hefur notað hann munum við sjálfkrafa búa til nýjan fyrir þig. Eða þú getur búið til nýjan hvenær sem er í stillingum reikningsins þíns.
postAddAccountRecovery-action = Sýsla með reikning
postAddLinkedAccount-subject-2 = Nýr reikningur tengdur við { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName } reikningurinn þinn hefur verið tengdur við { -product-mozilla-account }
postAddLinkedAccount-action = Sýsla með aðgang
postAddRecoveryPhone-subject = Endurheimtusímanúmeri bætt við
postAddRecoveryPhone-preview = Reikningur er varinn með tveggja-þrepa auðkenningu
postAddRecoveryPhone-title-v2 = Þú bættir við endurheimtusímanúmeri
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Þú bættir { $maskedLastFourPhoneNumber } við sem endurheimtusímanúmeri
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Hvernig þetta verndar reikninginn þinn
postAddRecoveryPhone-how-protect-plaintext = Hvernig þetta verndar reikninginn þinn:
postAddRecoveryPhone-enabled-device = Þú virkjaðir það frá:
postAddRecoveryPhone-action = Sýsla með reikning
postAddTwoStepAuthentication-title-2 = Þú kveiktir á tveggja-þrepa auðkenningu
postAddTwoStepAuthentication-action = Sýsla með reikning
postChangeAccountRecovery-subject = Endurheimtulykli reiknings breytt
postChangeAccountRecovery-title = Þú breyttir endurheimtulykli reikningsins þíns
postChangeAccountRecovery-body-part1 = Þú ert nú með nýjan endurheimtulykil. Fyrri lyklinum þínum var eytt.
postChangeAccountRecovery-body-part2 = Vistaðu þennan nýja lykil á öruggum stað - þú þarft hann til að endurheimta dulrituðu vafragögnin þín ef þú gleymir lykilorðinu þínu.
postChangeAccountRecovery-action = Sýsla með reikning
postChangePrimary-subject = Aðaltölvupóstfang uppfært
postChangePrimary-title = Nýtt aðaltölvupóstfang
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Þú hefur náð að breyta aðaltölvupóstfanginu þínu í { $email }. Þetta póstfang er nú notandanafnið sem þú notar til að skrá þig inn á { -product-mozilla-account }, ásamt því að þarna færðu öryggistilkynningar og staðfestingar á innskráningu.
postChangePrimary-action = Sýsla með reikning
postChangeRecoveryPhone-subject = Endurheimtusímanúmer uppfært
postChangeRecoveryPhone-preview = Reikningur er varinn með tveggja-þrepa auðkenningu
postChangeRecoveryPhone-title = Þú breyttir endurheimtusímanúmerinu þínu
postChangeRecoveryPhone-description = Þú ert nú með nýtt endurheimtusímanúmer. Fyrra endurheimtusímanúmeri þínu var eytt.
postChangeRecoveryPhone-requested-device = Þú baðst um það frá:
postConsumeRecoveryCode-title-3 = Varaauðkenningarkóðinn þinn var notaður til að staðfesta endurstillingu lykilorðsins
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kóði notaður frá:
postConsumeRecoveryCode-action = Sýsla með reikning
postConsumeRecoveryCode-subject-v3 = Varaauðkenningarkóði sem var notaður
postConsumeRecoveryCode-preview = Göngum úr skugga um að þetta hafi verið þú
postNewRecoveryCodes-subject-2 = Nýjir varaauðkenningarkóðar búnir til
postNewRecoveryCodes-title-2 = Þú bjóst til varaauðkenningarkóða
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Þau voru búin til á:
postNewRecoveryCodes-action = Sýsla með reikning
postRemoveAccountRecovery-subject-2 = Endurheimtulykli reiknings eytt
postRemoveAccountRecovery-title-3 = Þú eyddir endurheimtulykli fyrir reikninginn þinn
postRemoveAccountRecovery-body-part1 = Endurheimtulykillinn þinn er nauðsynlegur til að endurheimta dulrituðu vafragögnin þín ef þú gleymir lykilorðinu þínu.
postRemoveAccountRecovery-body-part2 = Ef þú hefur ekki gert það nú þegar skaltu búa til nýjan endurheimtulykil í stillingum reikningsins þíns til að koma í veg fyrir að vistuð lykilorð þín, bókamerki, vafurferill og fleira glatist.
postRemoveAccountRecovery-action = Sýsla með reikning
postRemoveRecoveryPhone-subject = Endurheimtusímanúmer fjarlægt
postRemoveRecoveryPhone-preview = Reikningur er varinn með tveggja-þrepa auðkenningu
postRemoveRecoveryPhone-title = Endurheimtusímanúmer fjarlægt
postRemoveRecoveryPhone-requested-device = Þú baðst um það frá:
postRemoveSecondary-subject = Aukatölvupóstfang fjarlægt
postRemoveSecondary-title = Aukatölvupóstfang fjarlægt
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Þú hefur fjarlægt { $secondaryEmail } sem aukapóstfang fyrir { -product-mozilla-account }. Öryggistilkynningar og staðfestingar á innskráningu verða ekki lengur sendar á þetta tölvupóstfang.
postRemoveSecondary-action = Sýsla með reikning
postRemoveTwoStepAuthentication-subject-line-2 = Slökkt er á tveggja-þrepa auðkenningu
postRemoveTwoStepAuthentication-title-2 = Þú slökktir á tveggja-þrepa auðkenningu
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Þú gerðir hana óvirka frá:
postRemoveTwoStepAuthentication-action = Sýsla með reikning
postRemoveTwoStepAuthentication-not-required-2 = Þú þarft ekki lengur öryggiskóða úr auðkenningarforritinu þínu þegar þú skráir þig inn.
postSigninRecoveryCode-subject = Varaauðkenningarkóði sem notaður var til innskráningar
postSigninRecoveryCode-preview = Staðfestu virkni á reikningi
postSigninRecoveryCode-title = Varaauðkenningarkóðinn þinn var notaður til innskráningar
postSigninRecoveryCode-description = Ef það varst ekki þú sem gerðir það, ættirðu að breyta lykilorðinu þínu strax til að halda reikningnum þínum öruggum.
postSigninRecoveryCode-device = Þú skráðir þig inn frá:
postSigninRecoveryCode-action = Sýsla með reikning
postSigninRecoveryPhone-subject = Endurheimtusímanúmer notað til að skrá inn
postSigninRecoveryPhone-preview = Staðfestu virkni á reikningi
postSigninRecoveryPhone-title = Endurheimtusímanúmerið þitt var notað til að skrá inn
postSigninRecoveryPhone-description = Ef það varst ekki þú sem gerðir það, ættirðu að breyta lykilorðinu þínu strax til að halda reikningnum þínum öruggum.
postSigninRecoveryPhone-device = Þú skráðir þig inn frá:
postSigninRecoveryPhone-action = Sýsla með reikning
postVerify-sub-title-3 = Við erum ánægð að sjá þig!
postVerify-title-2 = Viltu sjá sama flipa á tveimur tækjum?
postVerify-description-2 = Það er einfalt! Settu bara { -brand-firefox } upp á öðru tæki og skráðu þig inn til að samstilla. Það virkar eins og galdrar!
postVerify-sub-description = (Psst… Það þýðir líka að þú getur náð í bókamerkin þín, lykilorð og önnur { -brand-firefox } gögn hvar sem þú ert skráð/ur inn.)
postVerify-subject-4 = Velkomin í { -brand-mozilla }!
postVerify-setup-2 = Tengja annað tæki:
postVerify-action-2 = Tengja annað tæki
postVerifySecondary-subject = Aukapóstfangi bætt við
postVerifySecondary-title = Aukapóstfangi bætt við
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Þú hefur staðfest { $secondaryEmail } sem aukapóstfang fyrir { -product-mozilla-account }. Öryggistilkynningar og staðfestingar á innskráningu verða nú sendar á bæði tölvupóstföngin.
postVerifySecondary-action = Sýsla með reikning
recovery-subject = Endurstilla lykilorð
recovery-title-2 = Gleymt lykilorð?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Við fengum beiðni um breytingu á lykilorði á { -product-mozilla-account }-reikningnum þínum frá:
recovery-new-password-button = Búðu til nýtt lykilorð með því að smella á hnappinn hér fyrir neðan. Þessi tengill mun renna út innan klukkustundar.
recovery-copy-paste = Búðu til nýtt lykilorð með því að afrita og líma slóðina hér að neðan í vafrann þinn. Þessi tengill mun renna út innan klukkustundar.
recovery-action = Búa til nýtt lykilorð
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Áskriftinni þinni að { $productName } hefur verið hætt
subscriptionAccountDeletion-title = Okkur þykir miður að þú sért á förum
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Þú eyddir { -product-mozilla-account }-reikningnum þínum nýlega. Fyrir vikið höfum við sagt upp { $productName } áskriftinni þinni. Lokagreiðsla þín upp á { $invoiceTotal } var greidd þann { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Velkomin í { $productName }: Stilltu lykilorðið þitt.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Velkomin í { $productName }
subscriptionAccountFinishSetup-content-processing = Greiðslan þín er í vinnslu og getur tekið allt að fjóra virka daga að ganga frá henni. Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
subscriptionAccountFinishSetup-content-create-3 = Næst muntu búa til { -product-mozilla-account }-lykilorð til að geta byrjað að nota nýju áskriftina þína.
subscriptionAccountFinishSetup-action-2 = Komast í gang
subscriptionAccountReminderFirst-subject = Áminning: Ljúktu við að setja upp reikninginn þinn
subscriptionAccountReminderFirst-title = Þú hefur ekki ennþá aðgang að áskriftinni þinni
subscriptionAccountReminderFirst-content-info-3 = Fyrir nokkrum dögum síðan bjóstu til { -product-mozilla-account } en staðfestir hann aldrei. Við vonum að þú ljúkir við að setja upp reikninginn þinn svo þú getir notað nýju áskriftina þína.
subscriptionAccountReminderFirst-content-select-2 = Veldu „Búa til lykilorð“ til að setja upp nýtt lykilorð og ljúka við að staðfesta reikninginn þinn.
subscriptionAccountReminderFirst-action = Búa til lykilorð
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Lokaáminning: Settu upp reikninginn þinn
subscriptionAccountReminderSecond-title-2 = Velkomin í { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Fyrir nokkrum dögum síðan bjóstu til { -product-mozilla-account } en staðfestir hann aldrei. Við vonum að þú ljúkir við að setja upp reikninginn þinn svo þú getir notað nýju áskriftina þína.
subscriptionAccountReminderSecond-content-select-2 = Veldu „Búa til lykilorð“ til að setja upp nýtt lykilorð og ljúka við að staðfesta reikninginn þinn.
subscriptionAccountReminderSecond-action = Búa til lykilorð
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Áskriftinni þinni að { $productName } hefur verið hætt
subscriptionCancellation-title = Okkur þykir miður að þú sért á förum

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Við höfum sagt upp { $productName } áskriftinni þinni. Lokagreiðsla þín að upphæð { $invoiceTotal } var greidd { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Við höfum sagt upp { $productName } áskriftinni þinni. Lokagreiðsla þín að upphæð { $invoiceTotal } verður til greiðslu { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Þjónustan þín verður áfram virk til loka núverandi greiðslutímabils, sem er { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Þú hefur skipt yfir í { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Þér hefur tekist að skipta úr { $productNameOld } yfir í { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Frá og með næsta reikningi þínum mun gjaldið þitt breytast úr { $paymentAmountOld } á { $productPaymentCycleOld } í { $paymentAmountNew } á { $productPaymentCycleNew }. Á þeim tímapunkti muntu einnig fá eins-skiptis inneign upp á { $paymentProrated } til að endurspegla lægra gjaldið fyrir það sem eftir er af { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ef nauðsynlegt er að þú setjir upp nýjan hugbúnað til að geta notað { $productName }, munt þú fá sendan sérstakann tölvupóst með leiðbeiningum varðandi niðurhal.
subscriptionDowngrade-content-auto-renew = Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Áskriftinni þinni að { $productName } hefur verið hætt
subscriptionFailedPaymentsCancellation-title = Áskriftinni þinni hefur verið sagt upp
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Við höfum sagt upp { $productName } áskriftinni þinni vegna þess að margar tilraunir til greiðslu mistókust. Til að fá aðgang aftur skaltu fá þér nýja áskrift með uppfærðum greiðslumáta.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Greiðsla fyrir { $productName } staðfest
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Takk fyrir að gerast áskrifandi að { $productName }
subscriptionFirstInvoice-content-processing = Greiðslan þín er í vinnslu og getur tekið allt að fjóra virka daga að ganga frá henni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Þú færð sérstakan tölvupóst um hvernig eigi að byrja að nota { $productName }.
subscriptionFirstInvoice-content-auto-renew = Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Greiðsla fyrir { $productName } mistókst
subscriptionPaymentFailed-title = Því miður, við eigum í vandræðum með greiðsluna þína
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Við höfum fundið vandamál varðandi síðustu greiðslu þína vegna { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Uppfærsla greiðsluupplýsinga er nauðsynleg fyrir { $productName }
subscriptionPaymentProviderCancelled-title = Því miður, við eigum í vandræðum með greiðslumátann þinn
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Við höfum fundið vandamál varðandi greiðslumátann þinn fyrir { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Áskrift að { $productName } hefur verið endurvirkjuð
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Takk fyrir að endurvirkja { $productName } áskriftina þína!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Greiðslutímabil þitt og reikningsupphæð verða óbreytt. Næsta gjaldfærsla þín verður { $invoiceTotal } þann { $nextInvoiceDateOnly }. Áskriftin þín endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú veljir að hætta áskriftinni.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Tilkynning um sjálfvirka endurnýjun { $productName }
subscriptionRenewalReminder-title = Áskriftin þín verður endurnýjuð fljótlega
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Ágæti viðskiptavinur { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Núverandi áskrift þín er stillt á að endurnýjast sjálfkrafa eftir { $reminderLength } daga. Á þeim tímapunkti mun { -brand-mozilla } endurnýja { $planIntervalCount } { $planInterval } áskriftina þína og upphæðin { $invoiceTotal } verður gjaldfærð á greiðslumátann á reikningnum þínum.
subscriptionRenewalReminder-content-closing = Með bestu kveðjum,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName }-teymið
subscriptionReplaced-title = Áskriftin þín hefur verið uppfærð
subscriptionReplaced-content-no-action = Þú þarft ekki að gera neitt.
subscriptionsPaymentProviderCancelled-subject = Uppfærsla greiðsluupplýsinga er nauðsynleg fyrir { -brand-mozilla }-áskriftir
subscriptionsPaymentProviderCancelled-title = Því miður, við eigum í vandræðum með greiðslumátann þinn
subscriptionsPaymentProviderCancelled-content-detected = Við höfum fundið vandamál varðandi greiðslumátann þinn fyrir eftirfarandi áskriftir.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Greiðsla fyrir { $productName } móttekin
subscriptionSubsequentInvoice-title = Takk fyrir að vera áskrifandi!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Við fengum síðustu greiðslu þína vegna { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Þú hefur uppfært í { $productName }
subscriptionUpgrade-title = Takk fyrir að uppfæra!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Þú hefur uppfært í { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Áskriftin þín mun endurnýjast sjálfkrafa fyrir hvert greiðslutímabil nema þú ákveðir að hætta áskriftinni.
unblockCode-title = Er þetta þú að skrá þig inn?
unblockCode-prompt = Ef já, þá er hérna auðkenningarkóðinn sem þú þarft:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ef já, þá er hérna auðkenningarkóðinn sem þú þarft: { $unblockCode }
unblockCode-report = Ef nei, hjálpaðu okkur að verjast boðflennum með því að <a data-l10n-name="reportSignInLink">tilkynna okkur þetta.</a>
unblockCode-report-plaintext = Ef nei, hjálpaðu okkur að verjast boðflennum með því að tilkynna okkur þetta.
verificationReminderFinal-subject = Lokaáminning um að staðfesta reikninginn þinn
verificationReminderFinal-description-2 = Fyrir nokkrum vikum síðan stofnaðir þú { -product-mozilla-account } en staðfestir hann aldrei. Til að gæta öryggis þíns, munum við eyða reikningnum ef hann er ekki staðfestur innan 24 klukkustunda.
confirm-account = Staðfesta reikning
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Mundu að staðfesta reikninginn þinn
verificationReminderFirst-title-3 = Velkomin í { -brand-mozilla }!
verificationReminderFirst-description-3 = Fyrir nokkrum dögum bjóstu til { -product-mozilla-account }, en staðfestir hann aldrei. Staðfestu reikninginn þinn innan 15 daga eða honum verður sjálfkrafa eytt.
verificationReminderFirst-sub-description-3 = Ekki missa af tækni sem setur þig og friðhelgi þína í fyrsta sæti.
confirm-email-2 = Staðfesta reikning
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Staðfesta reikning
verificationReminderSecond-subject-2 = Mundu að staðfesta reikninginn þinn
verificationReminderSecond-title-3 = Ekki missa af { -brand-mozilla }!
verificationReminderSecond-description-4 = Fyrir nokkrum dögum bjóstu til { -product-mozilla-account }, en staðfestir hann aldrei. Staðfestu reikninginn þinn innan 10 daga eða honum verður sjálfkrafa eytt.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } gerir þér kleift að samstilla { -brand-firefox }-upplýsingarnar þínar á milli tækja og opnar aðgang að meiri persónuverndandi hugbúnaði frá { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Vertu hluti af verkefni okkar að breyta internetinu í stað sem er opinn fyrir alla.
verificationReminderSecond-action-2 = Staðfesta reikning
verify-title-3 = Opnaðu internetið með { -brand-mozilla }
verify-description-2 = Staðfestu reikninginn þinn og fáðu sem mest út úr { -brand-mozilla } hvar sem þú skráir þig inn, til dæmis fyrst á:
verify-subject = Ljúktu við að búa til reikninginn þinn
verify-action-2 = Staðfesta reikning
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Skráðir þú þig inn á { $clientName }?
verifyLogin-description-2 = Hjálpaðu okkur að halda reikningnum þínum öruggum með því að staðfesta að þú hafir skráð þig inn á:
verifyLogin-subject-2 = Staðfestu innskráningu
verifyLogin-action = Staðfesta innskráningu
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Skráðir þú þig inn á { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Hjálpaðu okkur að halda reikningnum þínum öruggum með því að staðfesta innskráninguna þína á:
verifyLoginCode-prompt-3 = Ef já, þá er hérna auðkenningarkóðinn:
verifyLoginCode-expiry-notice = Hann rennur út eftir 5 mínútur.
verifyPrimary-title-2 = Staðfestu aðaltölvupóstfangið
verifyPrimary-description = Beiðni um að breyta reikningi hefur verið gerð úr eftirfarandi tæki:
verifyPrimary-subject = Staðfestu aðaltölvupóstfang
verifyPrimary-action-2 = Staðfestu tölvupóstfangið
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Þegar staðfesting hefur farið fram, verða mögulegar ýmsar breytingar á borð við að bæta við aukapóstfangi af þessu tæki.
verifySecondaryCode-title-2 = Staðfestu aukatölvupóstfang
verifySecondaryCode-action-2 = Staðfestu tölvupóstfangið
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Beiðni um að nota { $email } sem aukatölvupóstfang hefur verið gerð úr eftirfarandi { -product-mozilla-account }-reikningi:
verifySecondaryCode-prompt-2 = Notaðu þennan staðfestingarkóða:
verifySecondaryCode-expiry-notice-2 = Hann rennur út eftir 5 mínútur. Eftir að tölvupóstfangið hefur verið staðfest, mun það fara að fá öryggistilkynningar og staðfestingar.
verifyShortCode-title-3 = Opnaðu internetið með { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Staðfestu reikninginn þinn og fáðu sem mest út úr { -brand-mozilla } hvar sem þú skráir þig inn, til dæmis fyrst á:
verifyShortCode-prompt-3 = Notaðu þennan staðfestingarkóða:
verifyShortCode-expiry-notice = Hann rennur út eftir 5 mínútur.
