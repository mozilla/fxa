



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [definite-article]
            { $capitalization ->
                [upper] Conturile Firefox
               *[lower] conturile Firefox
            }
        [genitive-or-dative]
            { $capitalization ->
                [upper] Conturilor Firefox
               *[lower] conturilor Firefox
            }
       *[indefinite-article]
            { $capitalization ->
                [upper] Conturi Firefox
               *[lower] conturi Firefox
            }
    }
-product-mozilla-account = Cont Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Conturi Mozilla
       *[lowercase] conturi Mozilla
    }
-product-firefox-account =
    { $case ->
        [definite-article]
            { $capitalization ->
                [upper] Contul Firefox
               *[lower] contul Firefox
            }
        [genitive-or-dative]
            { $capitalization ->
                [upper] Contului Firefox
               *[lower] contului Firefox
            }
       *[indefinite-article]
            { $capitalization ->
                [upper] Cont Firefox
               *[lower] cont Firefox
            }
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Eroare generală de aplicație
app-general-err-message = Ceva nu a funcționat. Te rugăm să încerci mai târziu.
app-query-parameter-err-heading = Cerere greșită: Parametri de interogare nevalizi


app-footer-mozilla-logo-label = Sigla { -brand-mozilla }
app-footer-privacy-notice = Notificare privind confidențialitatea site-ului web
app-footer-terms-of-service = Condiții de utilizare a serviciilor


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Se deschide în fereastră nouă


app-loading-spinner-aria-label-loading = Se încarcă…


app-logo-alt-3 =
    .alt = Logo { -brand-mozilla } m



settings-home = Pagina principală a contului
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Cod promoțional aplicat
coupon-submit = Aplică
coupon-remove = Elimină
coupon-error = Codul introdus este nevalid sau expirat.
coupon-error-generic = A apărut o eroare la procesarea codului. Te rugăm să încerci din nou.
coupon-error-expired = Codul introdus a expirat.
coupon-error-limit-reached = Codul introdus a ajuns la limită.
coupon-error-invalid = Codul introdus este nevalid.
coupon-enter-code =
    .placeholder = Introdu codul


default-input-error = Acest câmp este obligatoriu
input-error-is-required = { $label } este necesar


brand-name-mozilla-logo = Logo { -brand-mozilla }


new-user-sign-in-link-2 = Ai deja un { -product-mozilla-account }? <a>Intră în cont</a>
new-user-enter-email =
    .label = Introdu adresa de e-mail
new-user-confirm-email =
    .label = Confirmă adresa de e-mail
new-user-subscribe-product-updates-mozilla = Aș dori să primesc noutăți și actualizări despre produse de la { -brand-mozilla }
new-user-subscribe-product-updates-snp = Aș dori să primesc noutăți și actualizări despre securitate și confidențialitate de la { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Aș dori să primesc noutăți și actualizări despre produse de la { -product-mozilla-hubs } și { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Aș dori să primesc noutăți și actualizări despre produse de la { -product-mdn-plus } și { -brand-mozilla }
new-user-subscribe-product-assurance = Îți folosim adresa de e-mail doar pentru crearea contului. Nu o vom vinde niciodată către terți.
new-user-email-validate = Adresa de e-mail nu este validă
new-user-email-validate-confirm = Adresele de e-mail nu se potrivesc.
new-user-already-has-account-sign-in = Ai deja un cont. <a>Intră în cont</a>
new-user-invalid-email-domain = Ai scris greșit adresa de e-mail? { $domain } nu oferă servicii de poștă electronică.


payment-confirmation-thanks-heading = Îți mulțumim!
payment-confirmation-thanks-heading-account-exists = Îți mulțumim! Acum verifică-ți e-mailul!
payment-confirmation-thanks-subheading = A fost trimis un e-mail de confirmare către { $email } cu detalii despre cum să începi să folosești { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Vei primi un mesaj pe e-mail la { $email } cu instrucțiuni pentru configurarea contului, precum și detaliile de plată.
payment-confirmation-order-heading = Detalii comandă
payment-confirmation-invoice-number = Factura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informații pentru plăți
payment-confirmation-amount = { $amount } per { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } zilnic
        [few] { $amount } la fiecare { $intervalCount } zile
       *[other] { $amount } la fiecare { $intervalCount } de zile
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } săptămânal
        [few] { $amount } la fiecare { $intervalCount } săptămâni
       *[other] { $amount } la fiecare { $intervalCount } de săptămâni
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } lunar
        [few] { $amount } la fiecare { $intervalCount } luni
       *[other] { $amount } la fiecare { $intervalCount } de luni
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } anual
        [few] { $amount } la fiecare { $intervalCount } ani
       *[other] { $amount } la fiecare { $intervalCount } de ani
    }
