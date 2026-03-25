# Como rodar com Docker

## Desenvolvimento (recomendado)

```bash
docker compose up --build
```

Serviços disponíveis:
- **App (Next.js):** http://localhost:3000
- **API (Node.js):** http://localhost:4000
- **PostgreSQL:** localhost:5432

## Produção

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Comandos úteis

```bash
# Ver logs da API
docker logs people_api -f

# Ver logs do app
docker logs people_app -f

# Acessar banco de dados
docker exec -it people_db psql -U postgres -d people_registry

# Rodar migrations manualmente
docker exec people_api npx prisma migrate deploy

# Parar tudo
docker compose down

# Parar e remover dados do banco
docker compose down -v
```
