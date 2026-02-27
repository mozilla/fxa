



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



resend-code-success-banner-heading = Um novo código foi enviado para seu email.
resend-link-success-banner-heading = Um novo link foi enviado para seu email.
resend-success-banner-description = Adicione { $accountsEmail } nos seus contatos para assegurar uma entrega tranquila.


brand-banner-dismiss-button-2 =
    .aria-label = Fechar aviso
brand-prelaunch-title = { -product-firefox-accounts } será renomeado para { -product-mozilla-accounts(capitalization: "lowercase") } em 1º de novembro
brand-prelaunch-subtitle = Você continua entrando na sua conta com o mesmo nome de usuário e senha. Não há nenhuma outra mudança nos produtos que você usa.
brand-postlaunch-title = Renomeamos { -product-firefox-accounts } para { -product-mozilla-accounts }. Você continua entrando na sua conta com o mesmo nome de usuário e senha. Não há nenhuma outra mudança nos produtos que você usa.
brand-learn-more = Saiba mais
brand-close-banner =
    .alt = Fechar aviso
brand-m-logo =
    .alt = Logotipo com m de { -brand-mozilla }


button-back-aria-label = Voltar
button-back-title = Voltar


recovery-key-download-button-v3 = Baixar e continuar
    .title = Baixar e continuar
recovery-key-pdf-heading = Chave de recuperação de conta
recovery-key-pdf-download-date = Gerada em: { $date }
recovery-key-pdf-key-legend = Chave de recuperação de conta
recovery-key-pdf-instructions = Essa chave permite recuperar seus dados criptografados no navegador (incluindo senhas, favoritos e histórico) caso você esqueça sua senha. Guarde em um lugar que você vai lembrar.
recovery-key-pdf-storage-ideas-heading = Lugares onde guardar a chave
recovery-key-pdf-support = Saiba mais sobre chave de recuperação de conta
recovery-key-pdf-download-error = Desculpe, houve um problema ao baixar a chave de recuperação de conta.


choose-newsletters-prompt-2 = Obtenha mais da { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Receba nossas últimas notícias e novidades de produtos
choose-newsletters-option-test-pilot =
    .label = Acesso antecipado para testar novos produtos
choose-newsletters-option-reclaim-the-internet =
    .label = Avisos de ações para recuperar o controle da internet


datablock-download =
    .message = Baixado
datablock-copy =
    .message = Copiado
datablock-print =
    .message = Impresso


datablock-inline-copy =
    .message = Copiado


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimado)
device-info-block-location-region-country = { $region }, { $country } (estimado)
device-info-block-location-city-country = { $city }, { $country } (estimado)
device-info-block-location-country = { $country } (estimado)
device-info-block-location-unknown = Local desconhecido
device-info-browser-os = { $browserName } em { $genericOSName }
device-info-ip-address = Endereço IP: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Senha
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetir senha
form-password-with-inline-criteria-signup-submit-button = Criar conta
form-password-with-inline-criteria-reset-new-password =
    .label = Nova senha
form-password-with-inline-criteria-confirm-password =
    .label = Confirmar senha
form-password-with-inline-criteria-reset-submit-button = Criar nova senha
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Senha
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetir senha
form-password-with-inline-criteria-match-error = As senhas não coincidem
form-password-with-inline-criteria-sr-too-short-message = A senha deve ter pelo menos 8 caracteres.
form-password-with-inline-criteria-sr-not-email-message = A senha não pode ter seu endereço de email
form-password-with-inline-criteria-sr-not-common-message = A senha não deve ser uma comumente usada.
form-password-with-inline-criteria-sr-requirements-met = A senha inserida atende todos os requisitos.
form-password-with-inline-criteria-sr-passwords-match = As senhas inseridas coincidem.


form-verify-code-default-error = Este campo é obrigatório


form-verify-totp-disabled-button-title-numeric = Insira o código de { $codeLength } dígitos para continuar
form-verify-totp-disabled-button-title-alphanumeric = Digite o código de { $codeLength } caracteres para continuar


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Chave de recuperação de conta { -brand-firefox }
get-data-trio-title-backup-verification-codes = Códigos de autenticação de backup
get-data-trio-download-2 =
    .title = Baixar
    .aria-label = Baixar
get-data-trio-copy-2 =
    .title = Copiar
    .aria-label = Copiar
get-data-trio-print-2 =
    .title = Imprimir
    .aria-label = Imprimir


alert-icon-aria-label =
    .aria-label = Alerta
icon-attention-aria-label =
    .aria-label = Atenção
icon-warning-aria-label =
    .aria-label = Aviso
authenticator-app-aria-label =
    .aria-label = Aplicativo de autenticação
backup-codes-icon-aria-label-v2 =
    .aria-label = Códigos de autenticação de backup ativados
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Códigos de autenticação de backup desativados
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperação ativado
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperação desativado
canadian-flag-icon-aria-label =
    .aria-label = Bandeira do Canadá
checkmark-icon-aria-label =
    .aria-label = Marcar
checkmark-success-icon-aria-label =
    .aria-label = Feito
checkmark-enabled-icon-aria-label =
    .aria-label = Ativado
close-icon-aria-label =
    .aria-label = Fechar mensagem
code-icon-aria-label =
    .aria-label = Código
error-icon-aria-label =
    .aria-label = Erro
info-icon-aria-label =
    .aria-label = Informação
usa-flag-icon-aria-label =
    .aria-label = Bandeira dos Estados Unidos


hearts-broken-image-aria-label =
    .aria-label = Um computador, um celular e a imagem de um coração partido em cada um
hearts-verified-image-aria-label =
    .aria-label = Um computador, um celular e um tablet com um coração pulsante em cada um
signin-recovery-code-image-description =
    .aria-label = Documento que contém texto oculto.
signin-totp-code-image-label =
    .aria-label = Um dispositivo com um código oculto de 6 dígitos.
confirm-signup-aria-label =
    .aria-label = Um envelope contendo um link
security-shield-aria-label =
    .aria-label = Ilustração para representar uma chave de recuperação de conta.
recovery-key-image-aria-label =
    .aria-label = Ilustração para representar uma chave de recuperação de conta.
password-image-aria-label =
    .aria-label = Uma ilustração para representar a digitação de uma senha.
lightbulb-aria-label =
    .aria-label = Ilustração para representar a criação de uma dica de onde guardou.
email-code-image-aria-label =
    .aria-label = Ilustração para representar um email contendo um código.
recovery-phone-image-description =
    .aria-label = Dispositivo móvel que recebe um código por mensagem de texto.
recovery-phone-code-image-description =
    .aria-label = Código recebido em um dispositivo móvel.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispositivo móvel com recursos de mensagens de texto SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Tela de dispositivo com códigos


inline-recovery-key-setup-signed-in-firefox-2 = Você está conectado neste { -brand-firefox }.
inline-recovery-key-setup-create-header = Proteja sua conta
inline-recovery-key-setup-create-subheader = Tem um minuto para proteger seus dados?
inline-recovery-key-setup-info = Crie uma chave de recuperação de conta, assim você pode restaurar os dados de navegação sincronizados, caso esqueça sua senha.
inline-recovery-key-setup-start-button = Criar chave de recuperação de conta
inline-recovery-key-setup-later-button = Mais tarde


