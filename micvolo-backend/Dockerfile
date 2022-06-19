FROM node:16-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=1337

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

CMD npm run start
