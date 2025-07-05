FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 80

ENV PORT=80
ENV NODE_ENV=production

CMD ["npm", "start"]