input-password-hide = Ocultar senha
input-password-show = Exibir senha
input-password-hide-aria-2 = Sua senha está visível na tela.
input-password-show-aria-2 = Sua senha está oculta.
input-password-sr-only-now-visible = Agora sua senha está visível na tela.
input-password-sr-only-now-hidden = Agora sua senha está oculta.


input-phone-number-country-list-aria-label = Selecione um país
input-phone-number-enter-number = Insira o número do celular
input-phone-number-country-united-states = Estados Unidos
input-phone-number-country-canada = Canadá
legal-back-button = Voltar


reset-pwd-link-damaged-header = Link para redefinir senha danificado
signin-link-damaged-header = Link de confirmação danificado
report-signin-link-damaged-header = Link danificado
reset-pwd-link-damaged-message = O link que você clicou tem caracteres faltando. Pode ter sido corrompido pelo seu cliente de email. Copie o endereço com cuidado e tente novamente.


link-expired-new-link-button = Receber novo link


remember-password-text = Lembra sua senha?
remember-password-signin-link = Entrar


primary-email-confirmation-link-reused = Email principal já foi confirmado
signin-confirmation-link-reused = Acesso já confirmado
confirmation-link-reused-message = Esse link de confirmação já foi usado e só pode ser usado uma vez.


locale-toggle-select-label = Selecionar idioma
error-bad-request = Requisição inválida


password-info-balloon-why-password-info = Você precisa dessa senha para acessar dados criptografados armazenados conosco.
password-info-balloon-reset-risk-info = Redefinir significa potencialmente perder dados como senhas e favoritos.


password-strength-inline-min-length = Pelo menos 8 caracteres
password-strength-inline-not-email = Não ter seu endereço de email
password-strength-inline-not-common = Não ser uma senha comumente usada
password-strength-inline-confirmed-must-match = A confirmação corresponde à nova senha


account-recovery-notification-cta = Criar
account-recovery-notification-header-value = Não perca seus dados se esquecer sua senha
account-recovery-notification-header-description = Crie uma chave de recuperação de conta para restaurar os dados de navegação sincronizados, caso esqueça sua senha.
recovery-phone-promo-cta = Adicionar celular de recuperação
recovery-phone-promo-heading = Adicione proteção extra à sua conta com um celular de recuperação
recovery-phone-promo-description = Agora você pode entrar com uma senha de uso único via SMS, se não puder usar seu aplicativo de autenticação em duas etapas.
recovery-phone-promo-info-link = Saiba mais sobre recuperação e risco de troca de SIM
promo-banner-dismiss-button =
    .aria-label = Descartar aviso


ready-complete-set-up-instruction = Conclua a configuração inserindo a nova senha em seus outros dispositivos com { -brand-firefox }.
manage-your-account-button = Gerenciar sua conta
ready-use-service = Está tudo pronto para usar o { $serviceName }
ready-use-service-default = Já está tudo pronto para usar as configurações da conta
ready-account-ready = Sua conta está pronta!
ready-continue = Continuar
sign-in-complete-header = Acesso confirmado
sign-up-complete-header = Conta confirmada
primary-email-verified-header = Email principal confirmado


flow-recovery-key-download-storage-ideas-heading-v2 = Lugares para guardar a chave:
flow-recovery-key-download-storage-ideas-folder-v2 = Pasta em um dispositivo seguro
flow-recovery-key-download-storage-ideas-cloud = Armazenamento confiável em nuvem
flow-recovery-key-download-storage-ideas-print-v2 = Cópia física impressa
flow-recovery-key-download-storage-ideas-pwd-manager = Gerenciador de senhas


flow-recovery-key-hint-header-v2 = Adicione uma dica para ajudar a encontrar sua chave
flow-recovery-key-hint-message-v3 = Esta dica deve te ajudar a lembrar onde guardou a chave de recuperação de conta. A dica pode ser exibida durante a redefinição de senha para recuperar seus dados.
flow-recovery-key-hint-input-v2 =
    .label = Digite uma dica (opcional)
flow-recovery-key-hint-cta-text = Pronto
flow-recovery-key-hint-char-limit-error = A dica deve conter menos de 255 caracteres.
flow-recovery-key-hint-unsafe-char-error = A dica não pode conter caracteres unicode não seguros. São permitidos somente letras, números, sinais de pontuação e símbolos.


password-reset-warning-icon = Aviso
password-reset-chevron-expanded = Recolher aviso
password-reset-chevron-collapsed = Expandir aviso
password-reset-data-may-not-be-recovered = Os dados do seu navegador podem não ser recuperados
password-reset-previously-signed-in-device-2 = Tem um dispositivo em que você conectou na conta?
password-reset-data-may-be-saved-locally-2 = Seus dados de navegação podem estar salvos neste dispositivo. Redefina a senha, depois entre na sua conta para restaurar e sincronizar seus dados.
password-reset-no-old-device-2 = Tem um novo dispositivo, mas não tem acesso a nenhum dispositivo anterior?
password-reset-encrypted-data-cannot-be-recovered-2 = Desculpe, seus dados de navegação estão criptografados nos servidores do { -brand-firefox }, não podem ser recuperados.
password-reset-warning-have-key = Tem uma chave de recuperação de conta?
password-reset-warning-use-key-link = Use agora para redefinir a senha e manter seus dados


alert-bar-close-message = Fechar mensagem


avatar-your-avatar =
    .alt = Seu avatar
avatar-default-avatar =
    .alt = Avatar padrão




bento-menu-title-3 = Produtos { -brand-mozilla }
bento-menu-tagline = Mais produtos da { -brand-mozilla } que protegem sua privacidade
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navegador { -brand-firefox } para computador
bento-menu-firefox-mobile = Navegador { -brand-firefox } para dispositivos móveis
bento-menu-made-by-mozilla = Feito pela { -brand-mozilla }


connect-another-fx-mobile = Instale o { -brand-firefox } no celular ou tablet
connect-another-find-fx-mobile-2 = Encontre o { -brand-firefox } no { -google-play } ou na { -app-store }.


cs-heading = Serviços conectados
cs-description = Tudo que você usa ou está conectado.
cs-cannot-refresh = Desculpe, houve um problema ao atualizar a lista de serviços conectados.
cs-cannot-disconnect = Cliente não encontrado, não é possível desconectar
cs-logged-out-2 = Desconectado da conta em { $service }
cs-refresh-button =
    .title = Atualizar serviços conectados
cs-missing-device-help = Itens faltando ou duplicados?
cs-disconnect-sync-heading = Desconectar da sincronização


cs-disconnect-sync-content-3 = Seus dados de navegação permanecerão em <span>{ $device }</span>, mas não serão mais sincronizados com sua conta.
cs-disconnect-sync-reason-3 = Qual o principal motivo para desconectar <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Este dispositivo:
cs-disconnect-sync-opt-suspicious = É suspeito
cs-disconnect-sync-opt-lost = Foi perdido ou roubado
cs-disconnect-sync-opt-old = É antigo ou foi substituído
cs-disconnect-sync-opt-duplicate = Está duplicado
cs-disconnect-sync-opt-not-say = Prefiro não dizer


