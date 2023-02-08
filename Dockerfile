FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN mkdir -p /usr/src/app/build
RUN mkdir -p /usr/src/app/uploads

RUN npm install

COPY . .

CMD [ "npm", "start" ]