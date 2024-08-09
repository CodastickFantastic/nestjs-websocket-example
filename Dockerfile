# Etap 1: Budowanie obrazu testowego
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAP 2: Uruchamianie testów
FROM build AS test
RUN npm run test:ci

# Etap 3: Budowanie obrazu produkcyjnego
FROM node:18 AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production

EXPOSE 3000

# Uruchomienie aplikacji
CMD ["node", "dist/main"]
