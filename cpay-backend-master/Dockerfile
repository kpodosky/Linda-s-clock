FROM node:18-alpine


WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn install

COPY  . .


RUN yarn run build

EXPOSE 4900

CMD [ "yarn",  "start" ]