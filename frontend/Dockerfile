# Etapa 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Runner
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/.svelte-kit ./svelte-kit
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/svelte.config.js ./

EXPOSE 5173
CMD ["npm", "run", "preview"]
