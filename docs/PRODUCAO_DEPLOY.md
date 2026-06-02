# Deploy de producao

O deploy automatico de producao do front roda a partir da branch `main`.
O workflow tambem aceita `master` caso essa branch venha a existir.

## URL

- Front: `https://laprovencevie.com.br/`
- API: `https://laprovencevie.com.br/api`

## GitHub Environment

Crie o environment `producao-front`.

Secrets obrigatorios:

- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`

Secret opcional:

- `PROD_SSH_PORT` (padrao `22`)

Variables:

- `PROD_WEB_DIR`: diretorio raiz servido pelo Nginx para `laprovencevie.com.br`.
- `VITE_API_URL`: opcional, padrao `https://laprovencevie.com.br/api`.
- `VITE_BASE_PATH`: opcional, padrao `/`.
- `VITE_RECAPTCHA_SITE_KEY`: site key publica do reCAPTCHA v3, se usada.

## Observacao

Nao aponte producao para `https://laprovence.hom-oud.com.br/api`.
