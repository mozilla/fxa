



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox accounts
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla Kontod
       *[lowercase] Mozilla kontod
    }
-product-firefox-account = Firefox account
-product-firefox-cloud = Firefox Cloud
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-app-store = App Store
-google-play = Google Play

app-footer-mozilla-logo-label = { -brand-mozilla } logo
app-footer-privacy-notice = Veebisaidi privaatsusteade
app-footer-terms-of-service = Teenuse tingimused



settings-home = Konto avaleht


coupon-submit = Rakenda
coupon-remove = Eemalda
coupon-error = Sisestatud kood on vigane või aegunud.
coupon-error-generic = Koodi töötlemisel esines viga. Palun proovi uuesti.
coupon-error-expired = Sisestatud kood on aegunud.
coupon-error-limit-reached = Sisestatud koodi limiit on täis.
coupon-error-invalid = Sisestatud kood on vigane.
coupon-enter-code =
    .placeholder = Sisestage kood


default-input-error = Selle välja täitmine on kohustuslik
input-error-is-required = Väli { $label } on nõutud




new-user-confirm-email =
    .label = Kinnita oma e-posti aadress
new-user-subscribe-product-assurance = Me kasutame sinu e-posti aadressi ainult sinu konto loomiseks. Me ei müü seda kunagi kolmandatele osapooltele.
new-user-email-validate = E-posti aadress pole korrektne
new-user-email-validate-confirm = E-posti aadressid ei ühti
new-user-already-has-account-sign-in = Sul on juba konto olemas. <a>Logi sisse</a>
new-user-invalid-email-domain = Kirjutasid e-posti aadressi valesti? { $domain } ei paku e-posti teenust.


payment-confirmation-thanks-heading = Täname!
payment-confirmation-thanks-heading-account-exists = Täname, kontrolli nüüd oma e-posti!
payment-confirmation-thanks-subheading = Kinnituskiri saadeti aadressile { $email } ning see sisaldab infot, kuidas teenusega { $product_name } alustada.
payment-confirmation-thanks-subheading-account-exists = Sa saad kirja aadressile { $email }, mis sisaldab juhiseid konto seadistamiseks ja samuti makseinfot.
payment-confirmation-order-heading = Tellimuse üksikasjad
payment-confirmation-invoice-number = Arve nr { $invoiceNumber }
payment-confirmation-details-heading-2 = Makseinfo
payment-confirmation-amount = { $amount } perioodis { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } igapäevaselt
       *[other] { $amount } iga { $intervalCount } päeva järel
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } iganädalaselt
       *[other] { $amount } iga { $intervalCount } nädala järel
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } igakuiselt
       *[other] { $amount } iga { $intervalCount } kuu järel
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } iga-aastaselt
       *[other] { $amount } iga { $intervalCount } aasta järel
    }
payment-confirmation-download-button = Jätka allalaadimisega




payment-error-retry-button = Proovi uuesti
payment-error-manage-subscription-button = Halda tellimust




payment-name =
    .placeholder = Täisnimi
    .label = Nimi nii nagu see on kirjas kaardil
payment-cc =
    .label = Sinu kaart
payment-cancel-btn = Tühista
payment-update-btn = Uuenda
payment-pay-btn = Maksa nüüd
payment-validate-name-error = Palun sisesta oma nimi


payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }'i privaatsusreeglid</stripePrivacyLink>


payment-method-header = Vali maksemeetod
payment-method-header-second-step = 2. { payment-method-header }


payment-processing-message = Palun oota, kuni töötleme sinu makset…


payment-confirmation-cc-card-ending-in = Kaart, mis lõpeb numbritega { $last4 }




plan-details-header = Toote üksikasjad
plan-details-list-price = Hinnakirja hind
plan-details-show-button = Kuva üksikasju
plan-details-hide-button = Peida üksikasjad
plan-details-total-label = Kokku


product-no-such-plan = Selle toote puhul sellist plaani pole.




subscription-create-title = Seadista oma tellimus
subscription-success-title = Tellimuse kinnitus
subscription-processing-title = Tellimuse kinnitamine…
subscription-error-title = Viga tellimuse kinnitamisel…
subscription-noplanchange-title = Seda liitumisplaani muudatust ei toetata
subscription-iapsubscribed-title = Juba tellitud
sub-guarantee = 30-päevane raha tagasi garantii


terms = Teenuse tingimused
privacy = Privaatsusreeglid
terms-download = Laadi tingimused alla


document =
    .title = Firefox Accounts
close-aria =
    .aria-label = Sulge
settings-subscriptions-title = Tellimused




