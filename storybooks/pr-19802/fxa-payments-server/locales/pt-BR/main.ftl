



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $capitalization ->
        [uppercase] Contas Firefox
       *[lowercase] contas Firefox
    }
-product-mozilla-account =
    { $capitalization ->
        [uppercase] Conta Mozilla
       *[lowercase] conta Mozilla
    }
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Contas Mozilla
       *[lowercase] contas Mozilla
    }
-product-firefox-account =
    { $capitalization ->
        [uppercase] Conta Firefox
       *[lowercase] conta Firefox
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

app-general-err-heading = Erro geral na aplicação.
app-general-err-message = Algo deu errado. Tente novamente mais tarde.
app-query-parameter-err-heading = Requisição incorreta: Parâmetros de consulta inválidos


app-footer-mozilla-logo-label = Logotipo da { -brand-mozilla }
app-footer-privacy-notice = Aviso de privacidade do site
app-footer-terms-of-service = Termos de serviço


app-default-title-2 = { -product-mozilla-accounts(capitalization: "uppercase") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "uppercase") }


link-sr-new-window = Abre em nova janela


app-loading-spinner-aria-label-loading = Carregando…


app-logo-alt-3 =
    .alt = Logotipo com m de { -brand-mozilla }



settings-home = Página inicial da conta
settings-project-header-title = { -product-mozilla-account(capitalization: "uppercase") }


coupon-promo-code-applied = Código promocional aplicado
coupon-submit = Aplicar
coupon-remove = Remover
coupon-error = O código inserido é inválido ou expirou.
coupon-error-generic = Houve um erro ao processar o código. Tente novamente.
coupon-error-expired = O código digitado expirou.
coupon-error-limit-reached = O código digitado atingiu o limite.
coupon-error-invalid = O código digitado é inválido.
coupon-enter-code =
    .placeholder = Digitar código


default-input-error = Este campo é obrigatório
input-error-is-required = É necessário { $label }


brand-name-mozilla-logo = Logotipo da { -brand-mozilla }


new-user-sign-in-link-2 = Já tem uma { -product-mozilla-account }? <a>Entre</a>
new-user-enter-email =
    .label = Digite seu email
new-user-confirm-email =
    .label = Confirme seu email
new-user-subscribe-product-updates-mozilla = Quero receber notícias e novidades de produtos da { -brand-mozilla }
new-user-subscribe-product-updates-snp = Quero de receber notícias e novidades da { -brand-mozilla } sobre segurança e privacidade
new-user-subscribe-product-updates-hubs = Quero receber notícias e novidades de produtos de { -product-mozilla-hubs } e { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Quero receber notícias e novidades de produtos de { -product-mdn-plus } e { -brand-mozilla }
new-user-subscribe-product-assurance = Só usamos seu email para criar sua conta. Nunca iremos vender a terceiros.
new-user-email-validate = Email inválido
new-user-email-validate-confirm = Os emails não coincidem
new-user-already-has-account-sign-in = Você já tem uma conta. <a>Entre</a>
new-user-invalid-email-domain = Email digitado errado? { $domain } não oferece email.


payment-confirmation-thanks-heading = Obrigado!
payment-confirmation-thanks-heading-account-exists = Obrigado, agora verifique seu email!
payment-confirmation-thanks-subheading = Um email de confirmação foi enviado para { $email } com detalhes sobre como começar a usar o { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Você receberá um email em { $email } com instruções para configurar sua conta, bem como seus detalhes de pagamento.
payment-confirmation-order-heading = Detalhes do pedido
payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informação de pagamento
payment-confirmation-amount = { $amount } por { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } diariamente
       *[other] { $amount } a cada { $intervalCount } dias
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } semanalmente
       *[other] { $amount } a cada { $intervalCount } semanas
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mensalmente
       *[other] { $amount } a cada { $intervalCount } meses
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } anualmente
       *[other] { $amount } a cada { $intervalCount } anos
    }
payment-confirmation-download-button = Continuar para baixar


payment-confirm-with-legal-links-static-3 = Autorizo à { -brand-mozilla } cobrar com meu método de pagamento a quantia exibida, de acordo com os <termsOfServiceLink>Termos do serviço</termsOfServiceLink> e o <privacyNoticeLink>Aviso de privacidade</privacyNoticeLink>, até eu cancelar minha assinatura.
payment-confirm-checkbox-error = Você precisa concluir isto antes de prosseguir


