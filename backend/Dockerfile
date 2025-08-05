# Etapa 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código y generar Prisma Client
COPY . .
RUN npx prisma generate

# Etapa 2: Runner
FROM node:22-alpine
WORKDIR /app

# Instalar OpenSSL en la imagen final
RUN apk add --no-cache openssl

# Copiar node_modules y código ya preparado
COPY --from=builder /app ./

# Crear archivo .env con la URL de la base de datos
RUN echo 'DATABASE_URL="postgresql://admin:12345678@db:5432/tareasdb?schema=public"' > .env

EXPOSE 3000

CMD ["npm", "run", "dev"]
