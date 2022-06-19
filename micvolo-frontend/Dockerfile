FROM node:16-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY src ./src
COPY public ./public
COPY pages ./pages
COPY styles ./styles
COPY next.config.js .
COPY tsconfig.json .

CMD npm run dev