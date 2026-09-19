# **Lista de Casamentos — La Provence Decor**

## **Sobre o projeto**

Este repositório contém o **frontend em React** da **Lista de Casamentos da La Provence Decor**: uma plataforma para que noivos criem e gerenciem suas listas de presentes, e convidados possam visualizar e comprar itens.

O projeto nasceu como um protótipo estático em HTML/CSS/JS (mantido em `legacy/` como referência histórica) e já foi **migrado para React**, consumindo a API própria ([`laprovence-api`](../laprovence-api)) para catálogo, listas, autenticação e pagamentos.

---

## **Tecnologias**

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Roteamento:** [React Router DOM](https://reactrouter.com/) v6
- **Estado global:** [Zustand](https://github.com/pmndrs/zustand)
- **Pagamentos:** SDK PagBank (Pix e cartão de crédito com 3DS) + reCAPTCHA v3

---

## **Estrutura do projeto**

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Rotas da aplicação
├── pages/                # Telas: Index, Auth, Dashboard, Catalog, Checkout,
│                          # PublicList, Admin, Story, ResetPassword
├── components/
│   ├── layout/            # Navbar, Sidebar
│   ├── sections/          # Seções da landing (Hero, Features, FAQ, CTA, etc.)
│   └── ui/                # Componentes reutilizáveis (Modal, Toast, Skeleton, etc.)
├── services/              # Um arquivo por recurso da API (auth, catalogo, listas,
│                          # compras, premontadas, pagbank, recaptcha)
├── store/                 # Estado global (Zustand)
├── hooks/                 # Hooks customizados
├── utils/                 # Formatadores e validadores
└── data/                  # Seeds/dados estáticos auxiliares

legacy/                  # HTMLs do protótipo original (referência histórica)
css/                      # Estilos do protótipo original (referência histórica)
```

---

## **Rodando localmente**

```bash
npm install
npm run dev
```

Configure um `.env` na raiz com base no `.env.example`:

```env
VITE_API_URL="https://sua-api.com"
VITE_RECAPTCHA_SITE_KEY="sua_site_key_recaptcha_v3"
```

`VITE_RECAPTCHA_SITE_KEY` é opcional em desenvolvimento local; em homologação e produção deve ser configurada com uma chave reCAPTCHA v3 real.

---

## **Checkout PagBank**

O checkout React integrado oferece Pix e cartão de crédito. No cartão, os
dados são criptografados no navegador pelo SDK PagBank e a cobrança somente é
enviada após a autenticação 3DS retornar `AUTH_FLOW_COMPLETED`.

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

Há também um workflow `.github/workflows/security.yml` para auditoria de
dependências (`npm audit`).