cs-disconnect-advice-confirm = Ok, entendi
cs-disconnect-lost-advice-heading = Desconectado dispositivo perdido ou roubado
cs-disconnect-lost-advice-content-3 = Como seu dispositivo foi perdido ou roubado, para manter suas informações seguras, você deve alterar a senha da sua { -product-mozilla-account } nas configurações da conta. Também deve buscar informações do fabricante do dispositivo sobre como apagar seus dados remotamente.
cs-disconnect-suspicious-advice-heading = Desconectado dispositivo suspeito
cs-disconnect-suspicious-advice-content-2 = Se o dispositivo desconectado for de fato suspeito, para manter suas informações seguras, você deve alterar a senha da sua { -product-mozilla-account } nas configurações da conta. Também deve alterar todas as outras senhas salvas no { -brand-firefox } digitando about:login na barra de endereços.
cs-sign-out-button = Desconectar


dc-heading = Coleta e uso de dados
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navegador { -brand-firefox }
dc-subheader-content-2 = Permitir que o serviço de { -product-mozilla-accounts } envie dados técnicos e de interação para a { -brand-mozilla }.
dc-subheader-ff-content = Para revisar ou atualizar as configurações de dados técnicos e de interação do navegador { -brand-firefox }, abra as configurações do { -brand-firefox } e percorra o painel de privacidade e segurança.
dc-opt-out-success-2 = Opção por não permitir feita com sucesso. { -product-mozilla-accounts(capitalization: "uppercase") } não irá enviar dados técnicos ou de interação para a { -brand-mozilla }.
dc-opt-in-success-2 = Obrigado! Compartilhar esses dados nos ajuda a melhorar as { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Desculpe, houve um problema ao alterar sua preferência de coleta de dados
dc-learn-more = Saiba mais


drop-down-menu-title-2 = Menu da { -product-mozilla-account }
drop-down-menu-signed-in-as-v2 = Conectado como
drop-down-menu-sign-out = Desconectar
drop-down-menu-sign-out-error-2 = Desculpe, houve um problema ao desconectar da sua conta


flow-container-back = Voltar


flow-recovery-key-confirm-pwd-heading-v2 = Digite a senha novamente por motivo de segurança
flow-recovery-key-confirm-pwd-input-label = Digite sua senha
flow-recovery-key-confirm-pwd-submit-button = Criar chave de recuperação de conta
flow-recovery-key-confirm-pwd-submit-button-change-key = Criar nova chave de recuperação de conta


flow-recovery-key-download-heading-v2 = Chave de recuperação de conta criada — Baixe e guarde agora
flow-recovery-key-download-info-v2 = Esta chave permite que você recupere seus dados caso esqueça sua senha. Baixe agora e guarde em algum lugar que você se lembre. Depois não poderá voltar a esta página.
flow-recovery-key-download-next-link-v2 = Continuar sem baixar


flow-recovery-key-success-alert = Criada chave de recuperação de conta


flow-recovery-key-info-header = Crie uma chave de recuperação de conta, para o caso de você esquecer sua senha
flow-recovery-key-info-header-change-key = Alteração da chave de recuperação de conta
flow-recovery-key-info-shield-bullet-point-v2 = Criptografamos dados de navegação, senhas, favoritos e muito mais. É ótimo para privacidade, mas você pode perder seus dados se esquecer sua senha.
flow-recovery-key-info-key-bullet-point-v2 = É por isso que criar uma chave de recuperação de conta é tão importante. Você pode usar para restaurar seus dados.
flow-recovery-key-info-cta-text-v3 = Começar
flow-recovery-key-info-cancel-link = Cancelar


flow-setup-2fa-manual-key-heading = Insira o código manualmente


flow-setup-2fa-backup-code-confirm-button-finish = Concluir


flow-setup-2fa-backup-code-dl-button-continue = Continuar


flow-setup-2fa-prompt-continue-button = Continuar


flow-setup-phone-confirm-code-heading = Digite o código de verificação
flow-setup-phone-confirm-code-instruction = Um código de 6 dígitos foi enviado por SMS para <span>{ $phoneNumber }</span>. Expira em 5 minutos.
flow-setup-phone-confirm-code-input-label = Digite o código de 6 dígitos
flow-setup-phone-confirm-code-button = Confirmar
flow-setup-phone-confirm-code-expired = O código expirou?
flow-setup-phone-confirm-code-resend-code-button = Reenviar código
flow-setup-phone-confirm-code-resend-code-success = Código enviado
flow-setup-phone-confirm-code-success-message-v2 = Adicionado celular de recuperação de conta


flow-setup-phone-submit-number-heading = Verifique seu número de celular
flow-setup-phone-verify-number-instruction = Você receberá uma mensagem de texto da { -brand-mozilla } com um código para verificar seu número. Não compartilhe esse código com ninguém.
flow-setup-phone-submit-number-info-message-v2 = Celular de recuperação de conta só está disponível nos Estados Unidos e no Canadá. Números VoIP e máscaras de celular não são recomendados.
flow-setup-phone-submit-number-legal = Ao fornecer seu número, você declara que concorda que ele seja salvo para podermos te enviar mensagens de texto, apenas para verificação de conta. Podem ser cobrados valores por mensagens e dados.
flow-setup-phone-submit-number-button = Enviar código


header-menu-open = Fechar menu
header-menu-closed = Menu de navegação do site
header-back-to-top-link =
    .title = Voltar ao início
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Ajuda


la-heading = Contas vinculadas
la-description = Você autorizou o acesso às seguintes contas.
la-unlink-button = Desvincular
la-unlink-account-button = Desvincular
la-set-password-button = Definir senha
la-unlink-heading = Desvincular da conta de terceiros
la-unlink-content-3 = Tem certeza que quer desvincular sua conta? Fazer isso não te desconecta automaticamente dos seus serviços. Para fazer isso, você precisa desconectar manualmente na seção de serviços conectados.
la-unlink-content-4 = Antes de desvincular sua conta, você deve definir uma senha. Sem uma senha, não há como você entrar após desvincular sua conta.
nav-linked-accounts = { la-heading }


modal-close-title = Fechar
modal-cancel-button = Cancelar
modal-default-confirm-button = Confirmar


modal-mfa-protected-cancel-button = Cancelar
modal-mfa-protected-confirm-button = Confirmar
modal-mfa-protected-code-expired = O código expirou?
modal-mfa-protected-resend-code-link = Enviar novo código por email.


mvs-verify-your-email-2 = Confirme seu email
mvs-enter-verification-code-2 = Digite o código de confirmação
mvs-enter-verification-code-desc-2 = Digite o código de confirmação enviado para <email>{ $email }</email> há cerca de 5 minutos.
msv-cancel-button = Cancelar
msv-submit-button-2 = Confirmar


nav-settings = Configurações
nav-profile = Perfil
nav-security = Segurança
nav-connected-services = Serviços conectados
nav-data-collection = Coleta e uso de dados
nav-paid-subs = Assinaturas pagas
nav-email-comm = Comunicações por email


tfa-replace-code-error-3 = Houve um problema ao substituir seus códigos de autenticação de backup
tfa-create-code-error = Houve um problema ao criar seus códigos de autenticação de backup
tfa-replace-code-success-alert-4 = Códigos de autenticação de backup atualizados


page-2fa-setup-title = Autenticação em duas etapas


avatar-page-title =
    .title = Foto do perfil
avatar-page-add-photo = Adicionar foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Tirar foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Remover foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Tirar outra foto
avatar-page-cancel-button = Cancelar
avatar-page-save-button = Salvar
avatar-page-saving-button = Salvando…
avatar-page-zoom-out-button =
    .title = Reduzir
avatar-page-zoom-in-button =
    .title = Ampliar
avatar-page-rotate-button =
    .title = Girar
avatar-page-camera-error = Não foi possível iniciar a câmera
avatar-page-new-avatar =
    .alt = nova foto de perfil
avatar-page-file-upload-error-3 = Houve um problema ao enviar sua foto de perfil
avatar-page-delete-error-3 = Houve um problema ao excluir sua foto de perfil
avatar-page-image-too-large-error-2 = O arquivo de imagem é grande demais para ser enviado


pw-change-header =
    .title = Alterar senha
pw-8-chars = Pelo menos 8 caracteres
pw-not-email = Não ser seu endereço de email
pw-change-must-match = A nova senha deve ser igual à digitada na confirmação
pw-commonly-used = Não ser uma senha comumente usada
pw-tips = Fique seguro, não reuse senhas. Veja mais dicas para <linkExternal>criar senhas fortes</linkExternal>.
pw-change-cancel-button = Cancelar
pw-change-save-button = Salvar
pw-change-forgot-password-link = Esqueceu a senha?
pw-change-current-password =
    .label = Digite a senha atual
pw-change-new-password =
    .label = Digite a nova senha
pw-change-confirm-password =
    .label = Confirme a nova senha
pw-change-success-alert-2 = Senha atualizada


pw-create-header =
    .title = Criar senha
pw-create-success-alert-2 = Senha definida
pw-create-error-2 = Desculpe, houve um problema ao definir sua senha


delete-account-header =
    .title = Excluir conta
delete-account-step-1-2 = Etapa 1 de 2
delete-account-step-2-2 = Etapa 2 de 2
delete-account-confirm-title-4 = Você pode ter conectado sua { -product-mozilla-account } a um ou mais dos seguintes produtos ou serviços { -brand-mozilla } que mantêm você protegido e produtivo na web:
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "uppercase") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sincronizando dados do { -brand-firefox }
delete-account-product-firefox-addons = Extensões do { -brand-firefox }
delete-account-acknowledge = Esteja ciente que ao excluir sua conta:
delete-account-chk-box-2 =
    .label = Você pode perder informações e recursos salvos dentro de produtos { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Reativar com este email pode não restaurar suas informações salvas
delete-account-chk-box-4 =
    .label = Quaisquer extensões e temas que você publicou em addons.mozilla.org serão excluídos
delete-account-continue-button = Continuar
delete-account-password-input =
    .label = Digite a senha
delete-account-cancel-button = Cancelar
delete-account-delete-button-2 = Excluir


display-name-page-title =
    .title = Nome de exibição
display-name-input =
    .label = Digite o nome de exibição
submit-display-name = Salvar
cancel-display-name = Cancelar
display-name-update-error-2 = Houve um problema ao atualizar seu nome de exibição
display-name-success-alert-2 = Nome de exibição atualizado


recent-activity-title = Atividade recente da conta
recent-activity-account-create-v2 = Conta criada
recent-activity-account-disable-v2 = Conta desativada
recent-activity-account-enable-v2 = Conta ativada
recent-activity-account-login-v2 = Iniciada entrada na conta
recent-activity-account-reset-v2 = Iniciada redefinição de senha
recent-activity-emails-clearBounces-v2 = Devoluções de email excluídas
recent-activity-account-login-failure = Falha na tentativa de entrar na conta
recent-activity-account-two-factor-added = Autenticação em duas etapas ativada
recent-activity-account-two-factor-requested = Autenticação em duas etapas solicitada
recent-activity-account-two-factor-failure = Falha na autenticação em duas etapas
recent-activity-account-two-factor-success = Autenticação em duas etapas bem-sucedida
recent-activity-account-two-factor-removed = Autenticação em duas etapas removida
recent-activity-account-password-reset-requested = Redefinição de senha requisitada pela conta
recent-activity-account-password-reset-success = Redefinição de senha da conta bem-sucedida
recent-activity-account-recovery-key-added = Chave de recuperação de conta ativada
recent-activity-account-recovery-key-verification-failure = Falha na verificação da chave de recuperação de conta
recent-activity-account-recovery-key-verification-success = Verificação da chave de recuperação de conta bem-sucedida
recent-activity-account-recovery-key-removed = Removida a chave de recuperação de conta
recent-activity-account-password-added = Nova senha adicionada
recent-activity-account-password-changed = Senha alterada
recent-activity-account-secondary-email-added = Endereço de email secundário adicionado
recent-activity-account-secondary-email-removed = Endereço de email secundário removido
recent-activity-account-emails-swapped = Emails primário e secundário invertidos
recent-activity-session-destroy = Saiu da sessão
recent-activity-account-recovery-phone-send-code = Código de celular de recuperação de conta enviado
recent-activity-account-recovery-phone-setup-complete = Configuração de celular de recuperação de conta concluída
recent-activity-account-recovery-phone-signin-complete = Acesso com celular de recuperação de conta concluído
recent-activity-account-recovery-phone-signin-failed = Falha ao acessar com celular de recuperação de conta
recent-activity-account-recovery-phone-removed = Celular de recuperação de conta removido
recent-activity-account-recovery-codes-replaced = Códigos de recuperação substituídos
recent-activity-account-recovery-codes-created = Códigos de recuperação criados
recent-activity-account-recovery-codes-signin-complete = Acesso com códigos de recuperação de conta concluído
recent-activity-password-reset-otp-sent = Enviado um código de confirmação de redefinição de senha
recent-activity-password-reset-otp-verified = Validado o código de confirmação de redefinição de senha
recent-activity-must-reset-password = É necessário redefinir a senha
recent-activity-unknown = Outra atividade da conta


recovery-key-create-page-title = Chave de recuperação de conta
recovery-key-create-back-button-title = Voltar à configuração


recovery-phone-remove-header = Remover número de celular de recuperação de conta
settings-recovery-phone-remove-info = Isto remove <strong>{ $formattedFullPhoneNumber }</strong> como celular de recuperação de conta.
settings-recovery-phone-remove-recommend = Recomendamos manter este método porque é mais fácil do que salvar códigos de autenticação de backup.
settings-recovery-phone-remove-recovery-methods = Se você excluir, certifique-se de ainda ter seus códigos de autenticação de backup salvos. <linkExternal>Comparar métodos de recuperação</linkExternal>
settings-recovery-phone-remove-button = Remover número de celular
settings-recovery-phone-remove-cancel = Cancelar
settings-recovery-phone-remove-success = Celular de recuperação de conta removido


page-setup-recovery-phone-heading = Adicionar celular de recuperação de conta
page-setup-recovery-phone-back-button-title = Voltar às configurações
page-setup-recovery-phone-step2-back-button-title = Alterar número de celular


add-secondary-email-step-1 = Etapa 1 de 2
add-secondary-email-error-2 = Houve um problema ao criar este email
add-secondary-email-page-title =
    .title = Email secundário
add-secondary-email-enter-address =
    .label = Digite um endereço de email
add-secondary-email-cancel-button = Cancelar
add-secondary-email-save-button = Salvar
add-secondary-email-mask = Máscaras de email não podem ser usadas como email secundário


add-secondary-email-step-2 = Etapa 2 de 2
verify-secondary-email-page-title =
    .title = Email secundário
verify-secondary-email-verification-code-2 =
    .label = Digite o código de confirmação
verify-secondary-email-cancel-button = Cancelar
verify-secondary-email-verify-button-2 = Confirmar
verify-secondary-email-please-enter-code-2 = Digite o código de confirmação enviado para <strong>{ $email }</strong> há cerca de 5 minutos.
verify-secondary-email-success-alert-2 = { $email } adicionado com sucesso


delete-account-link = Excluir conta
inactive-update-status-success-alert = Entrou com sucesso. Sua { -product-mozilla-account } e seus dados permanecerão ativos.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-cta = Obtenha uma verificação gratuita


profile-heading = Perfil
profile-picture =
    .header = Foto
profile-display-name =
    .header = Nome de exibição
profile-primary-email =
    .header = Email principal


progress-bar-aria-label-v2 = Etapa { $currentStep } de { $numberOfSteps }.


security-heading = Segurança
security-password =
    .header = Senha
security-password-created-date = Criada em { $date }
security-not-set = Não definida
security-action-create = Criar
security-set-password = Defina uma senha para sincronizar e usar determinados recursos de segurança da conta.
security-recent-activity-link = Ver atividade recente da conta
signout-sync-header = Sessão expirada
signout-sync-session-expired = Desculpe, algo deu errado. Saia da sua conta no menu do navegador e tente novamente.


tfa-row-backup-codes-title = Códigos de autenticação de backup
tfa-row-backup-codes-not-available = Nenhum código disponível
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } códigos restante
       *[other] { $numCodesAvailable } códigos restantes
    }
