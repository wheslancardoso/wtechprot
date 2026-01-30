# ==================================================
# Dockerfile - Ambiente de Desenvolvimento Next.js 15
# ==================================================
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache libc6-compat

# Copiar arquivos de dependências
COPY package.json package-lock.json* .npmrc* ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar o restante do código fonte
COPY . .

# Expor porta do Next.js
EXPOSE 3000

# Variável de ambiente para development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

# Comando para iniciar em modo desenvolvimento
CMD ["npm", "run", "dev"]
