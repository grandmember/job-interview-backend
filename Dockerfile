FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --ignore-scripts

COPY . .

CMD [ "node", "--trace-warnings","src/index.js" ]
