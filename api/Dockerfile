FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# All deps (dev + prod) — usado para compilar
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Somente deps de produção — vai para a imagem final
FROM base AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Development
FROM base AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 apiuser
COPY --from=prod-deps /app/node_modules ./node_modules
# cliente Prisma gerado no builder (não vem do npm ci)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
USER apiuser
EXPOSE 4000
# aplica migrations e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
