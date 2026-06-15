FROM node:18-alpine
WORKDIR /app
# Kopiujemy pliki konfiguracyjne Node.js
COPY package*.json ./
# Instalujemy zależności
RUN npm install
# Kopiujemy resztę kodu
COPY . .
EXPOSE 8080
USER node
# Komenda, która uruchamia nasz serwer
CMD ["node", "server.js"]