tfa-row-backup-codes-get-new-cta-v2 = Criar novos códigos
tfa-row-backup-codes-add-cta = Adicionar
tfa-row-backup-codes-description-2 = Este é o método de recuperação mais seguro se você não puder usar seu dispositivo móvel ou aplicativo de autenticação.
tfa-row-backup-phone-title-v2 = Celular de recuperação de conta
tfa-row-backup-phone-not-available-v2 = Nenhum número de celular adicionado
tfa-row-backup-phone-change-cta = Alterar
tfa-row-backup-phone-add-cta = Adicionar
tfa-row-backup-phone-delete-button = Remover
tfa-row-backup-phone-delete-title-v2 = Remover celular de recuperação de conta
tfa-row-backup-phone-delete-restriction-v2 = Se quiser remover o celular de recuperação de conta, adicione códigos de autenticação de backup ou desative primeiro a autenticação em duas etapas para evitar ficar sem acesso à sua conta.
tfa-row-backup-phone-description-v2 = Este é o método de recuperação mais fácil, caso você não possa usar o aplicativo de autenticação.
tfa-row-backup-phone-sim-swap-risk-link = Saiba mais sobre o risco de troca de SIM


switch-turn-off = Desativar
switch-turn-on = Ativar
switch-submitting = Enviando…
switch-is-on = ativado
switch-is-off = desativado


