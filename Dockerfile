FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY app.js ./

RUN npm ci --only=production && npm cache clean --force

# Utilisateur non-root
USER node

EXPOSE 8080

CMD ["node", "app.js"]
