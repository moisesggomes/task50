FROM node:16-alpine

RUN apk update
RUN apk add sqlite

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080
ENV SESSION_SECRET="foo"
ENV SALT_LENGTH=8
ENV HASHED_PASSWORD_LENGTH=64

EXPOSE 8080

CMD [ "npm", "start" ]