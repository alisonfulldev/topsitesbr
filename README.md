# Painel de Gestão de Sites

## Configuração do Supabase Storage

### 1. Obter as credenciais

Acesse o painel do seu projeto em [supabase.com](https://supabase.com) e siga os passos abaixo.

#### `NEXT_PUBLIC_SUPABASE_URL`

1. Menu lateral → **Settings** → **API**
2. Seção **Project URL** — copie o valor (`https://<project-ref>.supabase.co`)
3. Cole no `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
   ```

#### `SUPABASE_SERVICE_ROLE_KEY`

1. Menu lateral → **Settings** → **API**
2. Seção **Project API keys** → linha **service_role** → clique em **Reveal**
3. Copie a chave JWT (começa com `eyJ...`)
4. Cole no `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   ```

> **Atenção:** a chave `service_role` ignora todas as regras de segurança do banco. Nunca a coloque em variáveis com prefixo `NEXT_PUBLIC_`. No código ela é usada apenas em Server Actions e API Routes (servidor).

---

### 2. Criar os buckets no Supabase Storage

Acesse **Storage** no menu lateral do painel do Supabase.

#### Bucket `site-files`

Guarda o arquivo ZIP do site enviado pelo admin.

1. Clique em **New bucket**
2. Nome: `site-files`
3. **Public bucket**: ✅ marcado (para o cliente conseguir baixar o ZIP pela URL)
4. Clique em **Save**

#### Bucket `ticket-attachments`

Guarda as imagens enviadas pelo cliente nas solicitações de manutenção.

1. Clique em **New bucket**
2. Nome: `ticket-attachments`
3. **Public bucket**: ✅ marcado
4. Clique em **Save**

---

### 3. Regras de acesso (RLS)

O upload é feito pelo servidor usando a chave `service_role`, que ignora o RLS automaticamente — não é necessário criar nenhuma regra de INSERT.

Como os buckets são públicos, qualquer URL no formato `<supabase-url>/storage/v1/object/public/<bucket>/<caminho>` pode ser acessada sem autenticação. Isso é intencional: o acesso às páginas onde os arquivos aparecem já é protegido pelo login.

---

### 4. Variável `STORAGE_DRIVER`

```env
# local    → salva em public/uploads/ (sem dependências externas, ideal para desenvolvimento)
# supabase → Supabase Storage (produção)
STORAGE_DRIVER="supabase"
```

Com `STORAGE_DRIVER=local`, os arquivos ficam em `public/uploads/site-files/` e `public/uploads/ticket-attachments/` e são servidos pelo Next.js como arquivos estáticos. Nenhuma parte do código que chama `uploadSiteFile`, `uploadTicketAttachment` ou `getSiteFileUrl` precisa ser alterada — a troca é transparente.

---

### 5. Checklist antes do deploy (Supabase)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` preenchido no `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` preenchido no `.env`
- [ ] Bucket `site-files` criado (público)
- [ ] Bucket `ticket-attachments` criado (público)
- [ ] `STORAGE_DRIVER="supabase"` no `.env` de produção
- [ ] As mesmas variáveis configuradas na Vercel (Settings → Environment Variables) antes do deploy

---

## Configuração do Asaas (Pagamentos)

### 1. Obter a API Key

1. Acesse [asaas.com](https://asaas.com) e faça login
2. Menu superior direito → **Minha conta** → **Integrações**
3. Aba **API** → copie a chave no campo **API Key** (começa com `$aact_...`)
4. Cole no `.env`:
   ```
   ASAAS_API_KEY="$aact_..."
   ```

Para o **sandbox** (testes sem dinheiro real):
1. Acesse [sandbox.asaas.com](https://sandbox.asaas.com) e crie uma conta separada
2. Repita os passos acima dentro do ambiente sandbox
3. A API key do sandbox também começa com `$aact_...` mas aponta para `sandbox.asaas.com`

---

### 2. Variáveis de ambiente do Asaas

```env
ASAAS_API_KEY="$aact_..."          # chave da conta sandbox ou production
ASAAS_WEBHOOK_TOKEN="qualquer-string-secreta-que-voce-inventa"
ASAAS_ENV="sandbox"               # troque para "production" só quando for ao ar
PAYMENT_DRIVER="asaas"            # "mock" usa dados fictícios sem chamar a API
```

O `ASAAS_WEBHOOK_TOKEN` é uma string secreta que **você inventa** — pode ser qualquer coisa (ex: `meu-token-secreto-2024`). Você vai informar esse mesmo valor no painel do Asaas quando registrar a URL do webhook (próximo passo).

---

### 3. Cadastrar a URL do webhook no painel do Asaas

O Asaas precisa saber para qual URL enviar as notificações de pagamento.

1. No painel do Asaas (ou sandbox.asaas.com), vá em **Minha conta** → **Integrações** → **Webhooks**
2. Clique em **Adicionar webhook**
3. Preencha os campos:
   - **URL**: `https://seudominio.com.br/api/webhooks/asaas`
     - Em testes locais com ngrok: `https://xxxx.ngrok.io/api/webhooks/asaas`
   - **Token de acesso**: cole o mesmo valor que você colocou em `ASAAS_WEBHOOK_TOKEN`
   - **Eventos**: marque pelo menos:
     - `PAYMENT_RECEIVED` — pagamento confirmado (Pix/cartão em tempo real)
     - `PAYMENT_CONFIRMED` — boleto compensado (D+1 ou D+2)
     - `PAYMENT_OVERDUE` — pagamento vencido
4. Clique em **Salvar**

O sistema valida o token no header `asaas-access-token` de cada requisição. Se o token não bater, a rota retorna 401 e o evento é ignorado.

---

### 4. Testar no sandbox

O sandbox do Asaas permite simular pagamentos sem movimentar dinheiro real.

**Passo a passo:**

1. Configure `ASAAS_ENV="sandbox"` e `PAYMENT_DRIVER="asaas"` no `.env`
2. Use a API key do sandbox em `ASAAS_API_KEY`
3. Ative um plano por um cliente de teste — isso chama `createCustomer` + `createSubscription` na API sandbox e devolve um `paymentUrl` real do sandbox
4. Acesse o `paymentUrl` e use os dados de teste do Asaas para pagar:
   - **Boleto**: clique em "Pagar com boleto simulado" (o sandbox tem um botão para isso)
   - **Pix**: o sandbox gera um Pix de teste que você pode "pagar" direto na tela
5. O Asaas sandbox dispara o webhook para a URL cadastrada
6. Para testar localmente, use [ngrok](https://ngrok.com):
   ```bash
   ngrok http 3000
   # Copie a URL https://xxxx.ngrok.io e cadastre no webhook do sandbox
   ```
7. Verifique nos logs do Next.js que o evento chegou e que o banco foi atualizado

**Dica:** no sandbox você pode ir em **Cobranças** → selecionar uma cobrança → **Confirmar recebimento** para disparar o webhook manualmente sem precisar pagar de verdade.

---

### 5. Checklist antes do deploy (Asaas)

- [ ] Conta Asaas criada e verificada
- [ ] `ASAAS_API_KEY` de produção preenchido no `.env` e na Vercel
- [ ] `ASAAS_WEBHOOK_TOKEN` definido (igual no `.env` e no painel do Asaas)
- [ ] `ASAAS_ENV="production"` no `.env` de produção (e na Vercel)
- [ ] `PAYMENT_DRIVER="asaas"` no `.env` de produção (e na Vercel)
- [ ] Webhook cadastrado no painel do Asaas apontando para `https://seudominio.com.br/api/webhooks/asaas`
- [ ] Eventos `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED` e `PAYMENT_OVERDUE` habilitados no webhook

---

## Cloudflare Web Analytics (relatório de visitas do Plano Plus)

O card "Visitas do Site" do dashboard do cliente exibe dados reais para clientes do Plano Plus quando o site tem um **Analytics Site Tag** configurado. O painel do cliente do Plano Básico continua vendo o card bloqueado como incentivo de upgrade.

### 1. Como criar o site no painel do Cloudflare Web Analytics

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) e faça login.
2. No menu lateral, clique em **Web Analytics**.
3. Clique em **Add a site**.
4. Informe a URL do site do cliente (ex: `meucliente.github.io`) e clique em **Done**.
5. O Cloudflare gera um **script de rastreamento** e um **Site Tag** (ID único do site).

### 2. Onde copiar a tag `<script>` para colar no HTML

Após criar o site no Cloudflare Web Analytics, a tela mostra um snippet similar a:

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "SEU_SITE_TAG"}'></script>
```

Cole esse `<script>` antes do `</body>` no HTML do site do cliente — você faz isso manualmente ao publicar o site no GitHub Pages (ou onde estiver hospedado). A partir daí o Cloudflare começa a coletar dados de visitas.

### 3. Onde encontrar o Site Tag (o ID)

O **Site Tag** é o valor do atributo `token` dentro do `data-cf-beacon`. Exemplo:

```
data-cf-beacon='{"token": "a1b2c3d4e5f6789..."}'
                          ^^^^^^^^^^^^^^^^^^^^ este é o Site Tag
```

Você também pode encontrá-lo em **Web Analytics → Sites → (nome do site) → Settings → Manage Site**. Copie esse valor e cole no campo **Analytics Site Tag** ao cadastrar ou editar o site no painel admin.

### 4. Como gerar o API Token com permissão de leitura de Analytics

1. No painel do Cloudflare, clique no seu perfil (canto superior direito) → **My Profile**.
2. Vá em **API Tokens** → **Create Token**.
3. Clique em **Create Custom Token** e configure:
   - **Token name:** `TopSites Analytics Read`
   - **Permissions:** `Account` → `Account Analytics` → `Read`
   - **Account Resources:** selecione a sua conta (ou "All accounts")
4. Clique em **Continue to summary** → **Create Token**.
5. Copie o token gerado (ele aparece apenas uma vez) e adicione ao `.env` e à Vercel:

```env
CLOUDFLARE_API_TOKEN="seu-token-aqui"
CLOUDFLARE_ACCOUNT_ID="seu-account-id-aqui"
```

O **Account ID** fica na barra lateral direita da página inicial do Cloudflare (ou em **Overview** de qualquer domínio).

### 5. Checklist antes do deploy (Cloudflare Analytics)

- [ ] Conta Cloudflare criada
- [ ] Site criado no painel Web Analytics para cada cliente Plus
- [ ] Script `<script data-cf-beacon>` colado no HTML de cada site publicado
- [ ] `CLOUDFLARE_API_TOKEN` preenchido no `.env` e na Vercel (permissão `Account Analytics: Read`)
- [ ] `CLOUDFLARE_ACCOUNT_ID` preenchido no `.env` e na Vercel
- [ ] Campo **Analytics Site Tag** preenchido em cada site no painel admin