payment-confirmation-download-button = Continuă cu descărcarea


payment-confirm-with-legal-links-static-3 = Autorizez { -brand-mozilla } să îmi perceapă, prin metoda mea de plată, suma afișată, conform <termsOfServiceLink>Condițiilor de utilizare a serviciilor</termsOfServiceLink> și <privacyNoticeLink>Notificării privind confidențialitatea</privacyNoticeLink>, până ce îmi anulez abonamentul.
payment-confirm-checkbox-error = Trebuie să termini aici ca să treci mai departe


payment-error-retry-button = Încearcă din nou
payment-error-manage-subscription-button = Gestionează-mi abonamentul


iap-upgrade-already-subscribed-2 = Ai deja un abonament la { $productName } prin magazinele de aplicații { -brand-google } sau { -brand-apple }.
iap-upgrade-no-bundle-support = Nu oferim suport pentru upgrade-uri la aceste abonamente, dar o vom face în curând.
iap-upgrade-contact-support = Încă poți obține produsul — te rugăm să contactezi serviciul de asistență pentru a te putea ajuta.
iap-upgrade-get-help-button = Obține ajutor


payment-name =
    .placeholder = Nume complet
    .label = Numele, așa cum apare pe card
payment-cc =
    .label = Cardul tău
payment-cancel-btn = Anulează
payment-update-btn = Actualizează
payment-pay-btn = Plătește acum
payment-pay-with-paypal-btn-2 = Plătește cu { -brand-paypal }
payment-validate-name-error = Te rugăm să îți introduci numele


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } folosește { -brand-name-stripe } și { -brand-paypal } pentru procesarea în siguranță a plăților.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } politica de confidențialitate</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } politica de confidențialitate</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } folosește { -brand-paypal } pentru prelucrarea în siguranță a plăților.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } politica de confidențialitate</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } folosește { -brand-name-stripe } pentru procesarea în siguranță a plăților.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } politica de confidențialitate</stripePrivacyLink>


payment-method-header = Alege metoda de plată
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Mai întâi va trebui să aprobi abonamentul


payment-processing-message = Vă rugăm să așteptați în timp ce procesăm plata dvs. …


payment-confirmation-cc-card-ending-in = Card care se termină cu { $last4 }


pay-with-heading-paypal-2 = Plătește cu { -brand-paypal }


plan-details-header = Detalii produs
plan-details-list-price = Preț de listă
plan-details-show-button = Afișează detaliile
plan-details-hide-button = Ascunde detaliile
plan-details-total-label = Total
plan-details-tax = Taxe și comisioane


