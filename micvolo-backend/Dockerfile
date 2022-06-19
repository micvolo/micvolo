FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 1337

ENV PORT=1337

CMD npm run start