row-defaults-action-add = Adicionar
row-defaults-action-change = Alterar
row-defaults-action-disable = Desativar
row-defaults-status = Nenhum


rk-header-1 = Chave de recuperação de conta
rk-enabled = Ativado
rk-not-set = Não definido
rk-action-create = Criar
rk-action-change-button = Alterar
rk-action-remove = Remover
rk-key-removed-2 = Chave de recuperação da conta removida
rk-cannot-remove-key = Não foi possível remover a chave de recuperação da sua conta.
rk-refresh-key-1 = Atualizar chave de recuperação de conta
rk-content-explain = Restaure suas informações caso esqueça sua senha.
rk-cannot-verify-session-4 = Desculpe, houve um problema ao confirmar a sessão.
rk-remove-modal-heading-1 = Remover chave de recuperação de conta?
rk-remove-modal-content-1 = Caso você redefina sua senha, não poderá usar sua chave de recuperação de conta para acessar seus dados. Esta ação não pode ser desfeita.
rk-remove-error-2 = Não foi possível remover a chave de recuperação da sua conta
unit-row-recovery-key-delete-icon-button-title = Excluir chave de recuperação de conta


se-heading = Email secundário
    .header = Email secundário
se-cannot-refresh-email = Desculpe, houve um problema ao atualizar esse email.
se-cannot-resend-code-3 = Desculpe, houve um problema ao reenviar o código de confirmação
se-set-primary-successful-2 = { $email } agora é seu email principal
se-set-primary-error-2 = Desculpe, houve um problema ao alterar seu email principal
se-delete-email-successful-2 = { $email } excluído com sucesso
se-delete-email-error-2 = Desculpe, houve um problema ao excluir este email
se-verify-session-3 = Você precisa confirmar a sessão atual para realizar esta ação
se-verify-session-error-3 = Desculpe, houve um problema ao confirmar a sessão
se-remove-email =
    .title = Remover email
se-refresh-email =
    .title = Atualizar email
se-unverified-2 = não confirmado
se-resend-code-2 = Confirmação necessária. <button>Reenvie o código de verificação</button>, se ele não estiver na sua caixa de entrada ou pasta de spam.
se-make-primary = Tornar principal
se-default-content = Acesse sua conta se você não conseguir entrar no seu email principal.
se-content-note-1 = Nota: Usar um email secundário não restaura suas informações, você precisa de uma <a>chave de recuperação de conta</a> para isso.
se-secondary-email-none = Nenhum


tfa-row-header = Autenticação em duas etapas
tfa-row-enabled = Ativada
tfa-row-disabled-status = Desativado
tfa-row-action-add = Adicionar
tfa-row-action-disable = Desativar
tfa-row-button-refresh =
    .title = Atualizar autenticação em duas etapas
tfa-row-cannot-refresh = Desculpe, houve um problema ao atualizar a autenticação em duas etapas.
tfa-row-enabled-description = Sua conta está protegida pela autenticação em duas etapas. Ao entrar na sua { -product-mozilla-account }, você precisa inserir um código de uso único gerado por um aplicativo de autenticação.
tfa-row-enabled-info-link = Como isso protege sua conta
tfa-row-disabled-description-v2 = Ajude a proteger sua conta usando um aplicativo de autenticação de terceiros como segunda etapa para entrar na conta.
tfa-row-cannot-verify-session-4 = Desculpe, houve um problema ao confirmar a sessão
tfa-row-disable-modal-heading = Desativar autenticação em duas etapas?
tfa-row-disable-modal-confirm = Desativar
tfa-row-disable-modal-explain-1 = Esta ação não pode ser desfeita. Você também tem a opção de <linkExternal>substituir seus códigos de autenticação de backup</linkExternal>.
tfa-row-disabled-2 = Autenticação em duas etapas desativada
tfa-row-cannot-disable-2 = Não foi possível desativar a autenticação em duas etapas


terms-privacy-agreement-default-2 = Ao prosseguir, você declara que concorda com os <mozillaAccountsTos>Termos do serviço</mozillaAccountsTos> e <mozillaAccountsPrivacy>Aviso de privacidade</mozillaAccountsPrivacy>.


third-party-auth-options-or = ou
continue-with-google-button = Continuar com { -brand-google }
continue-with-apple-button = Continuar com { -brand-apple }


