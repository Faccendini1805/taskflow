# Etapa de desarrollo
FROM node:22-alpine
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto de desarrollo
EXPOSE 5173

# Iniciar en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
