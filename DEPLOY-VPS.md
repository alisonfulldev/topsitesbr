# Deploy na VPS (Magalu Cloud, instalação leve) — banco continua no Supabase

Como funciona: a cada push na `main`, o GitHub Actions faz o `next build`
(a parte pesada), publica a imagem no GHCR e entra na VPS por SSH para baixar e
reiniciar. Na VPS rodam só **Caddy** (HTTPS automático) e os containers dos apps.

Arquivos: `.github/workflows/deploy.yml`, `Dockerfile.ci`, pasta `deploy/`.

## 1. Criar a VM (Magalu Cloud)
- Região **br-se1**, **Ubuntu 24.04**, 2 GB+ de RAM, 20–40 GB de disco, IP público.
- Chave SSH: criar e baixar o `.pem`.
- Security Group: entrada TCP **22, 80, 443** de `0.0.0.0/0`.

## 2. Preparar a VM (uma vez)
No PowerShell, na pasta do projeto (troque `CHAVE.pem` e `IP`; o usuário pode ser
`ubuntu`, confira no console da Magalu):

```
scp -i CHAVE.pem -r deploy ubuntu@IP:~/
ssh -i CHAVE.pem ubuntu@IP "sudo bash ~/deploy/setup-vps.sh"
```

O script instala Docker, swap de 2 GB, firewall, fuso UTC, os crons e copia tudo
para `/opt/apps`.

Depois, preencha as variáveis (copiar da Vercel → Settings → Environment Variables):

```
ssh -i CHAVE.pem ubuntu@IP
nano /opt/apps/topsites.env
```

> Sem aspas nos valores. `STORAGE_DRIVER=supabase` é obrigatório.

## 3. GitHub (Settings → Secrets and variables → Actions)
- **Variables:** `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- **Secrets:**
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `VPS_HOST` = IP da VM
  - `VPS_USER` = `ubuntu`
  - `VPS_SSH_KEY` = conteúdo inteiro do `.pem` (incluindo as linhas BEGIN/END)

Então: Actions → **Build e deploy** → **Run workflow**. Leva ~15 min.

> As `NEXT_PUBLIC_*` são gravadas na imagem no build: mudou alguma, rode o workflow de novo.

## 4. Testar antes de virar o DNS
Na sua máquina, edite `C:\Windows\System32\drivers\etc\hosts` (como administrador)
e adicione `IP topsitebr.com.br`. O Caddy só emite o SSL depois do DNS real, então
nesse teste o navegador vai reclamar do certificado: pode prosseguir. Testar login,
admin e painel. Depois remova a linha do hosts.

Alternativa sem hosts: `ssh -i CHAVE.pem ubuntu@IP "cd /opt/apps && docker compose logs --tail 50 topsites"`
deve mostrar `Ready`.

## 5. Virada
1. DNS: registro **A** de `topsitebr.com.br` e de `www` → IP da VM (apagar os da Vercel).
2. Em 1–5 min o Caddy emite o SSL sozinho (`docker compose logs caddy`).
3. Asaas → Webhooks: confirmar que a URL é `https://topsitebr.com.br/...` (não muda).
4. Só depois de tudo funcionando, remover o projeto da Vercel.

## Operação do dia a dia (na VM, em `/opt/apps`)
| O quê | Comando |
|---|---|
| Status | `docker compose ps` |
| Logs | `docker compose logs -f topsites` |
| Reiniciar | `docker compose restart topsites` |
| Mudei o `topsites.env` | `docker compose up -d topsites` |
| Log dos crons | `tail -f /var/log/apps-cron.log` |
| Testar um cron agora | `docker compose exec -T topsites node scripts/run-cron.mjs due-date-reminder` |
| Memória | `free -h` e `docker stats --no-stream` |

## O que saiu da Vercel e agora fica no código
- Bloqueio de bots de IA/SEO → `middleware.ts`
- HSTS → `next.config.mjs`
- Crons → `deploy/crontab` + `scripts/run-cron.mjs`
- www → domínio principal → `deploy/Caddyfile`

## Fallback: build dentro da própria VPS (sem Actions)
Precisa de 4 GB+ de RAM. Na VM: clonar o repo e `docker build -t ghcr.io/alisonfulldev/topsitesbr:latest .`
(usa o `Dockerfile` completo), depois `docker compose up -d`.
