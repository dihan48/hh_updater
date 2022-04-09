FROM node:lts-alpine

WORKDIR /opt/app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD npm start