payment-error-retry-button = Tentar novamente
payment-error-manage-subscription-button = Gerenciar minha assinatura


iap-upgrade-already-subscribed-2 = Você já tem uma assinatura do { $productName } na loja de aplicativos do { -brand-google } ou da { -brand-apple }.
iap-upgrade-no-bundle-support = Não oferecemos suporte a mudanças nessas assinaturas, mas faremos isso em breve.
iap-upgrade-contact-support = Você ainda pode obter este produto. Entre em contato com o suporte para podermos te ajudar.
iap-upgrade-get-help-button = Obter ajuda


payment-name =
    .placeholder = Nome completo
    .label = Nome como aparece em seu cartão
payment-cc =
    .label = Seu cartão
payment-cancel-btn = Cancelar
payment-update-btn = Atualizar
payment-pay-btn = Pagar agora
payment-pay-with-paypal-btn-2 = Pagar com { -brand-paypal }
payment-validate-name-error = Digite seu nome


payment-legal-copy-stripe-and-paypal-3 = A { -brand-mozilla } usa o { -brand-name-stripe } e o { -brand-paypal } para processamento seguro de pagamentos.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Política de privacidade do { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Política de privacidade do { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = A { -brand-mozilla } usa o { -brand-paypal } para processamento seguro de pagamentos.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Política de privacidade do { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = A { -brand-mozilla } usa o { -brand-name-stripe } para processamento seguro de pagamentos.
payment-legal-link-stripe-3 = <stripePrivacyLink>Política de privacidade do { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Escolha um método de pagamento
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primeiro você precisa aprovar sua assinatura


payment-processing-message = Aguarde enquanto processamos seu pagamento…


payment-confirmation-cc-card-ending-in = Cartão com final { $last4 }


pay-with-heading-paypal-2 = Pagar com { -brand-paypal }


plan-details-header = Detalhes do produto
plan-details-list-price = Preço de tabela
plan-details-show-button = Mostra detalhes
plan-details-hide-button = Ocultar detalhes
plan-details-total-label = Total
plan-details-tax = Impostos e taxas


product-no-such-plan = Não existe esse plano para este produto.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } de imposto
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } por dia
       *[other] { $priceAmount } a cada { $intervalCount } dias
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } por dia
           *[other] { $priceAmount } a cada { $intervalCount } dias
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } por semana
       *[other] { $priceAmount } a cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } por semana
           *[other] { $priceAmount } a cada { $intervalCount } semanas
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } por mês
       *[other] { $priceAmount } a cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } por mês
           *[other] { $priceAmount } a cada { $intervalCount } meses
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } por ano
       *[other] { $priceAmount } a cada { $intervalCount } anos
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } por ano
           *[other] { $priceAmount } a cada { $intervalCount } anos
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto por dia
       *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } dias
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto por dia
           *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } dias
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto por semana
       *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto por semana
           *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } semanas
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto por mês
       *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto por mês
           *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } meses
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } de imposto por ano
       *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } anos
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } de imposto por ano
           *[other] { $priceAmount } + { $taxAmount } de imposto a cada { $intervalCount } anos
        }


subscription-create-title = Configurar assinatura
subscription-success-title = Confirmação de assinatura
subscription-processing-title = Confirmando assinatura…
subscription-error-title = Erro ao confirmar assinatura…
subscription-noplanchange-title = Esta mudança de plano de assinatura não é aceita
subscription-iapsubscribed-title = Já tem assinatura
sub-guarantee = Garantia de devolução do dinheiro em 30 dias


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Termos do serviço
privacy = Aviso de privacidade
terms-download = Baixar termos


document =
    .title = Contas Firefox
close-aria =
    .aria-label = Fechar modal