product-no-such-plan = Nu există un astfel de plan pentru acest produs.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } taxe
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } zilnic
        [few] { $priceAmount } la fiecare { $intervalCount } zile
       *[other] { $priceAmount } la fiecare { $intervalCount } de zile
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } zilnic
            [few] { $priceAmount } la fiecare { $intervalCount } zile
           *[other] { $priceAmount } la fiecare { $intervalCount } de zile
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } săptămânal
        [few] { $priceAmount } la fiecare { $intervalCount } săptămâni
       *[other] { $priceAmount } la fiecare { $intervalCount } de săptămâni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } săptămânal
            [few] { $priceAmount } la fiecare { $intervalCount } săptămâni
           *[other] { $priceAmount } la fiecare { $intervalCount } de săptămâni
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } lunar
        [few] { $priceAmount } la fiecare { $intervalCount } luni
       *[other] { $priceAmount } la fiecare { $intervalCount } de luni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } lunar
            [few] { $priceAmount } la fiecare { $intervalCount } luni
           *[other] { $priceAmount } la fiecare { $intervalCount } de luni
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } anual
        [few] { $priceAmount } la fiecare { $intervalCount } ani
       *[other] { $priceAmount } la fiecare { $intervalCount } de ani
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } anual
            [few] { $priceAmount } la fiecare { $intervalCount } ani
           *[other] { $priceAmount } la fiecare { $intervalCount } de ani
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } +{ $taxAmount } taxe zilnic
        [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } zile
       *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de zile
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxe zilnic
            [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } zile
           *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de zile
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxe săptămânal
        [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } săptămâni
       *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de săptămâni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxe săptămânal
            [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } săptămâni
           *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de săptămâni
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxe lunar
        [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } luni
       *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de luni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxe lunar
            [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } luni
           *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de luni
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxe anual
        [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } ani
       *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de ani
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxe anual
            [few] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } ani
           *[other] { $priceAmount } + { $taxAmount } taxe la fiecare { $intervalCount } de ani
        }


subscription-create-title = Configurează-ți abonamentul
subscription-success-title = Confirmare abonament
subscription-processing-title = Se confirmă abonamentul …
subscription-error-title = Eroare la confirmarea abonamentului …
subscription-noplanchange-title = Această modificare de plan nu este acceptată
subscription-iapsubscribed-title = Deja abonat(ă)
sub-guarantee = Garanție de rambursare a banilor în 30 de zile


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Condiții de utilizare a serviciilor
privacy = Notificare privind confidențialitatea
terms-download = Descarcă condițiile


document =
    .title = Conturi Firefox
close-aria =
    .aria-label = Închide fereastra de dialog
settings-subscriptions-title = Abonamente
coupon-promo-code = Cod promoțional


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } zilnic
        [few] { $amount } la fiecare { $intervalCount } zile
       *[other] { $amount } la fiecare { $intervalCount } de zile
    }
    .title =
        { $intervalCount ->
            [one] { $amount } zilnic
            [few] { $amount } la fiecare { $intervalCount } zile
           *[other] { $amount } la fiecare { $intervalCount } de zile
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } săptămânal
        [few] { $amount } la fiecare { $intervalCount } săptămâni
       *[other] { $amount } la fiecare { $intervalCount } de săptămâni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } săptămânal
            [few] { $amount } la fiecare { $intervalCount } săptămâni
           *[other] { $amount } la fiecare { $intervalCount } de săptămâni
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } lunar
        [few] { $amount } la fiecare { $intervalCount } luni
       *[other] { $amount } la fiecare { $intervalCount } de luni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } lunar
            [few] { $amount } la fiecare { $intervalCount } luni
           *[other] { $amount } la fiecare { $intervalCount } de luni
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } anual
        [few] { $amount } la fiecare { $intervalCount } ani
       *[other] { $amount } la fiecare { $intervalCount } de ani
    }
    .title =
        { $intervalCount ->
            [one] { $amount } anual
            [few] { $amount } la fiecare { $intervalCount } ani
           *[other] { $amount } la fiecare { $intervalCount } de ani
        }


