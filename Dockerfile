# biblioteca-eventos: la imagen que levanta el compose.yml de biblioteca-plataforma.
FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3010
CMD ["node", "dist/main.js"]