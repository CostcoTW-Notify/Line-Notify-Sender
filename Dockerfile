FROM node:lts-slim

ADD . /app

WORKDIR /app

RUN npm ci --only=production

EXPOSE 8000
CMD [ "npm", "start" ]