auth-error-102 = Conta desconhecida
auth-error-103 = Senha incorreta
auth-error-105-2 = Código de confirmação inválido
auth-error-110 = Token inválido
auth-error-114-generic = Você já tentou vezes demais. Tente novamente mais tarde.
auth-error-114 = Você já tentou vezes demais. Tente novamente { $retryAfter }.
auth-error-125 = A solicitação foi bloqueada por motivos de segurança
auth-error-129-2 = Você digitou um número de celular inválido. Verifique e tente novamente.
auth-error-138-2 = Sessão não confirmada
auth-error-139 = O email secundário deve ser diferente do email da sua conta
auth-error-155 = Token TOTP não encontrado
auth-error-156 = Código de autenticação de backup não encontrado
auth-error-159 = Chave de recuperação de conta inválida
auth-error-183-2 = Código de confirmação inválido ou vencido
auth-error-202 = Funcionalidade não ativada
auth-error-203 = Sistema indisponível, tente novamente mais tarde
auth-error-206 = Não foi possível criar senha, a senha já foi definida
auth-error-214 = Já existe o número de celular de recuperação de conta
auth-error-215 = Não existe o número de telefone de recuperação
auth-error-216 = Atingiu o limite de mensagens de texto
auth-error-218 = Não foi possível remover o celular de recuperação de conta, faltam códigos de autenticação de backup.
auth-error-219 = Este número de celular foi registrado em contas demais. Tente outro número.
auth-error-999 = Erro não esperado
auth-error-1001 = Tentativa de acesso cancelada
auth-error-1002 = A sessão expirou. Entre novamente para continuar.
auth-error-1003 = Armazenamento local ou cookies ainda estão desativados
auth-error-1008 = Sua nova senha deve ser diferente
auth-error-1010 = É necessário uma senha válida
auth-error-1011 = É necessário um email válido
auth-error-1018 = Seu email de confirmação foi devolvido. Digitou errado o email?
auth-error-1020 = Digitou errado o email? firefox.com não é um serviço de email válido
auth-error-1031 = É necessário informar sua idade para se cadastrar
auth-error-1032 = É necessário informar uma idade válida para se cadastrar
auth-error-1054 = Código de autenticação em duas etapas inválido
auth-error-1056 = Código de autenticação de backup inválido
auth-error-1062 = Redirecionamento inválido
auth-error-1064 = Digitou errado o email? { $domain } não é um serviço de email válido
auth-error-1066 = Máscaras de email não podem ser usadas para criar uma conta.
auth-error-1067 = Digitou errado o email?
recovery-phone-number-ending-digits = Número terminado em { $lastFourPhoneNumber }
oauth-error-1000 = Algo deu errado. Feche esta aba e tente novamente.


connect-another-device-signed-in-header = Você está conectado neste { -brand-firefox }
connect-another-device-email-confirmed-banner = Email confirmado
connect-another-device-signin-confirmed-banner = Acesso confirmado
connect-another-device-signin-to-complete-message = Entre na sua conta neste { -brand-firefox } para concluir a configuração
connect-another-device-signin-link = Entrar
connect-another-device-still-adding-devices-message = Ainda adicionando dispositivos? Entre na sua conta no { -brand-firefox } em outro dispositivo para concluir a configuração
connect-another-device-signin-another-device-to-complete-message = Entre na sua conta no { -brand-firefox } em outro dispositivo para concluir a configuração
connect-another-device-get-data-on-another-device-message = Quer ter suas abas, favoritos e senhas em outro dispositivo?
connect-another-device-cad-link = Conectar outro dispositivo
connect-another-device-not-now-link = Agora não
connect-another-device-android-complete-setup-message = Entre na sua conta no { -brand-firefox } para Android para concluir a configuração
connect-another-device-ios-complete-setup-message = Entre na sua conta no { -brand-firefox } para iOS para concluir a configuração


cookies-disabled-header = É necessário armazenamento local e cookies
cookies-disabled-enable-prompt-2 = Ative cookies e armazenamento local em seu navegador para acessar sua { -product-mozilla-account }. Fazer isso ativa funcionalidades como lembrar de você entre sessões.
cookies-disabled-button-try-again = Tentar novamente
cookies-disabled-learn-more = Saiba mais


index-header = Insira seu email
index-sync-header = Continuar para sua { -product-mozilla-account }
index-sync-subheader = Sincronize senhas, abas e favoritos onde quer que use o { -brand-firefox }.
index-relay-header = Criar uma máscara de email
index-relay-subheader = Indique o endereço de email para onde quer que sejam encaminhadas mensagens enviadas para sua máscara de email.
index-subheader-with-servicename = Continuar para { $serviceName }
index-subheader-default = Continuar para as configurações da conta
index-cta = Entrar na sua conta ou criar uma
index-account-info = Uma { -product-mozilla-account } também libera acesso a mais produtos de proteção de privacidade da { -brand-mozilla }.
index-email-input =
    .label = Insira seu email
index-account-delete-success = Conta excluída com sucesso
index-email-bounced = Seu email de confirmação foi devolvido. Digitou errado o email?


inline-recovery-key-setup-create-error = Não foi possível criar sua chave de recuperação de conta. Tente novamente mais tarde.
inline-recovery-key-setup-recovery-created = Criada chave de recuperação de conta
inline-recovery-key-setup-download-header = Proteja sua conta
inline-recovery-key-setup-download-subheader = Baixe e guarde agora
inline-recovery-key-setup-download-info = Guarde esta chave em algum lugar que você lembre. Você não poderá voltar a esta página mais tarde para ver a chave.
inline-recovery-key-setup-hint-header = Recomendação de segurança