general-error-heading = Üldine rakenduse viga
basic-error-message = Midagi läks valesti. Palun proovi hiljem uuesti.
payment-error-1 = Hmm. Sinu makse autoriseerimisel esines probleem. Proovi uuesti või võta ühendust oma kaardi väljaandjaga.
payment-error-2 = Hmm. Sinu makse autoriseerimisel esines probleem. Võta ühendust oma kaardi väljaandjaga.
payment-error-3b = Sinu makse töötlemisel esines ootamatu viga, palun proovi uuesti.
expired-card-error = Näib, et sinu krediitkaart on aegunud. Proovi teist kaarti.
insufficient-funds-error = Näib, et sinu kaardil pole piisavalt raha. Proovi teist kaarti.
withdrawal-count-limit-exceeded-error = Näib, et see makse ületab sinu krediidilimiiti. Proovi teist kaarti.
charge-exceeds-source-limit = Näib, et see makse ületab sinu päevast krediidilimiiti. Proovi teist kaarti.
instant-payouts-unsupported = Näib, et sinu deebetkaart pole kiirmaksete jaoks seadistatud. Proovi teist deebet- või krediitkaarti.
duplicate-transaction = Hmm. Näib, et just saadeti identne tehing. Kontrolli oma maksete ajalugu.
coupon-expired = Näib, et see sooduskood on aegunud.
card-error = Sinu tehingut polnud võimalik töödelda. Palun kontrolli oma krediitkaardi teavet ja proovi siis uuesti.
country-currency-mismatch = Sinu tellimuse valuuta ei kehti maksega seotud riigis.
currency-currency-mismatch = Vabandust. Valuutade vahel ei saa vahetada.
no-subscription-change = Vabandust. Sa ei saa oma tellimusplaani muuta.
iap-already-subscribed = Sa oled juba liitunud teenuse { $mobileAppStore } kaudu.
fxa-account-signup-error-2 = Süsteemivea tõttu ebaõnnestus registreerumine teenusega { $productName }. Sinu makseviisilt pole tasu võetud. Palun proovi uuesti.
fxa-post-passwordless-sub-error = Tellimus kinnitati, aga kinnituslehe laadimine ebaõnnestus. Konto seadistamiseks kontrolli oma e-posti.
newsletter-signup-error = Sa pole tellinud tooteuuenduste kirju. Sa võid uuesti proovida konto seadete alt.
product-plan-error =
    .title = Probleem plaanide laadimisel
product-profile-error =
    .title = Probleem profiili laadimisel
product-customer-error =
    .title = Probleem kliendi laadimisel
product-plan-not-found = Plaani ei leitud


coupon-success = Sinu plaani uuendatakse automaatselt hinnakirja hinnaga.
coupon-success-repeating = Sinu plaani uuendatakse automaatselt pärast { $couponDurationDate } hinnakirja hinnaga.


new-user-card-title = Sisesta oma kaardi andmed
new-user-submit = Telli kohe


sub-update-payment-title = Makseinfo


pay-with-heading-card-only = Maksa kaardiga






product-plan-change-heading = Vaata oma muudatus üle
sub-change-failed = Plaani muutmine ebaõnnestus
sub-change-submit = Kinnita muudatus
sub-update-current-plan-label = Praegune plaan
sub-update-new-plan-label = Uus plaan
sub-update-total-label = Uus summa




sub-item-cancel-sub = Tühista tellimus
sub-item-stay-sub = Jää teenust tellima


sub-item-cancel-msg =
    Pärast { $period } pole sul võimalus enam teenust { $name } kasutada,
    siis on sinu arveldusperioodi viimane päev.
sub-item-cancel-confirm = Tühista minu juurepääs ja salvestatud andmed teenusest { $name } kuupäeval { $period }


sub-route-idx-reactivating = Tellimuse taasaktiveerimine ebaõnnestus
sub-route-idx-cancel-failed = Tellimuse tühistamine ebaõnnestus
sub-route-idx-contact = Võta ühendust toega
sub-route-idx-cancel-msg-title = Meil on kahju sind lahkumas näha
sub-route-idx-cancel-msg =
    Sinu teenuse { $name } tellimus on tühistatud.
          <br />
          Ligipääs teenusele { $name } säilib kuni { $date }.


sub-customer-error =
    .title = Probleem kliendi laadimisel
sub-invoice-error =
    .title = Probleem arvete laadimisel
sub-billing-update-success = Sinu arveldusinfo on edukalt uuendatud


pay-update-change-btn = Muuda
pay-update-manage-btn = Halda


sub-next-bill = Järgmine arve luuakse { $date }
sub-expires-on = Aegub { $date }




pay-update-card-exp = Aegub { $expirationDate }
sub-route-idx-updating = Arveldusinfo uuendamine…
sub-route-payment-modal-heading = Vigane arveldusinfo
sub-route-missing-billing-agreement-payment-alert = Vigane makseinfo; sinu kontol on viga. <div>Halda</div>
sub-route-funding-source-payment-alert = Vigane makseinfo; sinu kontol on viga. Sel häirel võib võtta aega, et ära kaduda pärast edukat info uuendamist. <div>Halda</div>


sub-item-no-such-plan = Selle tellimuse jaoks pole sellist plaani.
invoice-not-found = Hilisemat arvet ei leitud
sub-item-no-such-subsequent-invoice = Selle tellimuse kohta ei leitud hilisemat arvet.


reactivate-confirm-dialog-header = Kas soovid jätkata teenuse { $name } kasutamist?
reactivate-confirm-copy = Sinu ligipääs teenusele { $name } jätkub ning sinu arveldusperiood ja makse suurus jäävad samaks. Järgmine makse on summas { $amount } kaardile, mis lõpeb numbriga { $last } kuupäeval { $endDate }.
reactivate-confirm-without-payment-method-copy = Sinu ligipääs teenusele { $name } jätkub ning sinu arveldusperiood ja makse suurus jäävad samaks. Järgmine makse on summas { $amount } kuupäeval { $endDate }.
reactivate-confirm-button = Telli uuesti


reactivate-panel-copy = Kaotad juurdepääsu teenusele { $name } kuupäeval <strong>{ $date }</strong>.
reactivate-success-copy = Aitäh! Kõik on valmis.
reactivate-success-button = Sulge


sub-iap-item-manage-button = Halda