general-error-heading = Eroare generală de aplicație
basic-error-message = Ceva nu a funcționat. Te rugăm să încerci mai târziu.
payment-error-1 = Hmm. A apărut o problemă la autorizarea plății tale. Încearcă din nou sau contactează emitentul cardului.
payment-error-2 = Hmm. A apărut o problemă la autorizarea plății tale. Contactează emitentul cardului.
payment-error-3b = A apărut o eroare neașteptată la procesarea plății. Te rugăm să încerci din nou.
expired-card-error = Se pare că ți-a expirat cardul de credit. Încearcă alt card.
insufficient-funds-error = Se pare că nu ai fonduri suficiente pe card. Încearcă alt card.
withdrawal-count-limit-exceeded-error = Se pare că această tranzacție îți depășește limita de credit. Încearcă alt card.
charge-exceeds-source-limit = Se pare că această tranzacție îți depășește limita de credit zilnică. Încearcă alt card sau cu același card, dar peste 24 de ore.
instant-payouts-unsupported = Se pare că nu ai cardul de debit configurat pentru plăți instant. Încearcă alt card de debit sau de credit.
duplicate-transaction = Hmm. Se pare că tocmai a fost transmisă o tranzacție identică. Verifică-ți istoricul plăților.
coupon-expired = Se pare că acest cod promoțional a expirat.
card-error = Tranzacția nu a putut fi procesată. Te rugăm să verifici informațiile cardului de credit și încearcă din nou.
country-currency-mismatch = Moneda acestui abonament nu este valabilă pentru țara asociată plății tale.
currency-currency-mismatch = Ne pare rău. Nu poți trece de la o monedă la alta.
location-unsupported = Locația ta actuală nu este acceptată conform Condițiilor noastre de utilizare a serviciilor.
no-subscription-change = Ne pare rău. Nu îți poți modifica planul de abonament.
iap-already-subscribed = Ești deja abonat(ă) prin { $mobileAppStore }.
fxa-account-signup-error-2 = Înregistrarea ta la { $productName } a eșuat din cauza unei erori de sistem. Metoda de plată nu a fost debitată. Te rugăm să încerci din nou.
fxa-post-passwordless-sub-error = Abonament confirmat, dar pagina de confirmare nu s-a încărcat. Te rugăm să verifici adresa de e-mail pentru a-ți configura contul.
newsletter-signup-error = Nu ești înscris(ă) pentru e-mailuri cu actualizări despre produse. Poți încerca din nou în setările contului tău.
product-plan-error =
    .title = Problemă la încărcarea planurilor
product-profile-error =
    .title = Problemă la încărcarea profilului
product-customer-error =
    .title = Problemă la încărcarea clientului
product-plan-not-found = Planul nu a fost găsit
product-location-unsupported-error = Locația nu are suport


coupon-success = Planul se va reînnoi automat cu prețul de listă.
coupon-success-repeating = Planul se va reînnoi automat după { $couponDurationDate } cu prețul de listă.


new-user-step-1-2 = 1. Fă-ți un { -product-mozilla-account }
new-user-card-title = Introdu informațiile cardului
new-user-submit = Abonează-mă acum


sub-update-payment-title = Informații pentru plăți


pay-with-heading-card-only = Plătește cu cardul
product-invoice-preview-error-title = Problemă la încărcarea previzualizării facturii
product-invoice-preview-error-text = Nu s-a putut încărca previzualizarea facturii


subscription-iaperrorupgrade-title = Nu te putem trece la o versiune superioară încă


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Vezi modificarea
sub-change-failed = Modificarea planului a eșuat
sub-update-acknowledgment =
    Planul tău va fi modificat imediat și astăzi ți se va percepe o 
    sumă proporțională cu restul acestui ciclu de facturare. Începând cu { $startingDate } 
    ți se va percepe suma totală.
sub-change-submit = Confirmă modificarea
sub-update-current-plan-label = Plan curent
sub-update-new-plan-label = Plan nou
sub-update-total-label = Total nou
sub-update-prorated-upgrade = Trecere la nivel superior calculată pro-rata


sub-update-new-plan-daily = { $productName } (Zilnic)
sub-update-new-plan-weekly = { $productName } (Săptămânal)
sub-update-new-plan-monthly = { $productName } (Lunar)
sub-update-new-plan-yearly = { $productName } (Anual)
sub-update-prorated-upgrade-credit = Soldul negativ afișat va fi creditat în contul tău și utilizat pentru facturile viitoare.


