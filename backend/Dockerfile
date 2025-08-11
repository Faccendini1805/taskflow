FROM node:20

WORKDIR /app

# 1) Manifiestos e instalar TODAS las deps (incluye devDeps -> tsx)
COPY package*.json ./
RUN npm ci

# 2) Copiar Prisma y generar cliente
COPY prisma ./prisma
RUN npx prisma generate

# 3) Copiar el código
COPY src ./src

ENV NODE_ENV=development
EXPOSE 3000

CMD ["npm","run","dev"]
