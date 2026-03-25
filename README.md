# People Registry

Sistema de cadastro e gerenciamento de atendimentos para feiras de saúde. Desenvolvido para a **IASD Jd. Nakamura**, permite registrar pessoas, acompanhar os serviços prestados, controlar filas por ticket e gerenciar a equipe de voluntários.

---

## Visão Geral

A aplicação é dividida em dois projetos:

- **Frontend** — Next.js (App Router) com Material UI
- **Backend** — Express.js com Prisma ORM e PostgreSQL

O sistema suporta dois perfis de usuário:

| Perfil | Capacidades |
|--------|------------|
| **Admin** | Cadastrar pessoas, visualizar dashboard, exportar dados, gerenciar equipe |
| **Membro** | Cadastrar pessoas e visualizar o dashboard (sem acesso à gestão de equipe) |

---

## Stack

### Frontend
- [Next.js](https://nextjs.org/) 14 (App Router)
- TypeScript
- Material UI (MUI) 7
- Zustand (gerenciamento de estado com persistência)
- React Hook Form + Zod (formulários e validação)
- jsPDF + jspdf-autotable (exportação PDF)
- XLSX (exportação Excel)
- Axios

### Backend
- [Express.js](https://expressjs.com/) 4
- TypeScript
- [Prisma ORM](https://www.prisma.io/) 7 + PostgreSQL 16
- JWT (autenticação stateless, 7 dias de validade)
- bcryptjs (hash de senhas)
- Zod (validação de entradas)

---

## Estrutura do Projeto

```
people-registry/
├── src/                        # Aplicação Next.js
│   ├── app/
│   │   ├── page.tsx            # Raiz — redireciona para /login ou /dashboard
│   │   ├── login/              # Página de login
│   │   ├── register/           # Página de registro de usuário
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard principal (abas: Cadastros, Serviços, Equipe)
│   │       └── new/page.tsx    # Formulário de cadastro de pessoa
│   ├── components/
│   │   ├── auth/               # LoginForm, RegisterForm
│   │   ├── layout/             # AppBar (navegação superior)
│   │   ├── people/             # PeopleTable, PersonForm (seções do formulário)
│   │   ├── services/           # ServicesDashboard (painel de tickets)
│   │   ├── team/               # TeamSection, AddMemberDialog
│   │   └── ui/                 # ConfirmDialog, FormSection (componentes reutilizáveis)
│   ├── store/                  # Zustand stores (auth, people, team)
│   ├── lib/                    # apiClient, viacep, exportPDF, exportExcel
│   └── types/                  # Interfaces e enums TypeScript
│
├── api/                        # Backend Express
│   ├── src/
│   │   ├── index.ts            # Servidor Express
│   │   ├── routes/             # auth.ts, people.ts, team.ts
│   │   ├── middleware/         # Verificação JWT e controle de roles
│   │   └── lib/                # prisma.ts, jwt.ts, validation.ts (schemas Zod)
│   └── prisma/
│       ├── schema.prisma       # Modelos do banco de dados
│       └── migrations/         # Histórico de migrations
│
├── docker-compose.yml          # Ambiente de desenvolvimento
├── docker-compose.prod.yml     # Ambiente de produção
├── Dockerfile                  # Next.js (produção)
├── Dockerfile.dev              # Next.js (desenvolvimento)
└── DOCKER.md                   # Guia detalhado de Docker
```

---

## Configuração e Execução

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Node.js 20+ (para desenvolvimento local sem Docker)

### Com Docker (recomendado)

**1. Clone o repositório**
```bash
git clone <url-do-repo>
cd people-registry
```

**2. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Crie um arquivo `api/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/people_registry
JWT_SECRET=troque-por-uma-chave-segura-de-pelo-menos-32-caracteres
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**3. Suba os containers**
```bash
docker compose up
```

Os serviços estarão disponíveis em:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Banco de dados**: localhost:5432

As migrations do Prisma rodam automaticamente na inicialização da API.

---

### Sem Docker (desenvolvimento local)

**1. Instale as dependências do frontend**
```bash
npm install
```

**2. Instale as dependências do backend**
```bash
cd api && npm install
```

**3. Gere o cliente Prisma e rode as migrations**
```bash
cd api
npx prisma migrate dev
npx prisma generate
```

**4. Inicie os servidores**

Em terminais separados:
```bash
# Frontend
npm run dev

# Backend
cd api && npm run dev
```

---

### Scripts disponíveis

**Frontend**
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Roda o ESLint |

**Backend (`api/`)**
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor com hot-reload (tsx watch) |
| `npm run build` | Compila TypeScript |
| `npm run start` | Inicia o build de produção |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:push` | Sincroniza schema sem migration |

---

## Variáveis de Ambiente

### Frontend

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL da API backend | `http://localhost:4000` |

### Backend

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | String de conexão PostgreSQL | — |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | — |
| `PORT` | Porta do servidor | `4000` |
| `CORS_ORIGIN` | URL permitida pelo CORS | `http://localhost:3000` |
| `NODE_ENV` | Ambiente (`development` / `production`) | `development` |

> **Produção:** Troque `JWT_SECRET` por uma chave forte e aleatória. Nunca use o valor padrão em ambientes expostos.

---

## Fluxo de Autenticação

1. **Registro** — Qualquer pessoa pode criar uma conta via `/register`. O usuário criado torna-se automaticamente **Admin**.
2. **Login** — Gera um token JWT com validade de 7 dias, armazenado no localStorage.
3. **Requisições autenticadas** — O token é enviado no header `Authorization: Bearer <token>` em todas as chamadas à API.
4. **Criação de membros** — Somente o Admin pode criar membros da equipe via painel. Membros não têm acesso à aba de equipe.

---

## Funcionalidades

### Cadastro de Pessoas

Acesse `/dashboard/new` para registrar uma nova pessoa. O formulário é dividido em seções:

- **Dados pessoais** — Nome completo, RG, telefone
- **Endereço** — CEP com preenchimento automático via [ViaCEP](https://viacep.com.br/), logradouro, complemento, bairro, cidade, estado
- **Denominação religiosa** — Seleção opcional entre as opções disponíveis
- **Serviços** — Checkboxes para cada serviço com campo de número de ticket
- **Perguntas** — Aceita estudo bíblico? Aceita visita?

**Denominações disponíveis:**
Católico, Evangélico/Cristão, Adventista do Sétimo Dia, Batista, Presbiteriano, Metodista, Pentecostal, Luterano, Ortodoxo, Espírita, Outro

**Serviços disponíveis:**
Oculista, Dentista, Cabeleireiro, Enfermagem, Nutrição, Esteticista, Bioimpedância, Psicólogo, Outros

---

### Dashboard — Aba Cadastros

- Cards de resumo: total de pessoas, com denominação, cidades distintas, cadastros do mês
- Busca em tempo real por nome, cidade ou RG
- Tabela com todas as pessoas cadastradas
- Visualização de detalhes por pessoa
- Exclusão com confirmação
- **Exportação para PDF** e **Excel** com todos os dados

---

### Dashboard — Aba Serviços

Painel de controle de tickets por serviço:

- Cards individuais por serviço com ícone e nome
- Barra de progresso mostrando tickets utilizados vs. capacidade (100 por serviço)
- Lista de tickets emitidos com nome do atendido no hover
- Chips de status coloridos (disponível / lotado)
- Totais consolidados no topo (total, utilizados, disponíveis)

---

### Dashboard — Aba Equipe (somente Admin)

- Lista de membros da equipe com contagem de cadastros realizados por cada um
- Botão para adicionar novo membro (abre modal com nome, e-mail e senha)
- Botão para remover membro (os cadastros realizados por ele são mantidos)

---

## API — Endpoints

### Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/register` | Não | Cria novo usuário (vira Admin) |
| `POST` | `/api/auth/login` | Não | Login, retorna token JWT |

### Pessoas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/people` | Sim | Lista pessoas do grupo |
| `POST` | `/api/people` | Sim | Cadastra nova pessoa |
| `DELETE` | `/api/people/:id` | Sim | Remove pessoa (valida grupo) |

### Equipe

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/team` | Admin | Lista membros da equipe |
| `POST` | `/api/team` | Admin | Cria novo membro |
| `DELETE` | `/api/team/:id` | Admin | Remove membro |

### Health Check

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | Não | Retorna `{ status: "ok", timestamp }` |

---

## Modelo de Dados

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   // "ADMIN" | "MEMBER"
  adminId   String?  // Para membros: aponta para o Admin responsável
  createdAt DateTime @default(now())
  people    Person[]
}

model Person {
  id                String   @id @default(cuid())
  fullName          String
  cep               String
  street            String
  complement        String   @default("")
  neighborhood      String
  city              String
  state             String
  idNumber          String
  phone             String
  hasDenomination   Boolean  @default(false)
  denomination      String?
  services          String[] // Nomes dos serviços selecionados
  serviceTickets    Json     // { "Oculista": "001", "Dentista": "042", ... }
  acceptsBibleStudy Boolean
  acceptsVisit      Boolean
  groupId           String   // Admin.id — agrupa pessoas por equipe
  createdById       String   // User.id de quem cadastrou
  createdAt         DateTime @default(now())
  userId            String
  user              User     @relation(...)
}
```

---

## Docker em Produção

Para subir em produção:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Diferenças do ambiente de produção:
- Builds otimizados multi-stage para menor tamanho de imagem
- API roda como usuário não-root (`apiuser`)
- Next.js em modo standalone
- Política de restart `always` em todos os serviços
- Migrations aplicadas com `prisma migrate deploy`

Consulte o [DOCKER.md](./DOCKER.md) para instruções detalhadas de deploy.

---

## Contribuindo

1. Fork o repositório
2. Crie sua branch (`git checkout -b feature/minha-feature`)
3. Commit suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request
