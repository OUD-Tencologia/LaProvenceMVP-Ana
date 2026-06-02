# **Lista de Casamentos — La Provence Decor**

## **Sobre o projeto**

Este repositório contém o **protótipo de alta fidelidade** da **Lista de Casamentos da La Provence Decor**.

Atualmente, o projeto está sendo desenvolvido em **HTML**, com foco na construção inicial da interface, validação da experiência do usuário e definição dos principais fluxos da plataforma. A próxima etapa prevê a **migração para React**, visando maior escalabilidade, organização e manutenção do sistema.

---

## **Objetivo**

O projeto tem como objetivo desenvolver uma plataforma digital para **gestão de listas de casamento**, proporcionando uma experiência **elegante, intuitiva e funcional** para noivos, convidados e administradores.

---

## **Status do projeto**

- **Etapa atual:** Protótipo de alta fidelidade  
- **Tecnologia atual:** HTML, CSS e JavaScript  
- **Próxima fase:** Migração para React  

---

## **Finalidade do protótipo**

Este protótipo foi criado para:

- **validar a proposta visual da plataforma**
- **estruturar os fluxos principais de navegação**
- **simular a experiência do usuário**
- **servir como base para evolução técnica do sistema**

---

## **Próximos passos**

As próximas evoluções previstas para o projeto incluem:

- **migração da interface para React**
- **componentização das telas**
- **padronização e reaproveitamento de código**
- **facilidade de manutenção e expansão**
- **integração com regras de negócio e futuras APIs**

---

## **Checkout PagBank**

O checkout React integrado oferece Pix e cartão de crédito. No cartão, os
dados são criptografados no navegador pelo SDK PagBank e a cobrança somente é
enviada após a autenticação 3DS retornar `AUTH_FLOW_COMPLETED`.

Para executar o frontend, configure:

```env
VITE_API_URL="https://sua-api.com"
VITE_RECAPTCHA_SITE_KEY="sua_site_key_recaptcha_v3"
```

Em homologação e produção, a página deve ser servida em HTTPS. Se houver uma
Content Security Policy no servidor web, ela deve permitir o SDK em
`https://assets.pagseguro.com.br` e a abertura dos frames 3DS de
`*.cardinalcommerce.com` e `*.cardinaltrusted.com`.

O endereço de cobrança solicitado no fluxo de cartão é encaminhado diretamente
ao SDK para autenticação 3DS; a aplicação não o armazena.

---

## **Deploy de homologação**

O deploy automático de homologação roda a partir da branch `develop`. Todo push
nessa branch executa o workflow `.github/workflows/deploy-homologacao.yml`,
gera o build Vite e publica o conteúdo de `dist/` no GitHub Pages.

Antes do primeiro deploy:

1. Em **Settings > Pages**, selecione **GitHub Actions** como origem do site.
2. Configure o domínio customizado `laprovence.hom-oud.com.br`.
3. Em **Settings > Environments**, crie o ambiente `homologacao`.
4. No ambiente `homologacao`, configure as variáveis:
   - `VITE_API_URL`: URL da API de homologação. Se não for definida, o
     workflow usa `https://laprovence.hom-oud.com.br/api`.
   - `VITE_RECAPTCHA_SITE_KEY`: site key pública do reCAPTCHA, se usada.
   - `VITE_BASE_PATH`: opcional. Como homologação usa domínio próprio, o padrão
     é `/`.

A API de homologação deve responder em
`https://laprovence.hom-oud.com.br/api`. Como front e API usam o mesmo domínio,
as chamadas podem usar essa URL sem misturar dados de produção.