sub-item-cancel-sub = Anulează abonamentul
sub-item-stay-sub = Păstrează abonamentul


sub-item-cancel-msg =
    Nu vei mai putea folosi { $name } după
    { $period }, ultima zi din ciclul tău de facturare.
sub-item-cancel-confirm =
    Anulează-mi accesul și informațiile mele salvate în
    { $name } la { $period }
sub-promo-coupon-applied = { $promotion_name } cupon aplicat: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Această plată a abonamentului a dus la o creditare a soldului din contul tău: <priceDetails></priceDetails>


sub-route-idx-reactivating = Reactivarea abonamentului a eșuat
sub-route-idx-cancel-failed = Anularea abonamentului a eșuat
sub-route-idx-contact = Contactează serviciul de asistență
sub-route-idx-cancel-msg-title = Ne pare rău că pleci
sub-route-idx-cancel-msg =
    Abonamentul tău pentru { $name } a fost anulat.
          <br />
          Vei mai avea acces la { $name } până la data de { $date }.
sub-route-idx-cancel-aside-2 = Ai întrebări? Intră pe <a>{ -brand-mozilla } Asistență</a>.


sub-customer-error =
    .title = Problemă la încărcarea clientului
sub-invoice-error =
    .title = Problemă la încărcarea facturilor
sub-billing-update-success = Informațiile tale de facturare au fost actualizate cu succes
sub-invoice-previews-error-title = Problemă la încărcarea previzualizării facturilor
sub-invoice-previews-error-text = Nu s-au putut încărca previzualizările de facturi


pay-update-change-btn = Modifică
pay-update-manage-btn = Gestionează


sub-next-bill = Data următoarei facturi: { $date }
sub-next-bill-due-date = Următoarea factură este scadentă la { $date }
sub-expires-on = Expiră la { $date }




pay-update-card-exp = Data expirării: { $expirationDate }
sub-route-idx-updating = Se actualizează informațiile de facturare…
sub-route-payment-modal-heading = Informații de facturare nevalide
sub-route-payment-modal-message-2 = Se pare că există o eroare în contul tău { -brand-paypal }. Trebuie să iei măsurile necesare pentru a rezolva această problemă de plată.
sub-route-missing-billing-agreement-payment-alert = Informații de plată nevalide; a apărut o eroare cu contul tău. <div>Gestionează</div>
sub-route-funding-source-payment-alert = Informații de plată nevalide; a apărut o eroare cu contul tău. Această alertă poate dura ceva timp până să dispară după ce îți actualizezi cu succes informațiile. <div>Gestionează</div>


sub-item-no-such-plan = Nu există un asemenea plan pentru acest abonament.
invoice-not-found = Factura ulterioară nu a fost găsită
sub-item-no-such-subsequent-invoice = Factura ulterioară nu a fost găsită pentru acest abonament.
sub-invoice-preview-error-title = Previzualizarea facturii nu a fost găsită
sub-invoice-preview-error-text = Previzualizarea facturii nu a fost găsită pentru acest abonament


reactivate-confirm-dialog-header = Vrei să folosești în continuare { $name }?
reactivate-confirm-copy =
    Accesul tău la { $name } va continua, iar ciclul de facturare
    și plăți va rămâne același. Data viitoare ți se va debita suma de
    { $amount } de pe cardul care se termină în { $last } la data de { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Accesul tău la { $name } va continua, iar ciclul de facturare
    și plăți va rămâne același. Data viitoare ți se va debita suma de
    { $amount } la data de { $endDate }.
reactivate-confirm-button = Reabonare


reactivate-panel-copy = Vei pierde accesul la { $name } pe data de <strong>{ $date }</strong>.
reactivate-success-copy = Îți mulțumim! Totul este gata.
reactivate-success-button = Închide


sub-iap-item-google-purchase-2 = { -brand-google }: achiziții în aplicație
sub-iap-item-apple-purchase-2 = { -brand-apple }: achiziții în aplicație
sub-iap-item-manage-button = Gestionează