settings-subscriptions-title = Assinaturas
coupon-promo-code = Código promocional


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } por dia
       *[other] { $amount } a cada { $intervalCount } dias
    }
    .title =
        { $intervalCount ->
            [one] { $amount } por dia
           *[other] { $amount } a cada { $intervalCount } dias
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } por semana
       *[other] { $amount } a cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $amount } por semana
           *[other] { $amount } a cada { $intervalCount } semanas
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } por mês
       *[other] { $amount } a cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $amount } por mês
           *[other] { $amount } a cada { $intervalCount } meses
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } por ano
       *[other] { $amount } a cada { $intervalCount } anos
    }
    .title =
        { $intervalCount ->
            [one] { $amount } por ano
           *[other] { $amount } a cada { $intervalCount } anos
        }


general-error-heading = Erro geral na aplicação.
basic-error-message = Algo deu errado. Tente novamente mais tarde.
payment-error-1 = Hmm. Houve um problema ao autorizar seu pagamento. Tente novamente ou entre em contato com o emissor do seu cartão.
payment-error-2 = Hmm. Houve um problema ao autorizar o pagamento. Entre em contato com o emissor do seu cartão.
payment-error-3b = Ocorreu um erro inesperado ao processar seu pagamento, tente novamente.
expired-card-error = Parece que seu cartão de crédito expirou. Tente outro cartão.
insufficient-funds-error = Parece que seu cartão não tem saldo suficiente. Tente outro cartão.
withdrawal-count-limit-exceeded-error = Parece que esta transação excederá seu limite de crédito. Tente outro cartão.
charge-exceeds-source-limit = Parece que esta transação excederá seu limite diário de crédito. Tente outro cartão, ou o mesmo após 24 horas.
instant-payouts-unsupported = Parece que seu cartão de débito não está configurado para pagamentos instantâneos. Tente outro cartão de débito ou crédito.
duplicate-transaction = Hmm. Parece que uma transação idêntica acabou de ser enviada. Verifique seu histórico de pagamentos.
coupon-expired = Parece que o código promocional expirou.
card-error = Não foi possível processar sua transação. Confira as informações do seu cartão de crédito e tente novamente.
country-currency-mismatch = A moeda desta assinatura não é válida para o país associado ao seu pagamento.
currency-currency-mismatch = Desculpe, você não pode mudar para outra moeda.
location-unsupported = Sua localização atual não é suportada de acordo com nossos Termos do serviço.
no-subscription-change = Desculpe, você não pode alterar seu plano de assinatura.
iap-already-subscribed = Você já assinou através da { $mobileAppStore }.
fxa-account-signup-error-2 = Um erro de sistema causou falha na sua assinatura do { $productName }. Não foi feita cobrança na sua forma de pagamento. Tente novamente.
fxa-post-passwordless-sub-error = Assinatura confirmada, mas houve falha no carregamento da página de confirmação. Verifique seu email para configurar sua conta.
newsletter-signup-error = Você não se inscreveu para receber emails de novidades do produto. Pode tentar novamente nas configurações da sua conta.
product-plan-error =
    .title = Problema ao carregar planos
product-profile-error =
    .title = Problema ao carregar perfil
product-customer-error =
    .title = Problema ao carregar o cliente
product-plan-not-found = Plano não encontrado
product-location-unsupported-error = Localização não suportada


coupon-success = Seu plano será renovado automaticamente pelo preço de tabela.
coupon-success-repeating = Seu plano será renovado automaticamente após { $couponDurationDate } pelo preço de tabela.


new-user-step-1-2 = 1. Crie uma { -product-mozilla-account }
new-user-card-title = Digite as informações do seu cartão
new-user-submit = Assinar agora


sub-update-payment-title = Informações de pagamento


pay-with-heading-card-only = Pagar com cartão
product-invoice-preview-error-title = Problema ao carregar a visão prévia da fatura
product-invoice-preview-error-text = Não foi possível carregar a visão prévia da fatura


subscription-iaperrorupgrade-title = Ainda não podemos mudar sua assinatura


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Confira sua alteração
sub-change-failed = Falha na alteração do plano
sub-update-acknowledgment = Seu plano mudará imediatamente. Será cobrado hoje um valor proporcional ao restante deste ciclo de faturamento. A partir de { $startingDate } será cobrado o valor total.
sub-change-submit = Confirmar alteração
sub-update-current-plan-label = Plano atual
sub-update-new-plan-label = Novo plano
sub-update-total-label = Novo total
sub-update-prorated-upgrade = Mudança proporcional


