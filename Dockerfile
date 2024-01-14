FROM node:18-alpine

COPY ./assets/ /usr/src/app

WORKDIR /usr/src/app

RUN npm i

EXPOSE 3000

CMD ["npm", "run", "start"]