inline-totp-setup-cancel-setup-button = Cancelar configuração
inline-totp-setup-continue-button = Continuar
inline-totp-setup-add-security-link = Adicione uma camada de segurança à sua conta, exigindo códigos de autenticação de um <authenticationAppsLink>desses aplicativos de autenticação</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Ative a autenticação em duas etapas <span>para continuar para as configurações da conta</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Ative a autenticação em duas etapas <span>para continuar para o { $serviceName }</span>
inline-totp-setup-ready-button = Pronto
inline-totp-setup-show-qr-custom-service-header-2 = Aponte a câmera para o código de autenticação <span>para continuar para o { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Digite o código manualmente <span>para continuar para o { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Aponte a câmera para o código de autenticação <span>para continuar para as configurações da conta</span>
inline-totp-setup-no-qr-default-service-header-2 = Digite o código manualmente <span>para continuar para as configurações da conta</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Digite esta chave secreta em seu aplicativo de autenticação. <toggleToQRButton>Prefere capturar o código QR?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Capture o código QR em seu aplicativo de autenticação, depois digite o código de autenticação que ele fornecer. <toggleToManualModeButton>Não consegue capturar o código?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Após concluir, ele começa a gerar códigos de autenticação para você digitar.
inline-totp-setup-security-code-placeholder = Código de autenticação
inline-totp-setup-code-required-error = Necessário código de autenticação
tfa-qr-code-alt = Use o código { $code } para configurar a autenticação em duas etapas em aplicativos suportados.


legal-header = Jurídico
legal-terms-of-service-link = Termos do serviço
legal-privacy-link = Política de privacidade


legal-privacy-heading = Aviso de privacidade


legal-terms-heading = Termos do serviço


pair-auth-allow-heading-text = Você acabou de entrar na sua conta no { -product-firefox }?
pair-auth-allow-confirm-button = Sim, aprovar dispositivo
pair-auth-allow-refuse-device-link = Se não foi você, <link>mude sua senha</link>


pair-auth-complete-heading = Dispositivo conectado
pair-auth-complete-now-syncing-device-text = Agora você está sincronizando com: { $deviceFamily } em { $deviceOS }
pair-auth-complete-sync-benefits-text = Agora você pode acessar suas abas abertas, senhas e favoritos em todos os seus dispositivos.
pair-auth-complete-see-tabs-button = Veja abas de dispositivos sincronizados
pair-auth-complete-manage-devices-link = Gerenciar dispositivos


auth-totp-heading-w-default-service = Digite o código de autenticação <span>para continuar para as configurações da conta</span>
auth-totp-heading-w-custom-service = Digite o código de autenticação <span>para continuar para o { $serviceName }</span>
auth-totp-instruction = Abra seu aplicativo de autenticação e digite o código de autenticação que ele fornecer.
auth-totp-input-label = Digite o código de 6 dígitos
auth-totp-confirm-button = Confirmar
auth-totp-code-required-error = Necessário código de autenticação


pair-wait-for-supp-heading-text = Agora é exigida aprovação <span>em seu outro dispositivo</span>


pair-failure-header = Conexão não concluída
pair-failure-message = O processo de configuração foi interrompido.


pair-sync-header = Sincronize o { -brand-firefox } em seu celular ou tablet
pair-cad-header = Conecte o { -brand-firefox } em outro dispositivo
pair-already-have-firefox-paragraph = Já tem o { -brand-firefox } em um celular ou tablet?
pair-sync-your-device-button = Sincronize seu dispositivo
pair-or-download-subheader = Ou baixe
pair-scan-to-download-message = Aponte a câmera para o código para baixar o { -brand-firefox } para dispositivos móveis ou envie para si mesmo um <linkExternal>link de download</linkExternal>.
pair-not-now-button = Agora não
pair-take-your-data-message = Tenha suas abas, favoritos e senhas onde quer que use o { -brand-firefox }.
pair-get-started-button = Introdução
pair-qr-code-aria-label = Código QR


pair-success-header-2 = Dispositivo conectado
pair-success-message-2 = Conexão bem-sucedida.


pair-supp-allow-heading-text = Confirmar conexão <span>de { $email }</span>
pair-supp-allow-confirm-button = Confirmar conexão
pair-supp-allow-cancel-link = Cancelar


pair-wait-for-auth-heading-text = Agora precisa aprovar <span>em seu outro dispositivo</span>


pair-unsupported-header = Conectar usando um aplicativo
pair-unsupported-message = Você usou a câmera do sistema? Você deve conectar usando um aplicativo { -brand-firefox }.


third-party-auth-callback-message = Aguarde, você está sendo redirecionado para o aplicativo autorizado.


account-recovery-confirm-key-heading = Digite sua chave de recuperação de conta
account-recovery-confirm-key-instruction = Esta chave recupera seus dados de navegação criptografados, como senhas e favoritos, dos servidores do { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Digite sua chave de recuperação de conta de 32 caracteres
account-recovery-confirm-key-hint = Sua dica de onde guardou é:
account-recovery-confirm-key-button-2 = Avançar
account-recovery-lost-recovery-key-link-2 = Não encontrou sua chave de recuperação de conta?


complete-reset-pw-header-v2 = Crie uma nova senha
complete-reset-password-success-alert = Senha definida
complete-reset-password-error-alert = Desculpe, houve um problema ao definir sua senha
complete-reset-pw-recovery-key-link = Usar chave de recuperação de conta
reset-password-complete-banner-heading = Sua senha foi redefinida.
reset-password-complete-banner-message = Não esqueça de gerar uma nova chave de recuperação de conta a partir das configurações da sua { -product-mozilla-account } para evitar futuros problemas de acesso.
complete-reset-password-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.


confirm-backup-code-reset-password-input-label = Insira o código de 10 caracteres
confirm-backup-code-reset-password-confirm-button = Confirmar
confirm-backup-code-reset-password-subheader = Digite um código de autenticação de backup
confirm-backup-code-reset-password-instruction = Digite um dos códigos de uso único que você salvou ao configurar a autenticação em duas etapas.
confirm-backup-code-reset-password-locked-out-link = Não consegue acessar sua conta?


confirm-reset-password-with-code-heading = Verifique seu email
confirm-reset-password-with-code-instruction = Enviamos um código de confirmação para <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Digite o código de 8 dígitos em até 10 minutos
confirm-reset-password-otp-submit-button = Avançar
confirm-reset-password-otp-resend-code-button = Reenviar código
confirm-reset-password-otp-different-account-link = Usar outra conta


confirm-totp-reset-password-header = Redefinição de senha
confirm-totp-reset-password-subheader-v2 = Insira o código de autenticação em duas etapas
confirm-totp-reset-password-instruction-v2 = Use um <strong>aplicativo de autenticação</strong> para redefinir a senha.
confirm-totp-reset-password-trouble-code = Problemas ao inserir o código?
confirm-totp-reset-password-confirm-button = Confirmar
confirm-totp-reset-password-input-label-v2 = Insira o código de 6 dígitos
confirm-totp-reset-password-use-different-account = Usar outra conta


password-reset-flow-heading = Redefinição de senha
password-reset-body-2 = Para manter sua conta segura, solicitaremos algumas informações que só você sabe.
password-reset-email-input =
    .label = Insira seu email
password-reset-submit-button-2 = Avançar


reset-password-complete-header = Sua senha foi redefinida
reset-password-confirmed-cta = Continuar para { $serviceName }




password-reset-recovery-method-header = Redefina sua senha
password-reset-recovery-method-subheader = Escolha um método de recuperação
password-reset-recovery-method-details = Vamos garantir que é mesmo você usando seus métodos de recuperação.
password-reset-recovery-method-phone = Celular de recuperação
password-reset-recovery-method-code = Códigos de autenticação de backup
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
password-reset-recovery-method-send-code-error-heading = Houve um problema ao enviar um código para seu celular de recuperação
password-reset-recovery-method-send-code-error-description = Tente novamente mais tarde ou use seus códigos de autenticação de backup.


reset-password-recovery-phone-code-submit-button = Confirmar
reset-password-recovery-phone-resend-code-button = Reenviar código
reset-password-recovery-phone-resend-success = Código enviado
reset-password-recovery-phone-general-error-description = Tente novamente mais tarde.
reset-password-with-recovery-key-verified-page-title = Senha redefinida com sucesso
reset-password-complete-new-password-saved = Nova senha salva!
reset-password-complete-recovery-key-created = Criada nova chave de recuperação de conta. Baixe e guarde agora mesmo.
reset-password-complete-recovery-key-download-info = Esta chave é essencial para recuperação de dados, caso esqueça sua senha. <b>Baixe e guarde com segurança agora mesmo, pois você não poderá acessar esta página novamente mais tarde.</b>


error-label = Erro:
validating-signin = Validando acesso…
complete-signin-error-header = Erro de confirmação
signin-link-expired-header = O link de confirmação expirou
signin-link-expired-message-2 = O link que você clicou expirou ou já foi usado.


signin-password-needed-header-2 = Digite a senha <span>da sua { -product-mozilla-account }</span>
signin-subheader-without-logo-with-servicename = Continuar para { $serviceName }
signin-subheader-without-logo-default = Continuar para as configurações da conta
signin-button = Entrar
signin-header = Entrar
signin-use-a-different-account-link = Usar outra conta
signin-forgot-password-link = Esqueceu a senha?
signin-password-button-label = Senha
signin-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.
signin-account-locked-banner-heading = Redefina a sua senha


report-signin-link-damaged-body = O link que você clicou tem caracteres faltando. Pode ter sido corrompido pelo seu cliente de email. Copie o endereço com cuidado e tente novamente.
report-signin-header = Denunciar acesso não autorizado?
report-signin-body = Você recebeu um email de tentativa de acesso à sua conta. Quer denunciar esta atividade como suspeita?
report-signin-submit-button = Denunciar atividade
report-signin-support-link = Por que isso está acontecendo?
report-signin-error = Desculpe, houve um problema ao enviar a denúncia.
signin-bounced-header = Desculpe. Bloqueamos a sua conta.
signin-bounced-message = O email de confirmação que enviamos para { $email } retornou e bloqueamos sua conta para proteger seus dados do { -brand-firefox }.
signin-bounced-help = Se este for um endereço de email válido, <linkExternal>avise-nos</linkExternal> e poderemos ajudar a desbloquear sua conta.
signin-bounced-create-new-account = Não tem mais este email? Crie outra conta
back = Voltar


signin-push-code-heading-w-default-service = Confirme este acesso para <span>continuar para as configurações da conta</span>
signin-push-code-heading-w-custom-service = Confirme este acesso para <span>continuar para o { $serviceName }</span>
signin-push-code-instruction = Verifique seus outros dispositivos e aprove este acesso no navegador { -brand-firefox }.
signin-push-code-did-not-recieve = Não recebeu a notificação?
signin-push-code-send-email-link = Enviar código por email


signin-push-code-confirm-instruction = Confirme seu acesso
signin-push-code-confirm-description = Detectamos uma tentativa de acesso feita pelo dispositivo a seguir. Se foi você, aprove o acesso
signin-push-code-confirm-verifying = Verificando
signin-push-code-confirm-login = Confirmar acesso
signin-push-code-confirm-wasnt-me = Não foi eu, mudar a senha.
signin-push-code-confirm-login-approved = Seu acesso foi aprovado. Feche esta janela.
signin-push-code-confirm-link-error = Link danificado. Tente novamente.


signin-recovery-method-header = Entrar
signin-recovery-method-subheader = Escolha um método de recuperação
signin-recovery-method-details = Vamos garantir que é mesmo você usando seus métodos de recuperação.
signin-recovery-method-phone = Celular de recuperação de conta
signin-recovery-method-code-v2 = Códigos de autenticação de backup
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
signin-recovery-method-send-code-error-heading = Houve um problema ao enviar um código para seu celular de recuperação de conta
signin-recovery-method-send-code-error-description = Tente novamente mais tarde ou use seus códigos de autenticação de backup.


signin-recovery-code-heading = Entrar
signin-recovery-code-sub-heading = Digite um código de autenticação de backup
signin-recovery-code-instruction-v3 = Digite um dos códigos de uso único que você salvou ao configurar a autenticação em duas etapas.
signin-recovery-code-input-label-v2 = Insira o código de 10 caracteres
signin-recovery-code-confirm-button = Confirmar
signin-recovery-code-phone-link = Usar celular de recuperação de conta
signin-recovery-code-support-link = Sua conta está bloqueada?
signin-recovery-code-required-error = Necessário código de autenticação de backup
signin-recovery-code-use-phone-failure = Houve um problema ao enviar um código para seu celular de recuperação de conta
signin-recovery-code-use-phone-failure-description = Tente novamente mais tarde.


signin-recovery-phone-flow-heading = Entrar
signin-recovery-phone-heading = Insira o código de recuperação
signin-recovery-phone-instruction-v3 = Um código de 6 dígitos foi enviado para o número de celular com final <span>{ $lastFourPhoneDigits }</span> por mensagem de texto. Expira em 5 minutos. Não compartilhe com ninguém.
signin-recovery-phone-input-label = Digite o código de 6 dígitos
signin-recovery-phone-code-submit-button = Confirmar
signin-recovery-phone-resend-code-button = Reenviar código
signin-recovery-phone-resend-success = Código enviado
signin-recovery-phone-locked-out-link = Você está sem acesso à sua conta?
signin-recovery-phone-send-code-error-heading = Houve um problema ao enviar um código
signin-recovery-phone-code-verification-error-heading = Houve um problema ao verificar seu código
signin-recovery-phone-general-error-description = Tente novamente mais tarde.
signin-recovery-phone-invalid-code-error-description = O código é inválido ou expirou.
signin-recovery-phone-invalid-code-error-link = Usar códigos de autenticação de backup em vez disso?
signin-recovery-phone-success-message = Conectado com sucesso. Limites podem ser aplicados se você usar novamente seu celular de recuperação.


signin-reported-header = Obrigado por sua vigilância
signin-reported-message = Nossa equipe foi notificada. Relatos como este nos ajudam a evitar intrusos.


signin-token-code-heading-2 = Digite o código de confirmação<span> da sua { -product-mozilla-account }</span>
signin-token-code-instruction-v2 = Insira o código enviado para <email>{ $email }</email> em até 5 minutos.
signin-token-code-input-label-v2 = Digite o código de 6 dígitos
signin-token-code-confirm-button = Confirmar
signin-token-code-code-expired = O código expirou?
signin-token-code-resend-code-link = Enviar novo código por email.
signin-token-code-required-error = Necessário código de confirmação
signin-token-code-resend-error = Algo deu errado. Não foi possível enviar um novo código.
signin-token-code-instruction-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.


signin-totp-code-header = Entrar
signin-totp-code-subheader-v2 = Insira o código de autenticação em duas etapas
signin-totp-code-instruction-v4 = Use um <strong>aplicativo de autenticação</strong> para confirmar seu acesso.
signin-totp-code-input-label-v4 = Insira o código de 6 dígitos
signin-totp-code-confirm-button = Confirmar
signin-totp-code-other-account-link = Usar outra conta
signin-totp-code-recovery-code-link = Problemas ao inserir o código?
signin-totp-code-required-error = Necessário código de autenticação
signin-totp-code-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.


signin-unblock-header = Autorizar este acesso
signin-unblock-body = Verifique se recebeu email com código de autorização, enviado para { $email }.
signin-unblock-code-input = Digite o código de autorização
signin-unblock-submit-button = Avançar
signin-unblock-code-required-error = Necessário código de autorização
signin-unblock-code-incorrect-length = O código de autorização deve ter 8 caracteres
signin-unblock-code-incorrect-format-2 = O código de autorização só pode conter letras e/ou números
signin-unblock-resend-code-button = Não chegou em sua caixa de entrada ou pasta de spam? Reenviar
signin-unblock-support-link = Por que isso está acontecendo?
signin-unblock-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.




confirm-signup-code-page-title = Digite o código de confirmação
confirm-signup-code-heading-2 = Digite o código de confirmação <span>da sua { -product-mozilla-account }</span>
confirm-signup-code-instruction-v2 = Insira o código enviado para <email>{ $email }</email> em até 5 minutos.
confirm-signup-code-input-label = Digite o código de 6 dígitos
confirm-signup-code-confirm-button = Confirmar
confirm-signup-code-code-expired = O código expirou?
confirm-signup-code-resend-code-link = Enviar novo código por email.
confirm-signup-code-success-alert = Conta confirmada com sucesso
confirm-signup-code-is-required-error = O código de confirmação é obrigatório
confirm-signup-code-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.


signup-relay-info = É necessária uma senha para gerenciar de forma segura suas máscaras de email e acessar as ferramentas de segurança da { -brand-mozilla }.
signup-change-email-link = Alterar email