sub-update-new-plan-daily = { $productName } (diariamente)
sub-update-new-plan-weekly = { $productName } (semanalmente)
sub-update-new-plan-monthly = { $productName } (mensalmente)
sub-update-new-plan-yearly = { $productName } (anualmente)
sub-update-prorated-upgrade-credit = O saldo negativo exibido será aplicado como crédito em sua conta e usado em futuras faturas.


sub-item-cancel-sub = Cancelar assinatura
sub-item-stay-sub = Manter assinatura


sub-item-cancel-msg = Você não poderá mais usar o { $name } após { $period }, o último dia de seu ciclo de cobrança.
sub-item-cancel-confirm =
    Cancele meu acesso e minhas informações salvas dentro do
    { $name } em { $period }
sub-promo-coupon-applied = Cupom { $promotion_name } aplicado: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Este pagamento de assinatura resulta em um crédito no saldo da sua conta: <priceDetails></priceDetails>


sub-route-idx-reactivating = Falha na reativação da assinatura
sub-route-idx-cancel-failed = Falha no cancelamento da assinatura
sub-route-idx-contact = Entre em contato com o suporte
sub-route-idx-cancel-msg-title = Lamentamos ver você partir.
sub-route-idx-cancel-msg =
    Sua assinatura de { $name } foi cancelada.
          <br />
          Você continua tendo acesso a { $name } até { $date }.
sub-route-idx-cancel-aside-2 = Tem dúvidas? Visite o <a>Suporte { -brand-mozilla }</a>.


sub-customer-error =
    .title = Problema ao carregar o cliente
sub-invoice-error =
    .title = Problema ao carregar faturas
sub-billing-update-success = Suas informações de cobrança foram atualizadas com sucesso
sub-invoice-previews-error-title = Problema ao carregar visão prévia de faturas
sub-invoice-previews-error-text = Não foi possível carregar visão prévia de faturas


pay-update-change-btn = Alterar
pay-update-manage-btn = Gerenciar


sub-next-bill = Próxima cobrança em { $date }
sub-expires-on = Expira em { $date }




pay-update-card-exp = Expira em { $expirationDate }
sub-route-idx-updating = Atualizando informações de cobrança…
sub-route-payment-modal-heading = Informações de cobrança inválidas
sub-route-payment-modal-message-2 = Parece haver um erro com sua conta no { -brand-paypal }. Precisamos que você tome as medidas necessárias para resolver este problema de pagamento.
sub-route-missing-billing-agreement-payment-alert = Informações de pagamento inválidas. Há um erro em sua conta. <div>Gerenciar</div>
sub-route-funding-source-payment-alert = Informações de pagamento inválidas. Há um erro em sua conta. Este alerta pode demorar algum tempo para sumir após você atualizar suas informações com sucesso. <div>Gerenciar</div>


sub-item-no-such-plan = Não existe esse plano para esta assinatura.
invoice-not-found = Próxima fatura não encontrada
sub-item-no-such-subsequent-invoice = Próxima fatura não encontrada desta assinatura.
sub-invoice-preview-error-title = Visão prévia da fatura não encontrada
sub-invoice-preview-error-text = Visão prévia da fatura não foi encontrada para esta assinatura


reactivate-confirm-dialog-header = Quer continuar usando o { $name }?
reactivate-confirm-copy = Você continua tendo acesso ao { $name } e seu ciclo de cobrança e pagamento permanece o mesmo. A próxima cobrança será de { $amount } no cartão com final { $last } em { $endDate }.
reactivate-confirm-without-payment-method-copy = Você continua tendo acesso ao { $name } e seu ciclo de cobrança e pagamento permanece o mesmo. A próxima cobrança será de { $amount } em { $endDate }.
reactivate-confirm-button = Assinar novamente


reactivate-panel-copy = Você perderá o acesso a { $name } em <strong>{ $date }</strong>.
reactivate-success-copy = Obrigado! Está todo pronto.
reactivate-success-button = Fechar


sub-iap-item-google-purchase-2 = { -brand-google }: Compra no aplicativo
sub-iap-item-apple-purchase-2 = { -brand-apple }: Compra no aplicativo
sub-iap-item-manage-button = Gerenciar
