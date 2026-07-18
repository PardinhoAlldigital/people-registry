# Deploy no Railway

O Railway **não usa** o `docker-compose`. Cada serviço é criado separadamente,
usando o mesmo repositório. São **3 serviços**:

```
Postgres (plugin)  ◄──  API (Express)  ◄──  App (Next.js)
```

---

## 1. Banco de dados

- **New → Database → PostgreSQL**
- O Railway cria a variável `DATABASE_URL` automaticamente.

## 2. Serviço da API

- **New → GitHub Repo** (o mesmo repositório)
- **Settings → Root Directory:** `api`
- **Settings → Build:** Dockerfile (detectado automaticamente; usa o stage `production`)
- **Variables:**

  | Variável        | Valor                                                        |
  |-----------------|-------------------------------------------------------------|
  | `DATABASE_URL`  | `${{Postgres.DATABASE_URL}}` (referência ao serviço Postgres) |
  | `JWT_SECRET`    | uma chave forte e aleatória (mín. 32 caracteres)            |
  | `CORS_ORIGIN`   | a URL pública do **App** (ex: `https://app-xxx.up.railway.app`) |
  | `NODE_ENV`      | `production`                                                 |

  > Não defina `PORT` — o Railway injeta automaticamente e a API já respeita `process.env.PORT`.

- **Settings → Networking → Generate Domain** para obter a URL pública da API.
- As migrations (`prisma migrate deploy`) rodam sozinhas no start (está no `CMD` do Dockerfile).

## 3. Serviço do App (Next.js)

- **New → GitHub Repo** (o mesmo repositório)
- **Settings → Root Directory:** `/` (raiz)
- **Variables:**

  | Variável               | Valor                                                     |
  |------------------------|-----------------------------------------------------------|
  | `NEXT_PUBLIC_API_URL`  | a URL pública da **API** (ex: `https://api-xxx.up.railway.app`) |

  > ⚠️ `NEXT_PUBLIC_API_URL` é **congelada no build**. O Railway passa as
  > variáveis do serviço como build args automaticamente, e o `Dockerfile`
  > já declara `ARG NEXT_PUBLIC_API_URL`. Se você mudar essa URL depois,
  > precisa **fazer um novo deploy** (rebuild) para valer.

- **Settings → Networking → Generate Domain** para obter a URL pública do App.

---

## Ordem recomendada (por causa das URLs cruzadas)

1. Cria o Postgres.
2. Cria a API, gera o domínio dela → anota a URL.
3. Cria o App com `NEXT_PUBLIC_API_URL` = URL da API, gera o domínio dele → anota a URL.
4. Volta na API e ajusta `CORS_ORIGIN` = URL do App.
5. Redeploy da API (para o CORS valer) e do App (se mudou alguma URL).

---

## Checklist rápido

- [ ] `JWT_SECRET` forte definido na API (nunca use o valor de exemplo)
- [ ] `CORS_ORIGIN` da API = URL pública do App
- [ ] `NEXT_PUBLIC_API_URL` do App = URL pública da API (build arg)
- [ ] `DATABASE_URL` da API referenciando o Postgres do Railway
