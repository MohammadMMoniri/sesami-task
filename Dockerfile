FROM node:18-alpine

COPY ./assets/ /usr/src/app

WORKDIR /usr/src/app

RUN npm i

RUN mkdir /var/log/morgan

EXPOSE 3000

CMD ["npm", "run", "start"]


